var express = require('express')
var router = express.Router()
const webUtils = require('../utils/webUtils');
router.get('/', function (req, res) {
    return res.status(200).json({
        status: 200,
        message: 'success'
    })
})

router.get('/:productId/detail', webUtils.isLoggedIn, async (req, res) => {
    let Rate = global.sequelizeModels.Rate;

    let rate = await Rate.findOne({
        where: {
            userId: req.user.id,
            productId: req.params.productId
        }
    })

    if (!rate) {
        return res.status(200).json({
            status: 200,
            data: {
                rate: 0
            }
        })
    }

    return res.status(200).json({
        status: 200,
        data: rate
    })
})

router.post('/update', webUtils.isLoggedIn, async (req, res) => {
    let Rate = global.sequelizeModels.Rate;

    try {
        let rate = await Rate.findOne({
            where: {
                userId: req.user.id,
                productId: req.body.productId
            }
        })

        if (!rate) {
            let currentTime = new Date();
            rate = await Rate.create({
                userId: req.user.id,
                productId: req.body.productId,
                rate: req.body.rate,
                createdAt: currentTime,
                updatedAt: currentTime,
            })
        } else {
            rate.rate = req.body.rate;
        }

        await rate.save();

        return res.status(200).json({
            status: 200,
            message: 'update rate successfully',
        })
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            status: 500,
            message: 'update rate failed'
        })
    }
})

module.exports = router