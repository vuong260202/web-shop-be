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
router.get('/', function (req, res, next) {
    res.redirect('/auth/login');
});

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

        let payload = {id: account.id};
        let token = jwt.sign(payload, CONFIG.app.jwtOptions.secretOrKey);
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

router.get('/get-role', WebUtils.isLoggedIn, (req, res) => {
    console.log(">>>user: ", req.user.role);
    return res.status(200).json({
        status: 200,
        data: {
            role: req.user.role
        }
    })
})

router.post("/signup", (req, res, next) => {
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

router.put('/update-password', WebUtils.isLoggedIn, valid.UpdatePassword, checkDbConnector, async (req, res) => {
    const {currentPassword, newPassword} = req.body;

    if (currentPassword.localeCompare(newPassword) == 0) {
        return res.status(400).json({
            status: 400,
            message: 'The new password you entered is the same as your previous password. Please choose another password and try again'
        })
    }

    try {
        const user = await global.sequelizeModels.User.findByPk(req.user.id);

        if (!user.validPassword(currentPassword)) {
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
            message: 'Password updated successfully'
        });
    } catch (e) {
        console.error('An error occurred:', e);
        return res.status(500).json(
            {
                status: 500,
                message: 'An error occurred while updating password'
            }
        );
    }
});

router.post('/reset-password-request', checkDbConnector, valid.ResetPasswordRequest, async (req, res) => {
    try {
        const {username} = req.body;
        let user = await global.sequelizeModels.User.findOne({where: {username: username}});
        if (!user) {
            return res.status(400).json({
                status: 400,
                message: 'Sorry, no account was found.'
            });
        }

        const resetToken = randomstring.generate(20);

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
                    message: 'An error occurred while sending email'
                });
            }

            return res.status(200).json({
                status: 200,
                message: 'Password reset link sent successfully'
            });
        });
    } catch (e) {
        console.error('An error occurred:', e);
        return res.status(500).json({
            status: 500,
            message: 'An error occurred while processing the request'
        });
    }
});

router.put('/reset-password', valid.ResetPassword, checkDbConnector, async (req, res) => {
    try {
        const {resetToken, newPassword} = req.body;

        const user = await global.sequelizeModels.User.findOne({where: {resetToken: resetToken}});

        const currentTime = new Date();

        if (user.resetTokenExpiration && currentTime > user.resetTokenExpiration) {
            return res.status(400).json({
                status: 400,
                message: 'Your Password reset link is expired. Please try again.'
            });
        }

        user.password = user.hashPassword(newPassword);
        user.resetToken = "";
        user.resetTokenExpiration = null;
        await user.save();

        let payload = {id: user.id};
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
            message: 'An error occurred while processing the request'
        });
    }
});

router.put('/check-token-expire', checkDbConnector, async (req, res) => {
    try {
        const {token} = req.body;

        const user = await global.sequelizeModels.User.findOne({where: {resetToken: token}});
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