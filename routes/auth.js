var express = require('express');
var router = express.Router();
var passport = require('passport');
var randomstring = require("randomstring");
const jwt = require('jsonwebtoken');
const _ = require('lodash');

const CONFIG = require('../config');
const mailUtils = require('../utils/MailUtils');
const WebUtils = require('../utils/webUtils');
const valid = require('../utils/valid/authValidUtils');
const multer = require("multer");
const path = require("path");
const Joi = require("joi");
const bcrypt = require("bcrypt-nodejs");

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, '../web-shop-fe/public/img/avatar');
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({storage});


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
                username: account.username,
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

router.get('/detail', WebUtils.isLoggedIn, (req, res) => {
    return res.status(200).json({
        status: 200,
        data: req.user
    })
})

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

router.post('/update-profile', WebUtils.isLoggedIn, async (req, res) => {
    const {currentPassword, newPassword} = req.body;
    const User = global.sequelizeModels.User;

    try {

        await User.update({
            fullname: req.body.fullname,
            numberPhone: req.body.numberPhone,
            address: req.body.address,
            email: req.body.email
        }, {
            where: {
                id: req.user.id
            }
        })

        return res.status(200).json({
            status: 200,
            message: 'Updated user successfully'
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

router.post('/reset-password-request', async function(req, res, next) {
    const schema = Joi.object({
        email: Joi.string().email().required(),
    })
    let { error } = schema.validate(req.body)
    if (error) {
        console.log(error);
        return res.status(400).json({
            status: 400,
            message: (error.details && error.details[0]) ? error.details[0].message : 'Invalid params'
        })
    }

    let user = await global.sequelizeModels.User.findOne({where: {email: req.body.email}});
    if(!user) {
        return res.status(400).json({
            status: 400,
            message: 'Sorry, no account was found.' });
    }

    return next();
}, async (req, res) => {
    try {
        let user = await global.sequelizeModels.User.findOne({where: {email: req.body.email}});

        if (!user) {
            return res.status(400).json({
                status: 400,
                message: 'Sorry, no account was found.'
            });
        }

        const resetOtp = Math.floor(100000 + Math.random() * 900000);

        const expirationTime = new Date();
        expirationTime.setMinutes(expirationTime.getMinutes() + 10);

        user.resetToken = resetOtp;
        user.resetTokenExpiration = expirationTime;
        user.save();

        await mailUtils.transporter.sendMail(mailUtils.mailOptions(resetOtp, user), (error, info) => {
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

router.put('/reset-password', valid.ResetPassword, async (req, res) => {
    try {
        const {resetToken, newPassword} = req.body;

        const user = await global.sequelizeModels.User.findOne({where: {resetToken: resetToken}});

        const currentTime = new Date();

        if (user.resetTokenExpiration && currentTime > user.resetTokenExpiration) {
            return res.status(400).json({
                status: 400,
                message: 'Sorry, no account was found.'
            });
        }

        user.password = user.hashPassword(newPassword);
        user.resetToken = "";
        user.resetTokenExpiration = null;
        await user.save();

        return res.status(200).json({
            status: 200,
            message: "reset password successfully!"
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

router.post('/update-avatar', WebUtils.isLoggedIn, upload.single('file'), async (req, res) => {
    console.log(req.body);
    try {
        let user = req.user;

        console.log("user: ", req.file);

        req.file.path = req.file.path.replace(/\\/g, '/');
        user.avatar = req.file.path.slice(req.file.path.indexOf('/img/'));

        await global.sequelizeModels.User.update({
            avatar: user.avatar
        }, {
            where: {
                id: req.user.id
            }
        })

        return res.status(200).json({
            status: 200,
            message: 'Avatar updated successfully'
        })
    } catch (e) {
        console.error('An error occurred:', e);
        return res.status(500).json({
            status: 500,
            message: 'An error occurred while processing the request'
        });
    }
})

router.post('/login-with-google', async (req, res) => {
    console.log(req.body);

    try {
        let user = await global.sequelizeModels.User.findOne({
            where: {
                email: req.body.email
            }
        })

        console.log(user);

        let account;

        if (!user) {
            if (req.body.role === 'admin') {
                return res.status(400).json({
                    status: 400,
                    message: 'Sorry, no account was found.'
                })
            }

            let result = '';
            let isUsernameDone = true;

            let username;

            do {
                username = bcrypt.hashSync((Math.random(100000)).toString(), bcrypt.genSaltSync(8), null);
                const ur = await global.sequelizeModels.User.findOne({
                    where: {
                        username: username
                    }
                })

                if (!ur) {
                    isUsernameDone = true;
                } else {
                    isUsernameDone = false;
                }
            } while (isUsernameDone === false);

            let newUser = await global.sequelizeModels.User.create({
                username: username,
                password: bcrypt.hashSync('2002', bcrypt.genSaltSync(8), null),
                email: req.body.email,
                fullname: req.body.name,
                googleId: req.body.googleId
            })

            await newUser.save();

            account = newUser;
        } else {
            if (req.body.role !== user.role) {
                return res.status(400).json({
                    status: 400,
                    message: 'Sorry, no account was found.'
                })
            }

            user.googleId = req.body.googleId;
            await user.save();

            account = user;
        }

        let payload = {id: account.id};
        let token = jwt.sign(payload, CONFIG.app.jwtOptions.secretOrKey);

        return res.status(200).json({
            status: 200,
            data: {
                username: account.username,
                role: account.role,
                token: token,
                googleId: account.googleId
            }
        })
    } catch (err) {
        console.error('An error occurred:', err);
        return res.status(500).json({
            status: 500,
            message: 'An error occurred while processing the request'
        });
    }
})

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