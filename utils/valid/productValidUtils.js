
let filterProduct = (req, res, next) => {
    const schema = Joi.object({
        sort: Joi.string().required(),
        filters: Joi.string().required(),
        page: Joi.number().integer().min(1).optional(),
        pageSize: Joi.number().integer().min(10).max(20).optional(),
    })
    let { error } = schema.validate(req.body)
    if (error) {
        console.log(error);
        return res.status(400).json({
        status: 400,
        message: (error.details && error.details[0]) ? error.details[0].message : 'Invalid body'
        })
    }
    
    return next()
}

let uploadProduct = (req, res, next) => {
    const schema = Joi.object({
        productName: Joi.string().required(),
        price: Joi.number().integer().required(),
        category: Joi.string().required(),
        total: Joi.number().integer().min(0).required(),
    })
    let { error } = schema.validate(req.body)
    if (error) {
        console.log(error);
        return res.status(400).json({
        status: 400,
        message: (error.details && error.details[0]) ? error.details[0].message : 'Invalid body'
        })
    }
    
    return next()
}

let updateProduct = (req, res, next) => {
    const schema = Joi.object({
        productId: Joi.number().integer().required(),
        attributes: Joi.object({
            productName: Joi.string().optional(),
            price: Joi.number().integer().optional(),
            category: Joi.string().optional(),
            total: Joi.number().integer().min(0).optional(),
        }).optional()
    });
    let { error } = schema.validate(req.body)
    if (error) {
        console.log(error);
        return res.status(400).json({
        status: 400,
        message: (error.details && error.details[0]) ? error.details[0].message : 'Invalid body'
        })
    }
    
    return next()
}

let deleteProduct = (req, res, next) => {
    const schema = Joi.object({
        productId: Joi.number().integer().required(),
    });
    let { error } = schema.validate(req.body)
    if (error) {
        console.log(error);
        return res.status(400).json({
        status: 400,
        message: (error.details && error.details[0]) ? error.details[0].message : 'Invalid body'
        })
    }
    
    return next()
}

module.exports = {
    FilterProduct: filterProduct,
    UploadProduct: uploadProduct,
    UpdateProduct: updateProduct,
    DeleteProduct: deleteProduct
}