var express = require('express');
var router = express.Router();

const CONFIG = require('../config');
const valid = require('../utils/valid/productValidUtils');
const {object} = require('joi');
const {BelongsTo, Op} = require("sequelize");
const {json} = require("express");


router.post('/filter-product', async (req, res) => {
    let {sort, filters} = req.body
    let page = req.body.page ? parseInt(req.body.page) : 1;
    let pageSize = req.body.pageSize ? parseInt(req.body.pageSize) : 10;

    let products, total

    console.log(filters);
    try {
        filterConditions = {}
        if (filters) {
            filterConditions['productName'] = {
                [Op.like]: `%${filters.productName}%`
            }
        }
        let conditions = {
            where: filterConditions,
            include:[
                {
                    association: new BelongsTo(global.sequelizeModels.Product, global.sequelizeModels.Category, {
                        as: 'category', foreignKey: 'categoryId', targetKey: 'id'
                    }),
                },
            ],
            offset: (page - 1) * pageSize,
            limit: pageSize,
            logging: console.log
        }

        if (sort) {
            conditions.order = [Object.entries(sort)]
        }

        console.log(conditions);
        const result = await global.sequelizeModels.Product.findAndCountAll(conditions);

        console.log(result);

        total = result.count;
        products = result.rows;

        return res.status(200).json({
            status: 200,
            data: {
                total: total,
                products: products
            }
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
router.post('/update-product', valid.UpdateProduct, async function (req, res) {
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
router.delete('/delete-product', async function (req, res) {
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

router.get('/product-detail/:id', async (req, res) => {
    try {
        let Category = global.sequelizeModels.Category;
        let Product = global.sequelizeModels.Product;
        console.log(req.params);
        let product = await Product.findOne({
            where: req.params,
            include:[
                {
                    association: new BelongsTo(Product, Category, {
                        as: 'category', foreignKey: 'categoryId', targetKey: 'id'
                    }),
                },
            ]
        })
        if (!product) {
            console.log("Product not found!")
            return res.status(400).json({
                status: 400,
                message: "Product not found!"
            });
        }

        product = product.dataValues;
        product.category = product.category.dataValues.categoryName;
        product.sizes = JSON.parse(product.sizes);

        console.log(product)

        return res.status(200).json({
            status: 200,
            data: product
        });
    } catch(err) {
        console.log('error: ', err);
        return res.status(500).json({
            status: 500,
            message: "Error internal server"
        })
    }
})


module.exports = router