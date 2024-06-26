var LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt;

const CONFIG = require('../config');

module.exports = function (passport, User) {
    // console.log('========================');
    // console.log('passport: ' + 'serializeUser called');
    // console.log('========================');
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(async function (id, done) {
        // console.log('========================');
        // console.log('passport: ' + 'deserializeUser called');
        // console.log('========================');
        let user = null
        try {
            user = await User.findByPk(id)
        } catch (err) {
            return done(err, null)
        }
        return done(null, user)
    });

    passport.use("local-login", new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true
    }, async function (req, username, password, done) {
        let user = null
        try {
            user = await User.findOne({
                where: {
                    username: username
                }
            })
            if (user) {
                console.log("log success: ", user.role);
            }

            if (user.role !== req.body.role) {
                return done("Your username or password was incorrect, please try again", false, req.flash("loginMessage", "Sai thông tin đăng nhập"), req.flash("oldEmail", username));
            }

        } catch (err) {
            return done(err)
        }
        if (!user) {
            return done("Your username or password was incorrect, please try again", false, req.flash("loginMessage", "Sai thông tin đăng nhập"), req.flash("oldEmail", username));
        }

        let now = new Date()
        if (user.attemptTimes >= 5) {
            if (user.lockedUntil.getTime() - now.getTime() > 0) {
                return done("Account Locked: You have exceeded the maximum number of failed login attempts. For security reasons, your account has been temporarily locked. Please wait for 24 hours", false, req.flash("loginMessage", "Sai thông tin đăng nhập"), req.flash("oldEmail", username));
            } else {
                user.lockedUntil = null
                user.attemptTimes = 0
                await user.save()
            }
        }

        if (!user.validPassword(password)) {
            await user.save()
            return done("Your username or password was incorrect, please try again", false, req.flash("loginMessage", "Sai thông tin đăng nhập"), req.flash("oldEmail", username));
        }

        // login acl
        req.session.userId = user.id;
        req.user = user

        // login passport
        done(null, user);
        user.lastLogin = new Date();
        user.save()

    }));

    passport.use('local-signup', new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        emailField: 'email',
        fullnameField: 'fullname',
        addressField: 'address',
        numberPhoneField: 'numberPhone',
        passReqToCallback: true
    }, async function (req, username, password, done) {
        let user = undefined
        try {
            user = await User.findOne({
                where: {
                    username: username
                }
            })
        } catch (err) {
            console.log("err");
            return done(err);
        }

      console.log(user);

        if (user) {
            console.log("exist");
            return done('Account already exists', false, req.flash("signupMessage", "Account already exist."));
        }
        var emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        var newUser = new User();

        newUser.username = username;
        newUser.password = newUser.hashPassword(password);

        if (req.body.email) {
            if (!emailRegex.test(req.body.email)) {
                console.log('invalid email');
                return done(null, false, req.flash('signupMessage', 'Invalid Email.'))
            }

            newUser.email = req.body.email;
        }

        if (req.body.fullname) {
            newUser.fullname = req.body.fullname;
        }

        if (req.body.address) {
            newUser.address = req.body.address;
        }

        if (req.body.phone) {
            newUser.phone = req.body.phone;
        }

        newUser.created_at = new Date();
        await newUser.save()

        return done(null, newUser);
    }));

    let opts = {}
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
    opts.secretOrKey = CONFIG.app.jwtOptions.secretOrKey;
    opts.expiresIn = CONFIG.app.jwtOptions.expiresIn
    passport.use('jwt-auth', new JwtStrategy(opts, async function (jwt_payload, done) {
        console.log('jwt_payload', jwt_payload);
        let user = null
        try {
            user = await User.findByPk(jwt_payload.id)
        } catch (err) {
            return done(err, false)
        }

        if (user) {
            return done(null, user);
        } else {
            return done(null, false);

        }
    }));
}