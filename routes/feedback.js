var express = require('express')
var router = express.Router()

const webUtils = require('../utils/webUtils')
router.get('/', function (req, res) {
    return res.status(200).json({
        status: 200,
        message: 'success '
    })
})

router.get('/all', async (req, res) => {
    let Feedback = global.sequelizeModels.Feedback;

    let feedbacks = await Feedback.findAndCountAll();

    let total = feedbacks.count;
    feedbacks = feedbacks.rows;

    console.log(feedbacks);

    feedbacks.map((feedback) => {
        feedback.createdAt = webUtils.formatDate(feedback.createdAt);
    })

    return res.status(200).json({
        status: 200,
        data: {
            total: total,
            feedbacks: feedbacks,
        }
    })
})

router.post('/create', webUtils.isLoggedIn, async (req, res) => {
    let Feedback = global.sequelizeModels.Feedback;

    console.log(req.body);

    try {
        let feedback = await Feedback.create({
            content: req.body.content,
            userId: req.user.id,
            productId: req.body.productId,
        })

        await feedback.save();

        console.log(feedback);

        return res.status(200).json({
            status: 200,
            message: "add feedback successfully!"
        })
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            status: 500,
            message: "Server internal error!"
        })
    }
})

// router.get('/all', async (req, res) => {
//     let Feedback = global.sequelizeModels.Feedback;
//
//     let feedbacks = await Feedback.findAll();
//
//     console.log(feedbacks);
//
//     return res.status(200).json({
//         status: 200,
//         data: feedbacks
//     })
// })

module.exports = router