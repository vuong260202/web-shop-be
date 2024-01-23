let exported = {}
module.exports = exported

var passport = require('passport');

function isLoggedIn(req, res, next) {
  // if (req.isAuthenticated()){
  //   console.log('req.isAuthenticated passed');
  //   return next();
  // } else {
  //   console.log('cookie expired');
  // }
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

function isAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    return next();
  }

  return res.status(403).json({
    status: 403,
    message: 'You do not have permission',
  });
}

function isOneOfRoles(roles) {
  return function (req, res, next) {
    if (req.user && roles && (roles instanceof Array) && roles.includes(req.user.role)) {
      return next()
    }
    return res.status(403).json({
      status: 403,
      message: 'You do not have permission',
    });
  }
}

function isProvider(req, res, next) {
  // return next()
  if (req.user && req.user.role === 'provider') {
    return next();
  }

  return res.status(403).json({
    status: 403,
    message: 'You do not have permission',
  });
}

function isExaminer(req, res, next) {
  if (req.user && req.user.role === 'examiner') {
    return next();
  }

  return res.status(403).json({
    status: 403,
    message: 'You do not have permission',
  });
}

function isLoggedIn1 (req, res, next) {
	// if (req.isAuthenticated()){
	// 	console.log('req.isAuthenticated passed');
	// 	return next();
	// } else {
	// 	console.log('cookie expired');
	// }
	if (req.headers.authorization) {
		console.log('checking jwt');
		return passport.authenticate('jwt-auth', { session: false })(req, res, next)
	}
	return res.status(401).end("Unauthorized")
}

exported.isLoggedIn = isLoggedIn
exported.isAdmin = isAdmin
exported.isExaminer = isExaminer
exported.isProvider = isProvider
exported.isOneOfRoles = isOneOfRoles