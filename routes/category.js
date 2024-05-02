var express = require('express')
var router = express.Router()
const webUtils = require('../utils/webUtils');
const {BelongsTo, HasMany, BelongsToMany, HasOne, Op} = require("sequelize");

router.get('/', function (req, res) {
    return res.status(200).json({
        status: 200,
        message: 'success '
    })
})

router.post('/filter', async (req, res) => {

    let Category = global.sequelizeModels.Category;
    let Product = global.sequelizeModels.Product;

    try {
        let categories = await Category.findAll({
            where: {
                status: 'active',
            },
            include: [
                {
                    association: new HasMany(Category, Product, {
                        as: 'products', targetKey: 'id', foreignKey: 'categoryId'
                    })
                }
            ]
        });

        for (let category of categories) {
            category.dataValues.products = category.dataValues.products.filter(product => product.status !== 'deActive');
            category.dataValues.productCount = category.dataValues.products.length;
            category.dataValues.updatedAt = webUtils.formatDate(category.dataValues.updatedAt);
            delete category.dataValues.products;
        }

        if (req.body.query) {
            categories = categories.filter(category => category.dataValues.categoryName.includes(req.body.query))
        }

        console.log(categories);

        return res.status(200).json({
            status: 200,
            data: categories
        })
    } catch (err) {
        console.log('error: ', err);
        return res.status(500).json({
            status: 500,
            message: 'Server internal error.'
        });
    }
})

router.post('/filter-statistic', async (req, res, next) => {
    console.log(req.body);

    let total
    try {
        let categories = await global.sequelizeModels.Category.findAndCountAll({
            where: {
                status: {
                    [Op.in]: ['active', 'hidden'],
                }
            },
            include:[
                {
                    association: new HasMany(global.sequelizeModels.Category, global.sequelizeModels.Product, {
                        as: 'products', targetKey: 'id', foreignKey: 'categoryId'
                    }),

                    include: [
                        {
                            association: new HasMany(global.sequelizeModels.Product, global.sequelizeModels.Transaction, {
                                as: 'transactions', targetKey: 'id', foreignKey: 'productId', required: false
                            }),
                        },
                    ]
                },
            ]
        })

        total = categories.count;
        categories = categories.rows;

        if (req.body.year !== 0) {
            if (req.body.month === 0) {
                for (let category of categories) {
                    for (let product of category.dataValues.products) {
                        product.dataValues.transactions = product.dataValues.transactions.filter(transaction => {
                            return transaction.dataValues.createdAt.getFullYear() === req.body.year && transaction.dataValues.status === 'DONE'
                        })
                    }
                }

            } else {
                for (let category of categories) {
                    for (let product of category.dataValues.products) {
                        product.dataValues.transactions = product.dataValues.transactions.filter(transaction => {
                            return transaction.dataValues.createdAt.getFullYear() === req.body.year &&
                                transaction.dataValues.createdAt.getMonth() === req.body.month - 1
                                && transaction.dataValues.status === 'DONE'
                        })
                    }
                }
            }
        } else {
            for (let category of categories) {
                for (let product of category.dataValues.products) {
                    product.dataValues.transactions = product.dataValues.transactions.filter(transaction => {
                        return transaction.dataValues.status === 'DONE'
                    })
                }
            }
        }

        // console.log(products);

        categories.map(category => {
            console.log(category.dataValues);
            let products = category.dataValues.products?.map(product => {
                console.log(product.id);
                product.dataValues = {
                    id: product.dataValues.id,
                    productName: product.dataValues.productName,
                    transactionCount: product.dataValues.transactions.length,
                    totalCount: product.dataValues.transactions.reduce((total, transaction) => {
                        return total + transaction.dataValues.count
                    }, 0),
                    totalAmount: product.dataValues.transactions.reduce((total, transaction) => {
                        return total + transaction.dataValues.totalAmount
                    }, 0)
                }

                return product;
            })

            category.dataValues = {
                id: category.dataValues.id,
                categoryName: category.dataValues.categoryName,
                productCount: products.length,
                productPayment: products.reduce((total, product) => {
                    return total + product.dataValues.totalCount;
                }, 0),
                totalAmount: products.reduce((total, product) => total + product.dataValues.totalAmount, 0),
                transactionCount: products.reduce((total, product) => total + product.dataValues.transactionCount, 0)
            }

            return category;
        })

        if (req.body.query) {
            categories = categories.filter(category => category.dataValues.categoryName.includes(req.body.query))
        }

        return res.status(200).json({
            status: 200,
            data: {
                total: total,
                categories: categories
            }
        })
    } catch (err) {
        return res.status(500).json({
            status: 500,
            message: 'Server internal error.'
        })
    }
})

router.get('/:categoryId/detail', async (req, res) => {

    let Category = global.sequelizeModels.Category;

    let category = await Category.findOne({
        where: {
            id: req.params.categoryId,
            status: 'active'
        }
    });

    console.log(category);

    return res.status(200).json({
        status: 200,
        data: category
    })
})

module.exports = router