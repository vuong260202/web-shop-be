var express = require('express')
var router = express.Router()
const webUtils = require('../utils/webUtils');
const {BelongsTo, HasMany, BelongsToMany, HasOne} = require("sequelize");

router.get('/', function (req, res) {
    return res.status(200).json({
        status: 200,
        message: 'success '
    })
})

router.get('/all', async (req, res) => {

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