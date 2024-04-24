var express = require('express');
var router = express.Router();
const {BelongsTo, Op, HasMany} = require("sequelize");
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

                    include: [
                        {
                            association: new HasMany(Feedback, ProductStatistic, {
                                as: 'feedback', targetKey: 'productId', foreignKey: 'productId'
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
                        }
                    ]
                },
            ],
        })

        // console.log(product)

        if (!product) {
            console.log("Product not found!")
            return res.status(400).json({
                status: 400,
                message: "Product not found!"
            });
        }


        //
        product = product.dataValues;
        product.category = product.category.dataValues.categoryName;
        product.sizes = JSON.parse(product.sizes);
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
            },
            limit: 3,
        })

        product.productStatistic = {
            totalRate: product.productStatistic.totalRate,
            transactionCount: product.productStatistic.transactionCount,
            totalCount: product.productStatistic.totalCount,
            feedback: product.productStatistic.feedback?.filter(feedback => feedback.productId === feedback.rates.productId).map(feedback => {
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

        try {
            let updatePromises = [];
            console.log("start job calculator rate!")
            let startTime = new Date().getTime();
            let productStatistics = await ProductStatistic.findAll(
                {
                    include: [
                        {
                            association: new HasMany(ProductStatistic, Rate, {
                                as: 'rates', foreignKey: 'productId', targetKey: 'productId'
                            }),
                        },
                        {
                            association: new HasMany(ProductStatistic, Transaction, {
                                as: 'transactions', foreignKey: 'productId', targetKey: 'productId'
                            }),
                        }
                    ]
                }
            );
            console.log('productStatistics', productStatistics);

            productStatistics.forEach(product => {
                // handle rating
                product.rates = product.rates?.filter(rate => rate.rate > 0) ?? [];

                let length = Math.max(product.rates.length, 1);
                let sum = product.rates.reduce((total, rate) => total + rate.rate, 0) || 0;

                product.totalRate = sum / length;

                product.transactions = product.transactions?.filter(transaction => transaction.status === 'DONE') ?? [];
                product.transactionCount = product.transactions.length;
                product.totalCount = product.transactions.reduce((total, transaction) => total + transaction.count, 0) || 0;

                console.log(product);
                updatePromises.push(product.save());
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


module.exports = router