const Sequelize = require('sequelize');
// var bcrypt = require('bcrypt-nodejs');

const tableName = 'transactions'

module.exports = function (sequelize) {
    const Transaction = sequelize.define('transactions',
        {
            // attributes
            id: {
                field: 'ID',
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            productId: {
                field: 'PRODUCT_ID',
                type: Sequelize.STRING(100),
                defaultValue: '',
                allowNull: false,
            },
            count: {
                field: 'COUNT',
                type: Sequelize.INTEGER,
                allowNull: true
            },
            totalAmount: {
                field: 'TOTAL',
                type: Sequelize.INTEGER,
                allowNull: true
            },
            size: {
                field: 'SIZE',
                type: Sequelize.INTEGER,
                allowNull: true
            },
            address: {
                field: 'ADDRESS',
                type: Sequelize.STRING(200),
                allowNull: true
            },
            buyerName: {
                field: 'BUYER_NAME',
                type: Sequelize.STRING(100),
                defaultValue: null,
            },
            numberPhone: {
                field: 'PHONE',
                type: Sequelize.STRING(200),
                defaultValue: null,
            },
            status: {
                field: 'STATUS',
                type: Sequelize.ENUM("PENDING", "DONE", "IN-PROGRESS"),
                defaultValue: "PENDING",
            },
            userId: {
                field: 'USER_ID',
                type: Sequelize.INTEGER,
                defaultValue: null
            },
            createdAt: {
                field: 'CREATED_AT',
                type: 'TIMESTAMP',
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
        },
        {
            tableName: tableName,
            timestamps: false,
            // instanceMethods: {
            //   hashPassword: function (plainPassword) {
            //     return bcrypt.hashSync(plainPassword, bcrypt.genSaltSync(8), null);
            //   },
            //   validPassword: function (plainPassword) {
            //     return bcrypt.compareSync(plainPassword, this.password);
            //   }
            // }
        }
    );

    Transaction.sync({force: false, alter: true}).then(() => {
        if (!global.sequelizeModels) {
            global.sequelizeModels = {}
        }
        global.sequelizeModels.Transaction = Transaction
        console.log('sync Transaction done')
    });
}