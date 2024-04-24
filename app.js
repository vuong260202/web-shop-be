var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var helmet = require('helmet');
const cors = require('cors');
var logger = require('morgan');
var passport = require('passport');
var flash = require('connect-flash');
var session = require("express-session");
const MysqlStore = require('express-mysql-session')(session);
const bodyParser = require('body-parser');

let CONFIG = require('./config')

var app = express();
app.use(cors())
app.use(helmet())
app.use(flash());

require('./models/connectDB')

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.json());

require('./bootstrap')

app.use(cookieParser());
app.use(session({
    name: CONFIG.app.sessionCookieName,
    secret: "SecretKeyMy",
    resave: true,
    saveUninitialized: true,
    store: new MysqlStore({
        host: 'localhost',
        user: 'myrootuser',
        password: 'mysecretpassword',
        port: 3308,
        database: 'web_bh_online',
        createDatabaseTable: true,
        clearExpired: true,
        checkExpirationInterval: 900000,
        expiration: 86400000
    })
}));

app.use(logger('dev'));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({extended: true}));
//--------api
var indexRouter = require('./routes/index')
var authRouter = require('./routes/auth')
var productRouter = require('./routes/product')
var adminRouter = require('./routes/admin')
var qrRouter = require('./routes/qr')
var transactionRouter = require('./routes/transaction')
var categoryRouter = require('./routes/category')
var rateRouter = require('./routes/rate')
var feedbackRouter = require('./routes/feedback')
var chatRouter = require('./routes/chat')

app.use('/', indexRouter)
app.use('/auth', authRouter)
app.use('/product', productRouter)
app.use('/admin', adminRouter)
app.use('/gen-qr', qrRouter)
app.use('/transaction', transactionRouter)
app.use('/category', categoryRouter)
app.use('/rate', rateRouter)
app.use('/feedback', feedbackRouter)
app.use('/chat', chatRouter)

require('./service/startJob');

app.use((req, res, next) => {
    return res.status(404).json({
        status: 'error',
        error: '404 Not Found'
    })
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 400);
    res.json({
        status: 400,
        error: err.message
    })
});

module.exports = app;
