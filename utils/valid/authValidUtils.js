var Joi = require('joi');

let login = (req, res, next) => {
    let schema = Joi.object({
        username: Joi.string().required(),
        password: Joi.string().required(),
    })
    
    let { error } = schema.validate(req.body)

    if (error) {
        console.log(error);
        return res.status(400).json({
            status: 400,
            message: (error.details && error.details[0]) ? error.details[0].message : 'Invalid params'
        })
    }
    next();
}

let signup = function(req, res, next){
    const schema = Joi.object({
      username: Joi.string().required(),
      password: Joi.string().empty()
      .messages({
        'string.empty': '"Password" is not allowed to be empty',
        'string.pattern.base': 'Password must be in 8-16 characters, including at least 1 uppercase, 1 lowercase, 1 special character, 1 number',
        'string.min': 'Password must be in 8-16 characters, including at least 1 uppercase, 1 lowercase, 1 special character, 1 number',
        'string.max': 'Password must be in 8-16 characters, including at least 1 uppercase, 1 lowercase, 1 special character, 1 number'
      
      })
      .min(8).max(16)
      .pattern(/\d/)
      .pattern(/[a-z]/)
      .pattern(/[A-Z]/)
      .pattern(/[^a-zA-Z0-9]/)
      .required(),
      email: Joi.string().email().required(),
      fullname: Joi.string().required(),
    })
    let { error } = schema.validate(req.body)
    if (error) {
      console.log(error);
      return res.status(400).json({
        status: 400,
        message: (error.details && error.details[0]) ? error.details[0].message : 'Invalid params'
      })
    }
    return next();
}

let UpdatePassword = function(req, res, next){
    const schema = Joi.object({
      currentPassword: Joi.string().required(),
      newPassword: Joi.string().empty()
        .messages({
          'string.empty': '"Password" is not allowed to be empty',
          'string.pattern.base': 'Password must be in 8-16 characters, including at least 1 uppercase, 1 lowercase, 1 special character, 1 number',
          'string.min': 'Password must be in 8-16 characters, including at least 1 uppercase, 1 lowercase, 1 special character, 1 number',
          'string.max': 'Password must be in 8-16 characters, including at least 1 uppercase, 1 lowercase, 1 special character, 1 number'
        
        })
        .min(8).max(16)
        .pattern(/\d/)
        .pattern(/[a-z]/)
        .pattern(/[A-Z]/)
        .pattern(/[^a-zA-Z0-9]/)
        .required(),
      site: Joi.string().valid('admin', 'user').default('user').optional()
    })
    let { error } = schema.validate(req.body)
    if (error) {
      console.log(error);
      return res.status(400).json({
        status: 400,
        message: (error.details && error.details[0]) ? error.details[0].message : 'Invalid body'
      })
    }
  
    return next();
  }

let resetPassword = async function(req, res, next) {
  const schema = Joi.object({
    resetToken: Joi.string().required(),
    newPassword: Joi.string().empty()
      .messages({
        'string.empty': '"Password" is not allowed to be empty',
        'string.pattern.base': 'Password must be in 8-16 characters, including at least 1 uppercase, 1 lowercase, 1 special character, 1 number',
        'string.min': 'Password must be in 8-16 characters, including at least 1 uppercase, 1 lowercase, 1 special character, 1 number',
        'string.max': 'Password must be in 8-16 characters, including at least 1 uppercase, 1 lowercase, 1 special character, 1 number'
      })
      .min(8).max(16)
      .pattern(/\d/)
      .pattern(/[a-z]/)
      .pattern(/[A-Z]/)
      .pattern(/[^a-zA-Z0-9]/)
      .required(),
  })
  let { error } = schema.validate(req.body)
  if (error) {
    console.log(error);
    return res.status(400).json({
      status: 400,
      message: (error.details && error.details[0]) ? error.details[0].message : 'Invalid params'
    })
  }

  let user = await global.sequelizeModels.User.findOne({where: { resetToken: req.body.resetToken }});
  if (!user) {
    return res.status(400).json({
      status: 400,
      message: 'Sorry, no account was found.' });
  }

  return next();
}

let resetPasswordRequest = async function(req, res, next){
  const schema = Joi.object({
    username: Joi.string().required(),
  })
  let { error } = schema.validate(req.body)
  if (error) {
    console.log(error);
    return res.status(400).json({
      status: 400,
      message: (error.details && error.details[0]) ? error.details[0].message : 'Invalid params'
    })
  }

  let user = await global.sequelizeModels.User.findOne({where: {username: req.body.username}});
  if(!user) {
    return res.status(400).json({
      status: 400,
      message: 'Sorry, no account was found.' });
  }

  return next();
}

module.exports = {
    Login: login,
    Signup: signup,
    UpdatePassword: UpdatePassword,
    ResetPassword: resetPassword,
    ResetPasswordRequest: resetPasswordRequest
}