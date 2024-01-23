var express = require('express');
var router = express.Router();

const CONFIG = require('../config');
const valid = require('../utils/valid/productValidUtils');
const { object } = require('joi');


/**
 * @api {post} product/filter-product get product list with conditions
 * @apiName filter product
 * @apiGroup product
 *
 * @apiBody {object} sort conditions sort
 * @apiBody {object} filter conditions filter
 * @apiBody {int} page page of site
 * @apiBody {int} pageSize maximum number of products for the site
 *
 * @apiSuccess (200) {object} data total and products list
 * @apiSuccess (200) {int} total number of products
 * @apiSuccess (200) {object} products products list of page
 *
 * @apiError (500) {string} message error message
 * @apiError (404) {string} page does not exist
 */
router.post('/filter-product', valid.FilterProduct, async (req, res) => {
    let {sort, filters} = req.body
    let page = req.body.page ? parseInt(req.body.page) : 1;
    let pageSize = req.body.pageSize ? parseInt(req.body.pageSize) : 10;

    let products, total
    try {
        let conditionFilters = {
            status: 'unsold'
        }

        if (filters) {
            for (let key in filters) {
                conditionFilters[key] = filters[key];
            }
        }

        let conditions = {
            where: conditionFilters,
            offset: (page - 1) * pageSize,
            limit: pageSize
        };

        if (sort) {
            conditions.order = [Object.entries(sort)]
        }

        const result = await global.SequelizeModels.Product.findAndCountAll(conditions);
        total = result.count;
        products = result.rows;
    } catch (err) {
        console.log('error: ', err);
        return res.status(500).json({
            status: 500,
            message: 'Server internal error.'
        })
    }

    return res.status(200).json({
        status: 200,
        data: {
            total: total,
            products: products
        }
    })
})


/**
 * @api {post} product/upload-product create product
 * @apiName create product
 * @apiGroup product
 *
 * @apiBody {String} productName of product
 * @apiBody {int} price price of product
 * @apiBody {String} category category of product
 * @apiBody {int} total total of product
 *
 * @apiSuccess (200) {String} message message success
 *
 * @apiError (500) {string} message error message
 * @apiError (400) {string} message error message
 */
router.post('/upload-product', valid.UploadProduct, async (req, res) => {
    let Product = global.SequelizeModels.Product

    try {
        let newProduct = new Product()
        newProduct.productName = req.body.productName
        newProduct.price = req.body.price
        newProduct.category = req.body.category
        newProduct.total = req.body.total
        newProduct.status = 'unsold'

        await newProduct.save()
    } catch (err) {
        console.log('error: ', err);
        return res.status(500).json({
            status: 500,
            message: 'Server internal error.'
        })
    }

    return res.status(200).json({
        status: 200,
        message: 'upload product successfully'
    })
})

/**
 * @api {post} product/update-product update product
 * @apiName update product
 * @apiGroup product
 *
 * @apiBody {int} productId id of product
 * @apiBody {object} attributes list attribute of product to be update
 * @apiBody {String} productName of product
 * @apiBody {int} price price of product
 * @apiBody {String} category category of product
 * @apiBody {int} total total of product
 * @apiBody {string=[sold, unsold]} status status of product
 *
 * @apiSuccess (200) {String} message message success
 *
 * @apiError (500) {string} message error message
 * @apiError (400) {string} message error message
 */
router.post('/update-product', valid.UpdateProduct, async function(req, res) {
    try {
        let product = await global.SequelizeModels.Product.findOne({
            where: {
                id: req.body.productId
            }
        })

        if (!product) {
            return res.status(400).json({
                status: 400,
                message: 'Product does not exits.'
            })
        }

        if (req.body.attribute) {
            for (let attribute in req.body.attributes) {
                product[attribute] = attributes[attribute]
            }

            await product.save();
        }
        
        return res.status(200).json({
            status: 200,
            message: 'Product updated successfully',
            product
        })
    } catch (err) {
        console.log('error: ', err);
        return res.status(500).json({
            status: 500,
            message: 'Server internal error.'
        })
    }
})

/**
 * @api {delete} product/delete-product Delete a product
 * @apiName deleteProduct
 * @apiGroup product
 *
 * @apiBody {Number} productId ID of the product to be deleted
 *
 * @apiSuccess {String} message Deletion success message
 *
 * @apiError (404) {String} message Product not found
 * @apiError (500) {String} message Server error message
 */
router.delete('/delete-product', async function(req, res) {
    try {
        const productId = req.body.productId;

        const product = await global.SequelizeModels.Product.findOne({
            where: {
                id: productId
            }
        });

        if (!product) {
            return res.status(404).json({
                status: 404,
                message: 'Product not found.'
            });
        }

        await product.destroy();

        return res.status(200).json({
            status: 200,
            message: 'Product deleted successfully.'
        });
    } catch (err) {
        console.log('error: ', err);
        return res.status(500).json({
            status: 500,
            message: 'Server internal error.'
        });
    }
});

router.post('/update-product', (req, res) => {
    return res.status(400).json({
        status: 400,
        message: 'Product does not exits.'
    })
})



module.exports = router