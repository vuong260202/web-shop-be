var express = require('express');
const {isAdmin, isLoggedIn} = require('../utils/webUtils');
const valid = require("../utils/valid/productValidUtils");
var router = express.Router();
const multer = require('multer');
const path = require('path');
const {Op} = require("sequelize");

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, '../web-shop-fe/public/img');
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({storage});

router.post('/update-product', upload.single('file'), isLoggedIn, isAdmin, async function (req, res, next) {
    console.log(req.body);

    try {
        let product = await global.sequelizeModels.Product.findOne({
            where: {
                id: req.body.productId
            }
        })

        product.productName = req.body.productName;
        product.price = req.body.price;
        product.total = req.body.total;
        product.sizes = req.body.sizes;
        product.updatedAt = new Date();
        product.description = req.body.description ?? '';
        if(req.file) {
            req.file.path = req.file.path.replace(/\\/g, '/');
            product.path = req.file.path.slice(req.file.path.indexOf('/img/'));
        }

        await product.save();

        await global.sequelizeModels.Category.update({
            categoryName: req.body.categoryName
        }, {
            where: {
                id: req.body.categoryId
            }
        });

        return res.status(200).json({
            status: 200,
            message: "updated successfully!"
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            status: 500,
            message: 'Server internal error.'
        })
    }
})

router.post('/update-transaction', isLoggedIn, isAdmin, async (req, res, next) => {
    console.log("Update transaction")

    try {

        let transactions = await global.sequelizeModels.Transaction.findAll({
            where: {
                id: {
                    [Op.in]: req.body.transactionIds
                }
            }
        })

        let updatePromises = [];
        for (let transaction of transactions) {
            console.log(transaction.status);
            if (transaction.status === 'PENDING') {
                transaction.status = 'IN-PROGRESS'
            } else if (transaction.status === 'IN-PROGRESS') {
                transaction.status = 'DONE'
            }

            transaction.updatedAt = new Date();

            await global.sequelizeModels.Notice.create({
                content: transaction.status === 'DONE' ? `Đơn hàng của bạn đã được giao!` : `Đơn hàng của bạn đã bắt đầu vận chuyển`,
                userId: transaction.userId,
                transactionId: transaction.id,
                title: "TRANSACTION"
            })

            updatePromises.push(transaction.save());
        }

        await Promise.all(updatePromises);

    } catch (err) {
        console.log('error: ', err);
    }

    return res.status(200).json({
        status: 200,
        message: 'Transaction updated successfully!'
    });
})

router.post('/upload-product', isLoggedIn, isAdmin, upload.single('file'), async (req, res) => {
    let Product = global.sequelizeModels.Product;
    let ProductStatistic = global.sequelizeModels.ProductStatistic;
    let Category = global.sequelizeModels.Category;

    console.log(req.body);

    try {
        let category = await Category.findByPk(req.body.categoryId);

        if (!category) {
            console.log("category not found");
            return res.status(400).json({
                status: 400,
                message: 'Category not found.'
            })
        }

        let product = await Product.findOne({where: {productName: req.body.productName}});

        if (product) {
            console.log("Product does not exist");
            return res.status(400).json({
                status: 400,
                message: 'Product does not exist.'
            })
        }

        req.file.path = req.file.path.replace(/\\/g, '/');

        await Product.create(
            {
                productName: req.body.productName,
                sizes: `[${req.body.sizes}]`,
                price: req.body.price,
                description: req.body.description ?? '',
                categoryId: req.body.categoryId,
                total: req.body.total,
                path: req.file.path.slice(req.file.path.indexOf('/img/')),
            }
        ).then(newProduct => {
            ProductStatistic.create(
                {
                    productId: newProduct.id,
                }
            )
        })

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

router.post('/upload-category', isLoggedIn, isAdmin, upload.single('file'), async (req, res) => {
    let Category = global.sequelizeModels.Category;
    console.log(">>>")
    console.log(req.file?.path);

    req.file.path = req.file.path.replace(/\\/g, '/');

    try {
        let category = await Category.findOne({
            where: {
                categoryName: req.body.categoryName
            }})

        if (category) {
            return res.status(400).json({
                status: 400,
                message: 'Category does not exist.'
            })
        }

        let newCategory = await Category.create(
            {
                categoryName: req.body.categoryName,
                path: req.file.path.slice(req.file.path.indexOf('/img/')),
            }
        )

        await newCategory.save();
    } catch (err) {
        console.log('error: ', err);
        return res.status(500).json({
            status: 500,
            message: 'Server internal error.'
        })
    }

    return res.status(200).json({
        status: 200,
        message: 'upload category successfully'
    })
})

router.post('/delete-product', async function (req, res) {
    try {
        console.log(req.body);
        const product = await global.sequelizeModels.Product.update({
            status: 'deActive'
        }, {
            where: {
                id: req.body.productId
            }
        });

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

router.post('/delete-category', async function (req, res) {
    try {
        console.log(req.body);
        await global.sequelizeModels.Category.update({
            status: 'deActive'
        },{
            where: {
                id: req.body.categoryId
            }
        });

        await global.sequelizeModels.Product.update({
            status: 'deActive'
        },{
            where: {
                categoryId: req.body.categoryId
            }
        })

        return res.status(200).json({
            status: 200,
            message: 'Category deleted successfully.'
        });
    } catch (err) {
        console.log('error: ', err);
        return res.status(500).json({
            status: 500,
            message: 'Server internal error.'
        });
    }
});

router.post('/update-category', isLoggedIn, isAdmin, upload.single('file'), async (req, res) => {
    let Category = global.sequelizeModels.Category;

    try {
        let category = await Category.findOne(req.body.categoryId);

        if (!category) {
            console.log("category not found");
            return res.status(400).json({
                status: 400,
                message: 'Category not found.'
            })
        }

        category.categoryName = req.body.categoryName;
        category.updatedAt = new Date();

        if(req.file) {
            req.file.path = req.file.path.replace(/\\/g, '/');
            category.path = req.file.path.slice(req.file.path.indexOf('/img/'));
        }

        await category.save();

        return res.status(200).json({
            status: 200,
            message: 'Category updated successfully.'
        });
    } catch (err) {
        console.log('error: ', err);
        return res.status(500).json({
            status: 500,
            message: 'Server internal error.'
        })
    }
})

router.post('/update-product-status', isLoggedIn, isAdmin, async (req, res) => {

    try {
        let product = await global.sequelizeModels.Product.findOne({
            where: {
                id: req.body.productId
            }
        });

        product.status = req.body.status === true ? 'hidden' : 'active';
        await product.save();

        return res.status(200).json({
            status: 200,
            message: 'Product status updated successfully.'
        });
    } catch (err) {
        console.log('error: ', err);
        return res.status(500).json({
            status: 500,
            message: 'Server internal error.'
        })
    }
})

router.post('/update-category-status', isLoggedIn, isAdmin, async (req, res) => {
    let Product = global.sequelizeModels.Product;
    let Category = global.sequelizeModels.Category;

    try {
        let category = await Category.findOne({
            where: {
                id: req.body.categoryId,
                status: {
                    [Op.in]: ['active', 'hidden']
                }
            },
        });

        let products = await Product.findAll({
            where: {
                categoryId: category.id,
                status: {
                    [Op.in]: ['active', 'hidden']
                }
            }
        })

        console.log(category);
        let updatePromises = [];
        category.status = req.body.status === true ? 'hidden' : 'active';
        updatePromises.push(category.save());

        for (let product of products) {
            product.status = category.status;
            updatePromises.push(product.save());
        }

        await Promise.all(updatePromises);

        return res.status(200).json({
            status: 200,
            message: 'Category status updated successfully.',
            data: category
        });
    } catch (err) {
        console.log('error: ', err);
        return res.status(500).json({
            status: 500,
            message: 'Server internal error.'
        })
    }
})

module.exports = router;