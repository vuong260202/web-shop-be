var express = require('express');
var router = express.Router();
const {BelongsTo, Op, HasMany, BelongsToMany} = require("sequelize");
const {formatDate, isLoggedIn1, isLoggedIn} = require("../utils/webUtils");


router.post('/filter-product', async (req, res, next) => {
    let {sort, filters, type, isAll} = req.body
    let page = req.body.page ? parseInt(req.body.page) : 1;
    let pageSize = req.body.pageSize ? parseInt(req.body.pageSize) : 10;

    let products, total

    console.log(req.body);
    try {
        let filterConditions = {
            status: isAll ? {
                [Op.in]: ['active', 'hidden'],
            } : 'active',
            productName: {
                [Op.like]: `%${filters?.productName ?? ''}%`
            },
        }
        if (type === 'new') {
            sort = {
                createdAt: 'DESC'
            }
        }

        if (filters?.categories) {
            filterConditions.categoryId = {
                [Op.in]: filters.categories
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
                    association: new BelongsTo(global.sequelizeModels.Product, global.sequelizeModels.ProductStatistic, {
                        as: 'productStatistic', foreignKey: 'id', targetKey: 'productId'
                    }),
                },
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

        if (type === 'hot') {
            products = products.sort((a, b) => {
                if(a.dataValues.productStatistic === null) { return 1 } else if(b.dataValues.productStatistic === null) { return -1 }
                return b.dataValues.productStatistic.dataValues.totalCount - a.dataValues.productStatistic.dataValues.totalCount
            })
        }

        products.map(product => {
            product.updatedAt = formatDate(product.updatedAt);
        })

        if (req.body.query) {
            products = products.filter(product => product.productName.includes(req.body.query));
        }

        return res.status(200).json({
            status: 200,
            data: {
                total: total,
                products: products
            }
        })
    } catch (err) {
        return res.status(500).json({
            status: 500,
            message: 'Server internal error.'
        })
    }
})

router.post('/filter-statistic', async (req, res, next) => {
    console.log(req.body);

    let total

    console.log(req.body);
    console.log(new Date(req.body.year, ))
    try {
        let filterConditions = {
        }

        let products = await global.sequelizeModels.Product.findAndCountAll({
            where: {
                status: {
                    [Op.in]: ['active', 'hidden'],
                }
            },
            include:[
                {
                    association: new BelongsTo(global.sequelizeModels.Product, global.sequelizeModels.Category, {
                        as: 'category', foreignKey: 'categoryId', targetKey: 'id'
                    }),
                },
                {
                    association: new HasMany(global.sequelizeModels.Product, global.sequelizeModels.Transaction, {
                        as: 'transactions', targetKey: 'id', foreignKey: 'productId', required: false
                    }),
                },
                {
                    association: new HasMany(global.sequelizeModels.Product, global.sequelizeModels.Rate, {
                        as: 'rates', targetKey: 'id', foreignKey: 'productId', required: false
                    }),
                },
                {
                    association: new HasMany(global.sequelizeModels.Product, global.sequelizeModels.Feedback, {
                        as: 'feedbacks', targetKey: 'id', foreignKey: 'productId', required: false
                    }),
                }
            ]
        })

        total = products.count;
        products = products.rows;

        if (req.body.year !== 0) {
            if (req.body.month === 0) {
                for (let product of products) {
                    product.dataValues.transactions = product.dataValues.transactions.filter(transaction => {
                        return transaction.dataValues.createdAt.getFullYear() === req.body.year && transaction.dataValues.status === 'DONE'
                    })
                }
            } else {
                for (let product of products) {
                    product.dataValues.transactions = product.dataValues.transactions.filter(transaction => {
                        return transaction.dataValues.createdAt.getFullYear() === req.body.year &&
                            transaction.dataValues.createdAt.getMonth() === req.body.month - 1
                            && transaction.dataValues.status === 'DONE'
                    })
                }
            }
        } else {
            for (let product of products) {
                product.dataValues.transactions = product.dataValues.transactions.filter(transaction => {
                    return transaction.dataValues.status === 'DONE'
                })
            }
        }

        // console.log(products);

        products.map(product => {
            console.log(product.id);
            product.dataValues = {
                id: product.dataValues.id,
                productName: product.dataValues.productName,
                categoryId: product.dataValues.category.dataValues.id,
                categoryName: product.dataValues.category.dataValues.categoryName,
                transactionCount: product.dataValues.transactions.length,
                totalCount: product.dataValues.transactions.reduce((total, transaction) => {
                    return total + transaction.dataValues.count
                }, 0),
                totalRate: (product.dataValues.rates.reduce((total, rate) => {
                    return total + rate.dataValues.rate
                }, 0) / product.dataValues.rates.length),
                totalAmount: product.dataValues.transactions.reduce((total, transaction) => {
                    return total + transaction.dataValues.totalAmount
                }, 0),
                rateCount: product.dataValues.rates.length,
                feedbackCount: product.dataValues.feedbacks.length
            };

            return product;
        })

        if (req.body.query) {
            products = products.filter(product => product.dataValues.productName.includes(req.body.query))
        }

        products.sort((a, b) => b.dataValues.totalAmount - a.dataValues.totalAmount);

        return res.status(200).json({
            status: 200,
            data: {
                total: total,
                products: products
            }
        })
    } catch (err) {
        return res.status(500).json({
            status: 500,
            message: 'Server internal error.'
        })
    }
})

router.post('/all-product', async (req, res, next) => {
    let products, total
    try {
        const result = await global.sequelizeModels.Product.findAndCountAll({
            where: {
                status: 'active'
            },
            include:[
                {
                    association: new BelongsTo(global.sequelizeModels.Product, global.sequelizeModels.Category, {
                        as: 'category', foreignKey: 'categoryId', targetKey: 'id'
                    }),
                },
            ],
        });

        console.log(result);

        total = result.count;
        products = result.rows;

        products.map(product => {
            product.updatedAt = formatDate(product.updatedAt);
        })

        return res.status(200).json({
            status: 200,
            data: {
                total: total,
                products: products
            }
        })
    } catch (err) {
        return res.status(500).json({
            status: 500,
            message: 'Server internal error.'
        })
    }
})

router.post('/update-product', async function (req, res) {
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

router.get('/product-detail/:id', isLoggedIn1, async (req, res) => {
    try {
        let Category = global.sequelizeModels.Category;
        let Product = global.sequelizeModels.Product;
        let Feedback = global.sequelizeModels.Feedback;
        let User = global.sequelizeModels.User;
        let Rate = global.sequelizeModels.Rate;
        let ProductStatistic = global.sequelizeModels.ProductStatistic;

        console.log(req.params);
        let product = await Product.findOne({
            where: {
                id: req.params.id,
                status: 'active'
            },
            include:[
                {
                    association: new BelongsTo(Product, Category, {
                        as: 'category', foreignKey: 'categoryId', targetKey: 'id'
                    }),
                },
                {
                    association: new BelongsTo(Product, ProductStatistic, {
                        as: 'productStatistic', foreignKey: 'id', targetKey: 'productId'
                    }),
                },
                {
                    association: new HasMany(Product, Feedback, {
                        as: 'feedback', targetKey: 'id', foreignKey: 'productId'
                    }),

                    include: [
                        {
                            association: new BelongsTo(Feedback, User, {
                                as: 'user', foreignKey: 'userId', targetKey: 'id'
                            }),
                        },
                        {
                            association: new BelongsTo(Feedback, Rate, {
                                as: 'rates', foreignKey: 'userId', targetKey: 'userId'
                            }),
                        }
                    ]
                },
                {
                    association: new HasMany(Product, Rate, {
                        as: 'rates', targetKey: 'id', foreignKey: 'productId'
                    }),
                }
            ],
        })

        console.log(product)

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
        product.rates = product.rates.length;
        if (req.user) {
            product.userRate = await Rate.findOne({
                where: {
                    userId: req.user.id,
                    productId: product.id
                }
            })
        }

        console.log(product.categoryId);
        product.productBrands = await Product.findAll({
            attributes: [['PRODUCT_NAME', 'productName'], ['ID', 'id'], ['PATH', 'path']],
            where: {
                id: {
                    [Op.ne]: product.id
                },
                categoryId: product.categoryId,
                status: 'ACTIVE',
            },
            limit: 3,
        })

        product.productStatistic = {
            totalRate: product.productStatistic.totalRate,
            transactionCount: product.productStatistic.transactionCount,
            totalCount: product.productStatistic.totalCount,
            feedback: product.feedback?.map(feedback => {
                return {
                    content: feedback.content,
                    rate: feedback.rate,
                    createdAt: formatDate(feedback.createdAt),
                    author: feedback.user?.fullname,
                    userId: feedback.userId,
                    rate: feedback.rates.rate
                };
            })
        }

        delete product.feedback;

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

router.post('/on-job', async (req, res) => {
        let ProductStatistic = global.sequelizeModels.ProductStatistic;
        let Rate = global.sequelizeModels.Rate;
        let Transaction = global.sequelizeModels.Transaction;
        let Product = global.sequelizeModels.Product;

        try {
            let updatePromises = [];
            console.log("start job calculator rate!")
            let startTime = new Date().getTime();
            let productStatistics = await ProductStatistic.findAll(
                {
                    include: [
                        {
                            association: new BelongsTo(ProductStatistic, Product, {
                                as: 'product', foreignKey: 'productId', targetKey: 'id'
                            }),

                            include: [
                                {
                                    association: new HasMany(Product, Rate, {
                                        as: 'rates', targetKey: 'id', foreignKey: 'productId'
                                    }),
                                },
                                {
                                    association: new HasMany(Product, Transaction, {
                                        as: 'transactions', foreignKey: 'productId', targetKey: 'productId'
                                    }),
                                }
                            ]
                        },
                    ]
                }
            );

            console.log('productStatistics', productStatistics);

            productStatistics.forEach(productStatistic => {
                // handle rating
                productStatistic.product.rates = productStatistic.product.rates?.filter(rate => rate.rate > 0) ?? [];

                let length = Math.max(productStatistic.product.rates.length, 1);
                let sum = productStatistic.product.rates.reduce((total, rate) => total + rate.rate, 0) || 0;

                productStatistic.totalRate = sum / length;

                productStatistic.transactions = productStatistic.product.transactions?.filter(transaction => transaction.status === 'DONE') ?? [];
                productStatistic.transactionCount = productStatistic.product.transactions.length;
                productStatistic.totalCount = productStatistic.product.transactions.reduce((total, transaction) => total + transaction.count, 0) || 0;

                // console.log(product);
                updatePromises.push(productStatistic.save());
            })

            await Promise.all(updatePromises);

            console.log('end job calculator rate with: ' + (new Date().getTime() - startTime));

            return res.status(200).json(
                {
                    status: 200,
                    data: productStatistics
                }
            );

        } catch (error) {
            console.error('Error updating jobs:', error);
        }
})

router.get('/all-product-name/:query', async (req, res) => {
    console.log(req.params.query);
    let Product = global.sequelizeModels.Product;

    try {
        let productNames = await Product.findAll({
            attributes: [['PRODUCT_NAME', 'productName']],
            where: {
                productName: {
                    [Op.like]: `%${req.params.query}%`
                }
            }
        })

        console.log(productNames.length)

        return res.status(200).json(
            {
                status: 200,
                data: productNames
            }
        );
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: 500,
            message: 'Server internal error.'
        })
    }
})


module.exports = router