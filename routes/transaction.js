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
    let {productId, name, numberPhone, address, size, count, total} = req.body;

    // console.log(req.)
    let Transaction = global.sequelizeModels.Transaction;
    let ProductCount = global.sequelizeModels.ProductCount;
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

    const productCount = await ProductCount.findOne({where: {productId: productId}})
    if (productCount) {
        productCount.transactionCount += 1;
        productCount.totalCount += count;
        await productCount.save();
    } else {
        let newProductCount = await ProductCount.create(
            {
                productId: productId,
                totalCount: count,
                transactionCount: 1,
            }
        )
        await newProductCount.save();
    }

    console.log(newTransaction)
    // let user = global.sequelizeModels.User.findOne(req.body.userId);
    // let value = user.userId + user.name;

    return res.status(200).json({
        status: 200,
        data: newTransaction
    });
})

router.post('/filter-transactions', webUtils.isLoggedIn, async (req, res) => {
    console.log(">>>")
    let Transaction = global.sequelizeModels.Transaction;
    let Product = global.sequelizeModels.Product;
    let data;

    let conditions = {}

    if(req.body.status) {
        conditions.status = req.body.status;
    }

    console.log(req.user.role);

    if(req.user.role === 'user') {
        console.log(req.user.id);
        conditions.userId = req.user.id;
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
            ],
            order: [["updatedAt", "desc"]]
        }
    );

    data = data.rows.map(dt => {
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

router.post('/delete-transactions', webUtils.isLoggedIn, async (req, res) => {
    let Transaction = global.sequelizeModels.Transaction;
    let Product = global.sequelizeModels.Product;

    console.log(req.body.transactionIds)

    try {
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

module.exports = router