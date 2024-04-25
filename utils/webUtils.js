let exported = {}
module.exports = exported

var passport = require('passport');

function isLoggedIn(req, res, next) {
  console.log(req.headers.authorization)
  if (req.headers.authorization) {
    console.log('checking jwt');
    return passport.authenticate('jwt-auth', { session: false }, (err, account) => {
      if (err) {
        console.log('err', err);
        return res.status(400).json({
          status: 400,
          message: (err.getMessage instanceof Function) ? err.getMessage() : (err + '')
        })
      }

      console.log(account);

      if (!account) {
        console.log('err', err);
        return res.status(401).json({
          status: 401,
          message: 'Unauthorized'
        })
      }

      req.login(account, err => {
        if (err) {
          return res.status(500).json({
            status: 500,
            message: 'Cannot login: ' + err
          })
        }
        return next()
      })
      // console.log('req.user', req.user);
      // console.log('req.user.email', req.user.username);
    })(req, res, next)
  }

  return res.status(401).json({
    status: 401,
    message: 'Unauthorized'
  })
}

function isLoggedIn1(req, res, next) {
  console.log(req.headers.authorization)
  if (req.headers.authorization) {
    console.log('checking jwt');
    return passport.authenticate('jwt-auth', { session: false }, (err, account) => {
      if (err) {
        console.log('err', err);
        return res.status(400).json({
          status: 400,
          message: (err.getMessage instanceof Function) ? err.getMessage() : (err + '')
        })
      }

      if (!account) {
        return next();
      }

      req.login(account, err => {
        if (err) {
          return res.status(500).json({
            status: 500,
            message: 'Cannot login: ' + err
          })
        }
        return next()
      })

    })(req, res, next)
  }
  return res.status(401).json({
    status: 401,
    message: 'Unauthorized'
  })
}

function isAdmin(req, res, next) {
  console.log(req.user);
  if (req.user && req.user.role === 'admin') {
    return next();
  }

  return res.status(403).json({
    status: 403,
    message: 'You do not have permission',
  });
}

function formatDate(date) {
  console.log(date);
  return date.toISOString().replace('T', ' ').replace('Z', '');
}

exported.isLoggedIn = isLoggedIn
exported.isLoggedIn1 = isLoggedIn1
exported.isAdmin = isAdmin
exported.formatDate = formatDate