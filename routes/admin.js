var express = require('express');
const {isAdmin} = require('../utils/webUtils');
const valid = require("../utils/valid/productValidUtils");
var router = express.Router();
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, '../web-shop-fe/public/img');
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({storage});

router.post('/update-product', isAdmin, function (req, res) {
    return res.status(200).json({
        status: 200,
        data: {}
    });
})

router.post('/upload-product', upload.single('file'), async (req, res) => {
    let Product = global.sequelizeModels.Product;
    let ProductCount = global.sequelizeModels.ProductCount;
    let Category = global.sequelizeModels.Category;
    let ProductRate = global.sequelizeModels.ProductRate;

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

        let newProduct = await Product.create(
            {
                productName: req.body.productName,
                sizes: `[${req.body.sizes}]`,
                price: req.body.price,
                categoryId: req.body.categoryId,
                total: req.body.total,
                path: req.file.path.slice(req.file.indexOf('/img/')),
            }
        )

        await newProduct.save();

        let newProductCount = await ProductCount.create(
            {
                productId: newProduct.id,
                transactionCount: 0,
                totalCount: 0,
            }
        )

        let newProductRate = await ProductRate.create(
            {
                productId: newProduct.id,
            }
        )

        await newProductCount.save();

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

router.post('/upload-category',  upload.single('file'), async (req, res) => {
    let Category = global.sequelizeModels.Category;
    console.log(">>>")
    console.log(req.file?.path);

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
                path: req.file.path,
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

module.exports = router;