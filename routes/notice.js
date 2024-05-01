var express = require('express')
var router = express.Router()

const WebUtils = require('../utils/webUtils')
const bcrypt = require("bcrypt-nodejs");

router.get('/', function (req, res) {
    return res.status(200).json({
        status: 200,
        message: 'success '
    })
})

router.get('/all', WebUtils.isLoggedIn, async (req, res) => {
    let Notice = global.sequelizeModels.Notice;

    try {
        let conditions = {}

        let notices = await Notice.findAll({
            where: {
                userId: req.user.id,
            },
            order: [
                ['isRead', 'ASC'],
                ['createdAt', 'DESC']
            ],
        })

        return res.status(200).json({
            status: 200,
            data: notices
        })
    } catch (e) {
        return res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})

router.post('/update', WebUtils.isLoggedIn, async (req, res) => {
    let Notice = global.sequelizeModels.Notice;

    try {
        console.log(req.user.id);
        await Notice.update({
            isRead: true,
        },{
            where: {
                userId: req.user.id
            }
        })

        return res.status(200).json({
            status: 200,
            message: "Notice was successfully updated"
        })
    } catch (e) {
        return res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})

router.post('/create', WebUtils.isLoggedIn, async (req, res) => {
    let Notice = global.sequelizeModels.Notice;
    let User = global.sequelizeModels.User;

    try {
        if (req.body.sender === 'admin') {
            if (req.body.userId) {
                let notice = await Notice.create({
                    userId: req.body.userId,
                    content: req.body.content,
                    title: req.body.title,
                    transactionId: req.body.transactionId,
                    productId: req.body.productId
                })

                await notice.save();
            } else {
                let userIds = await User.findAll({
                    attributes: [['ID', 'id']],
                    where: {
                        role: 'user'
                    }
                })

                for (let userId of userIds) {
                    let notice = await Notice.create({
                        userId: userId.id,
                        content: req.body.content,
                        title: req.body.title,
                        transactionId: req.body.transactionId,
                        productId: req.body.productId
                    })

                    await notice.save();
                }
            }
        } else {
            let admin = await User.findOne({
                where: {
                    role: 'admin'
                }
            })

            let notice = await Notice.create({
                userId: admin.id,
                content: req.body.content,
                title: req.body.title,
                transactionId: req.body.transactionId,
                productId: req.body.productId
            })

            await notice.save();
        }

        return res.status(200).json({
            status: 200,
            message: "Created notice successfully!"
        })
    } catch (e) {
        return res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})

module.exports = router