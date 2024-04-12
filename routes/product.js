var express = require('express');
var router = express.Router();

const CONFIG = require('../config');
const valid = require('../utils/valid/productValidUtils');
const {BelongsTo, Op} = require("sequelize");
const webUtils = require('../utils/webUtils');


router.post('/filter-product', async (req, res) => {
    let {sort, filters, type} = req.body
    let page = req.body.page ? parseInt(req.body.page) : 1;
    let pageSize = req.body.pageSize ? parseInt(req.body.pageSize) : 10;

    let products, total

    console.log(filters);
    try {
        let filterConditions = {}
        if (type === 'new') {
            sort = {
                createdAt: 'DESC'
            }
        }

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
                {
                    association: new BelongsTo(global.sequelizeModels.Product, global.sequelizeModels.ProductCount, {
                        as: 'productCount', foreignKey: 'id', targetKey: 'productId'
                    }),
                },
                {
                    association: new BelongsTo(global.sequelizeModels.Product, global.sequelizeModels.ProductRate, {
                        as: 'productRate', foreignKey: 'id', targetKey: 'productId'
                    }),
                }
            ],
            limit: pageSize,
            offset: (page - 1) * pageSize,
        }

        if (sort) {
            conditions.order = [Object.entries(sort)]
        }

        console.log(conditions);
        const result = await global.sequelizeModels.Product.findAndCountAll(conditions);

        console.log(result);

        total = result.count;
        products = result.rows;

        // console.log(products[0].dataValues.productCount.dataValues.count)

        if (type === 'hot') {
            products = products.sort((a, b) => {
                if(a.dataValues.productCount === null) { return 1 } else if(b.dataValues.productCount === null) { return -1 }
                return b.dataValues.productCount.dataValues.totalCount - a.dataValues.productCount.dataValues.totalCount
            })
        }

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
        let ProductCount = global.sequelizeModels.ProductCount;
        let ProductRate = global.sequelizeModels.ProductRate;

        console.log(req.params);
        let product = await Product.findOne({
            where: req.params,
            include:[
                {
                    association: new BelongsTo(Product, Category, {
                        as: 'category', foreignKey: 'categoryId', targetKey: 'id'
                    }),
                },
                {
                    association: new BelongsTo(Product, ProductCount, {
                        as: 'productCount', foreignKey: 'id', targetKey: 'productId'
                    }),
                },
                {
                    association: new BelongsTo(Product, ProductRate, {
                        as: 'productRate', foreignKey: 'id', targetKey: 'productId'
                    })
                },
            ],
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