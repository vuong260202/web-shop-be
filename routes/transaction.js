var express = require('express')
const {BelongsTo, Op} = require("sequelize");
var router = express.Router()

const webUtils = require('../utils/webUtils');

router.get('/', function (req, res) {
    return res.status(200).json({
        status: 200,
        message: 'success'
    })
})

router.post('/add-transaction', webUtils.isLoggedIn1, async (req, res) => {

    console.log(req.body)
    let Transaction = global.sequelizeModels.Transaction;
    let newTransaction = await Transaction.create(
        {
            productId: req.body.productId,
            buyerName: req.body.name,
            numberPhone: req.body.numberPhone,
            address: req.body.address,
            count: req.body.count,
            totalAmount: req.body.total,
            size: req.body.size,
            userId: req.user?.id,
            status: "PENDING",
            createdAt: new Date()
        }
    )

    await newTransaction.save();

    let admin = await global.sequelizeModels.User.findOne({
        where: {
            role: 'admin'
        }
    })

    await global.sequelizeModels.Notice.create({
        content: `Người dùng ${req.user.fullname ?? req.user.username} đã tạo một đơn hàng!`,
        userId: admin.id,
        transactionId: newTransaction.id,
        title: "TRANSACTION"
    })

    console.log(newTransaction)

    return res.status(200).json({
        status: 200,
        data: newTransaction
    });
})

router.post('/filter-transactions', webUtils.isLoggedIn, async (req, res) => {
    console.log(">>>")
    let Transaction = global.sequelizeModels.Transaction;
    let Product = global.sequelizeModels.Product;
    let User = global.sequelizeModels.User;
    let data;

    let conditions = {}

    if(req.body.status) {
        conditions.status = req.body.status;
    }

    if(req.user?.role === 'user') {
        conditions.userId = req.user?.id;
    }

    console.log(conditions)

    data = await Transaction.findAndCountAll(
        {
            where: conditions,
            include: [
                {
                    association: new BelongsTo(Transaction, Product, {
                        as: 'product', foreignKey: 'productId', targetKey: 'id'
                    }),
                },
                {
                    association: new BelongsTo(Transaction, User, {
                        as: 'user', foreignKey: 'userId', targetKey: 'id'
                    }),
                },
            ],
            order: [["updatedAt", "desc"]]
        }
    );

    data.rows = data.rows.filter(transaction => transaction.product.status !== 'deActive');

    data = data.rows.map(dt => {
        let data = dt.dataValues;
        data.productName = data.product.productName;

        if (data.user) {
            data.buyerName = data.user?.fullname;
            data.numberPhone = data.user?.numberPhone;
            data.address = data.user?.address;
        }

        data.createdAt = webUtils.formatDate(data.createdAt);

        return data;
    })

    if (req.body.query) {
        data = data.filter(transaction => {
            return transaction.productName.includes(req.body.query) || transaction.buyerName.includes(req.body.query);
        })
    }

    return res.status(200).json({
        status: 200,
        data: data
    })
})

router.post('/delete-transactions', webUtils.isLoggedIn, async (req, res) => {
    let Transaction = global.sequelizeModels.Transaction;
    let Notice = global.sequelizeModels.Notice;

    console.log(req.body.transactionIds)

    try {
        let transactions = await Transaction.findAll({
            where: {
                id: {
                    [Op.in]: req.body.transactionIds
                }
            }
        })

        if (req.user.role === 'admin') {
            for (let transaction of transactions) {
                await Notice.create({
                    content: `Đơn hàng của bạn đã bị từ chối!`,
                    userId: transaction.userId,
                    transactionId: transaction.id,
                    title: "TRANSACTION"
                })
            }
        } else {
            let admin = await global.sequelizeModels.User.findOne({
                where: {
                    role: 'admin'
                }
            })

            for (let transaction of transactions) {
                await Notice.create({
                    content: `Người dùng ${req.user.fullname ?? req.user.username} đã huỷ đơn hàng!`,
                    userId: admin.id,
                    transactionId: transaction.id,
                    title: "TRANSACTION"
                })
            }
        }

        await Transaction.destroy({
            where: {
                id: {
                    [Op.in]: req.body.transactionIds
                }
            }
        })
    } catch (err) {
        console.log('error: ', err);
        return res.status(500).json({
            status: 500,
            message: 'Server internal error.'
        });
    }

    return res.status(200).json({
        status: 200,
        message: "delete transactions success"
    })
})

router.get('/:productId/transaction-detail', webUtils.isLoggedIn, async (req, res) => {

    let Transaction = global.sequelizeModels.Transaction;
    let User = global.sequelizeModels.User;
    let Rate = global.sequelizeModels.Rate;

    let transactions = await Transaction.findAndCountAll({
        where: {
            productId: req.params.productId,
            userId: req.user.id
        },
    })

    let rate = await Rate.findOne({
        where: {
            productId: req.params.productId,
            userId: req.user.id
        },
    })

    let total = transactions.count;
    transactions = transactions.rows.map((transaction) => {
        return transaction;
    });


    console.log(transactions);

    return res.status(200).json({
        status: 200,
        data: {
            total: transactions.count,
            transactions: transactions.rows
        }
    })
})

module.exports = router