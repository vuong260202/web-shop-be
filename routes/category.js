var express = require('express')
var router = express.Router()
const webUtils = require('../utils/webUtils');

router.get('/', function (req, res) {
    return res.status(200).json({
        status: 200,
        message: 'success '
    })
})

router.get('/all', async (req, res) => {

    let Category = global.sequelizeModels.Category;

    let categories = await Category.findAndCountAll();

    console.log(categories);

    return res.status(200).json({
        status: 200,
        data: {
            total: categories.count,
            categories: categories.rows,
        }
    })
})

module.exports = router