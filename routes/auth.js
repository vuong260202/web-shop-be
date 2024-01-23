var express = require('express');
var router = express.Router();
var passport = require('passport');
var randomstring = require("randomstring");
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const _ = require('lodash');

const CONFIG = require('../config');

const mailUtils = require('../utils/MailUtils');
const WebUtils = require('../utils/webUtils');
const valid = require('../utils/valid/authValidUtils');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('/auth/login');
});

/**
 * @api {post} /auth/login Login to get jwt
 * @apiName Login JWT
 * @apiGroup Auth
 *
 * @apiBody {String} username username
 * @apiBody {String} password password
 * @apiBody {String=user,admin} [site=user] site to login
 *
 * @apiSuccess (200) {String} status 200
 * @apiSuccess (200) {Object} data response object
 * @apiSuccess (200) {String} data.token jwt token
 * @apiError (400) {Number} status 400
 * @apiError (400) {String} message the error
 * @apiError (500) {Number} status 500
 * @apiError (500) {String} message the error
 */
router.post("/login", (req, res, next) => {
  passport.authenticate('local-login', (err, account) => {
    if (err) {
      console.log('err', err);
      return res.status(400).json({
        status: 400,
        message: (err.getMessage instanceof Function) ? err.getMessage() : (err + '')
      })
    }

    if (!account) {
      return res.status(400).json({
        status: 400,
        message: 'Sorry, no account was found.'
      })
    }

    let roleToLogin = _.get(req.body, 'site', 'user')
    console.log('roleToLogin', roleToLogin);
    if (!['user', 'admin'].includes(roleToLogin)) {
      return res.status(400).json({
        status: 400,
        message: 'Invalid site'
      })
    }


    if (roleToLogin.localeCompare(account.role) != 0) {
      return res.status(400).json({
        status: 400,
        message: 'Sorry, no account was found.'
      })
    }

    let payload = { id: account.id };
    let opts = {}
    opts.expiresIn = CONFIG.app.jwtOptions.expiresIn
    let token = jwt.sign(payload, CONFIG.app.jwtOptions.secretOrKey, opts);
    return res.status(200).json({
      status: 200,
      data: {
        role: account.role,
        token: token
      }
    })
  })(req, res, next)
});

router.get('/logout', function (req, res) {

  // logout passport
  req.logout((err) => {
    if (err) {
      return res.status(500).json({
        status: 'error',
        error: err
      })
    }
    return res.status(200).json({
      status: 'success'
    })
  });

  // logout acl
  delete req.session.userId;
  // res.redirect('login');
})

/**
 * @api {post} /auth/signup add user account
 * @apiName add user
 * @apiGroup Auth
 *
 * @apiHeader {String} Authorization Bearer jwt
 *
 * @apiBody {String} email email
 * @apiBody {String} username username
 * @apiBody {String} password password
 * @apiBody {String} fullname fullname
 *
 * @apiSuccess (200) {String} status 200
 * @apiSuccess (200) {Object} data response object
 * @apiSuccess (200) {String} data.email user email
 * @apiError (400) {Number} status 400
 * @apiError (400) {String} message the error
 * @apiError (500) {Number} status 500
 * @apiError (500) {String} message the error
 */
router.post("/signup", valid.Signup, (req, res, next) => {
  passport.authenticate('local-signup', (err, account) => {
    if (err) {
      console.log('err', err);
      return res.status(409).json({
        status: 409,
        message: (err.getMessage instanceof Function) ? err.getMessage() : (err + '')
      })
    }

    if (!account) {
      console.log('err', err);
      return res.status(400).json({
        status: 400,
        message: 'Cannot create account'
      })
    }

    return res.status(200).json({
      status: 200,
      data: {
        username: account.username
      }
    })
  })(req, res, next)
});

/**
 * @api {put} auth/update-password change password user
 * @apiName update password
 * @apiGroup auth
 *
 * @apiHeader {String} Authorization Bearer jwt
 *
 * @apiBody {String} currentPassword old password
 * @apiBody {String} newPassword new password
 * @apiBody {String=examiner,provider,admin} [site=examiner] site
 *
 * @apiSuccess (200) {String} message Success message.
 * @apiError (400) {String} message Error message.
 */
router.put('/update-password', WebUtils.isLoggedIn, valid.UpdatePassword, checkDbConnector, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (currentPassword.localeCompare(newPassword) == 0) {
    return res.status(400).json({
      status: 400,
      message: 'The new password you entered is the same as your previous password. Please choose another password and try again'
    })
  }

  try {
    const user = await global.sequelizeModels.User.findByPk(req.user.id);

    if(!user.validPassword(currentPassword)) {
      return res.status(400).json({
            status: 400,
            message: 'Current password is incorrect'
          }
      );
    }

    user.password = user.hashPassword(newPassword);
    await user.save();

    return res.status(200).json({
      status: 200,
      message: 'Password updated successfully' });
  } catch (e) {
    console.error('An error occurred:', e);
    return res.status(500).json(
        {
          status: 500,
          message: 'An error occurred while updating password' }
    );
  }
});

/**
 * @api {post} auth/reset-password-request reset user password request
 * @apiName request reset password
 * @apiGroup auth
 *
 * @apiBody {String} username user username
 * @apiBody {String=user,admin} [site=user] site
 *
 * @apiSuccess (200) {String} message Success message.
 * @apiError (400) {String} message Error message.
 */
router.post('/reset-password-request', checkDbConnector, valid.ResetPasswordRequest, async (req, res) => {
  try {
    const { username } = req.body;
    let user = await global.sequelizeModels.User.findOne({where: {username: username}});
    if(!user) {
      return res.status(400).json({
        status: 400,
        message: 'Sorry, no account was found.'
      });
    }

    const resetToken =  randomstring.generate(20);
    
    const expirationTime = new Date();
    expirationTime.setMinutes(expirationTime.getMinutes() + 5);

    user.resetToken = resetToken;
    user.resetTokenExpiration = expirationTime;
    user.save();

    await mailUtils.transporter.sendMail(mailUtils.mailOptions(resetToken, user), (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({
          status: 500,
          message: 'An error occurred while sending email' });
      }

      return res.status(200).json({
        status: 200,
        message: 'Password reset link sent successfully' });
    });
  } catch (e) {
    console.error('An error occurred:', e);
    return res.status(500).json({
      status: 500,
      message: 'An error occurred while processing the request' });
  }
});

/**
 * @api {put} auth/reset-password Reset User Password
 * @apiName reset password
 * @apiGroup auth
 *
 * @apiBody {String} resetToken token reset password
 * @apiBody {String} newPassword new password
 * @apiBody {String=examiner,provider,admin} [site=examiner] site
 *
 * @apiSuccess (200) {String} message Success message.
 * @apiError (400) {String} message Error message.
 */
router.put('/reset-password', valid.ResetPassword, checkDbConnector, async (req,res) => {
  try {
    const {resetToken, newPassword} = req.body;

    const user = await global.sequelizeModels.User.findOne({where: { resetToken: resetToken }});

    const currentTime = new Date();

    if (user.resetTokenExpiration && currentTime > user.resetTokenExpiration) {
      return res.status(400).json({
        status: 400,
        message: 'Your Password reset link is expired. Please try again.' });
    }

    user.password = user.hashPassword(newPassword);
    user.resetToken = "";
    user.resetTokenExpiration = null;
    await user.save();

    let payload = { id: user.id };
    let opts = {}
    opts.expiresIn = CONFIG.app.jwtOptions.expiresIn
    let token = jwt.sign(payload, CONFIG.app.jwtOptions.secretOrKey, opts);
    return res.status(200).json({
      status: 200,
      data: {
        token: token
      }
    })

//    return res.status(200).json({ message: 'Password reset successfully' });
  } catch (e) {
    console.error('An error occurred:', e);
    return res.status(500).json({
      status: 500,
      message: 'An error occurred while processing the request'});
  }
});

/**
 * @api {put} auth/check-token-expire Check if token has expired
 * @apiName checkTokenExpire
 * @apiGroup auth
 *
 * @apiBody {String} token Token for password reset.
 *
 * @apiSuccess (200) {String} message Token is still valid.
 * @apiError (400) {String} message Invalid token or token has expired.
 * @apiError (500) {String} message Server error.
 */
router.put('/check-token-expire', checkDbConnector, async (req, res) => {
  try {
    const { token } = req.body;

    const user = await global.sequelizeModels.User.findOne({ where: { resetToken: token } });
    if (!user) {
      return res.status(400).json({
        status: 400, message:
        'Invalid token or token has expired'
      });
    }

    const currentTime = new Date();

    if (user.resetTokenExpiration && currentTime > user.resetTokenExpiration) {
      user.resetToken = "";
      user.resetTokenExpiration = null;
      await user.save();
      return res.status(400).json({
        status: 400,
        message: 'Invalid token or token has expired'
      });
    }

    return res.status(200).json({
      status: 200,
      message: 'Token is still valid'
    });
  } catch (e) {
    console.error('An error occurred:', e);
    return res.status(500).json({
      status: 500,
      message: 'Server error'
    });
  }
});

function checkDbConnector(req, res, next) {
  if (!global.sequelizeModels || !global.sequelizeModels.User) {
    return res.status(500).json({
      status: 500,
      message: 'Server has not finished starting yet'
    })
  }
  next()
}

module.exports = router;