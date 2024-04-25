var express = require('express')
var router = express.Router()
var WebUtils = require('../utils/webUtils')
const {BelongsTo, HasMany, Op} = require("sequelize");

router.get('/', function (req, res) {
    return res.status(200).json({
        status: 200,
        message: 'success '
    })
})

router.get('/all-user', WebUtils.isLoggedIn, async (req, res) => {
    let User = global.sequelizeModels.User;
    let Chat = global.sequelizeModels.Chat;
    try {
        let users = await User.findAll();

        return res.status(200).json({
            status: 200,
            data: users
        })
    } catch (err) {
        return res.status(500).json({
            status: 500,
            message: err.message
        })
    }
})

router.get('/detail', WebUtils.isLoggedIn, async (req, res) => {
    let User = global.sequelizeModels.User;
    let Chat = global.sequelizeModels.Chat;
    try {
        let user = req.user;

        user.chat = await Chat.findAll({
            where: {
                [Op.or]: [
                    {senderId: req.user.id},
                    {receiverId: req.user.id}
                ]
            }
        })

        user.chat = await User.findAll({
            attributes: [['ID', 'id'], ['NAME', 'username'], ['AVATAR', 'avatar']],
            where: {
                id: {
                    [Op.in]: user.chat.map(chat => {
                        return chat.senderId === user.id ? chat.receiverId : chat.senderId
                    })
                }
            }
        })

        console.log(user);

        return res.status(200).json({
            status: 200,
            data: {
                avatar: user.avatar,
                chat: user.chat,
                username: user.username,
                id: user.id
            }
        })
    } catch (err) {
        return res.status(500).json({
            status: 500,
            message: err.message
        })
    }
})

router.get('/:receiverId', WebUtils.isLoggedIn, async (req, res) => {
    let Chat = global.sequelizeModels.Chat;
    let ContentChat = global.sequelizeModels.ChatContent;
    console.log(req.params);
    try {
        let chat = await Chat.findOne({
            where: {
                [Op.or]: [
                    { senderId: req.user.id, receiverId: req.params.receiverId },
                    { senderId: req.params.receiverId, receiverId: req.user.id }
                ]
            },
        })

        if (!chat) {
            chat = new Chat({
                senderId: req.user.id,
                receiverId: req.params.receiverId
            })

            await chat.save();

            return res.status(200).json({
                status: 200,
                data: {
                    chartId: chat.id,
                    contentChats: []
                }
            })
        }

        console.log(chat);

        let contentChat = await ContentChat.findAll({
            where: {
                chatId: chat.id
            },
            order: [
                ['createdAt', 'DESC']
            ],
            limit: 100,
            logging: console.log
        })

        console.log(contentChat);

        return res.status(200).json({
            status: 200,
            data: {
                chatId: chat.id,
                contentChats: contentChat
            }
        })
    } catch (err) {
        return res.status(500).json({
            status: 500,
            message: err.message
        })
    }
})

router.post('/add-newContent', WebUtils.isLoggedIn, async (req, res) => {
    let Chat = global.sequelizeModels.Chat;
    let ContentChat = global.sequelizeModels.ChatContent;
    console.log(req.body);
    try {
        let chat = await Chat.findOne({
            where: {
                id: req.body.chatId,
            }
        });

        if (!chat) {
            return res.status(400).json({
                status: 400,
                message: 'Chat not found'
            })
        }

        let newChat = new ContentChat({
            chatId: chat.id,
            senderId: req.user.id,
            content: req.body.content
        })

        await newChat.save();

        return res.status(200).json({
            status: 200,
            message: "Add content success!"
        })
    } catch (err) {
        return res.status(500).json({
            status: 500,
            message: err.message
        })
    }
})



module.exports = router