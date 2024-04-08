var express = require('express')
const {Transaction, BelongsTo, where} = require("sequelize");
var router = express.Router()

const webUtils = require('../utils/webUtils');

router.get('/', function (req, res) {
    return res.status(200).json({
        status: 200,
        message: 'success'
    })
})

router.post('/add-transaction', webUtils.isLoggedIn1, async (req, res) => {
    let {productId, name, numberPhone, address, size, count, total} = req.body;

    // console.log(req.)
    let Transaction = global.sequelizeModels.Transaction;
    let newTransaction = await Transaction.create(
        {
            productId: productId,
            buyerName: name !== '' ? name : req.user.name,
            numberPhone: numberPhone !== '' ? numberPhone : req.user.numberPhone,
            address: address !== '' ? address : req.user.address,
            count: count,
            totalAmount: total,
            size: size,
            userId: req.user?.id,
            status: "PENDING",
            createdAt: new Date()
        }
    )

    await newTransaction.save();

    console.log(newTransaction)
    // let user = global.sequelizeModels.User.findOne(req.body.userId);
    // let value = user.userId + user.name;

    return res.status(200).json({
        status: 200,
        data: newTransaction
    });
})

router.post('/all', webUtils.isLoggedIn, async (req, res) => {
    console.log(">>>")
    let Transaction = global.sequelizeModels.Transaction;
    let Product = global.sequelizeModels.Product;
    let data;

    let conditions = {}

    if(req.body.status) {
        conditions.status = req.body.status;
    }

    console.log(req.user);

    if(req.user.role === 'user') {
        console.log(req.user.userId);
        conditions.userId = req.user.userId;
    }

    data = await Transaction.findAndCountAll(
        {
            where: conditions,
            include: [
                {
                    association: new BelongsTo(Transaction, Product, {
                        as: 'product', foreignKey: 'productId', targetKey: 'id'
                    }),
                },
            ]
        }
    );

    data.map(dt => {
        let newData = dt.dataValues;
        newData.productName = newData.product.productName;

        return newData;
    })

    console.log(data);

    return res.status(200).json({
        status: 200,
        data: data
    })
})

module.exports = router