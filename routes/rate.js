var express = require('express')
var router = express.Router()
const webUtils = require('../utils/webUtils');
router.get('/', function (req, res) {
    return res.status(200).json({
        status: 200,
        message: 'success'
    })
})

router.get('/detail', webUtils.isLoggedIn, async (req, res) => {
    let Rate = global.sequelizeModels.Rate;

    let rate = await Rate.findOne({
        where: {
            userId: req.params.userId,
            productId: req.params.productId
        }
    })

    if (!rate) {
        return res.status(400).json({
            status: 400,
            message: 'Rate does not exist.'
        })
    }

    return res.status(200).json({
        status: 200,
        data: rate
    })
})

router.get('/total-rate/:productId', async (req, res) => {
    let Rate = global.sequelizeModels.Rate;

    let rate = await Rate.findAll({
        where: {
            productId: req.params.productId
        }
    })

    if (!rate) {
        return res.status(400).json({
            status: 400,
            message: 'Rate does not exist.'
        })
    }

    let total = 0;
    rate.forEach(rateDetail => {
        total += rateDetail.dataValues.rate;
    })


    return res.status(200).json({
        status: 200,
        data: {
            productId: req.params.productId,
            totalRate: total / rate.length
        }
    })
})

router.post('/update', webUtils.isLoggedIn, (req, res) => {
    let Rate = global.sequelizeModels.Rate;

    let rate = Rate.findOne({
        where: {
            userId: req.params.userId,
            productId: req.params.productId
        }
    })

    if (!rate) {
        rate = Rate.create({
            userId: req.user.userId,
            productId: req.body.productId,
            rate: req.body.rate,
            createdAt: new Date(),
            updatedAt: new Date(),
        })
    } else {
        rate.rate = req.body.rate;
    }

    rate.save();

    return res.status(200).json({
        status: 200,
        message: 'update'
    })
})

module.exports = router