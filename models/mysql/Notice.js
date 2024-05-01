const Sequelize = require('sequelize');
var bcrypt = require('bcrypt-nodejs');

const tableName = 'notice'

module.exports = function (sequelize) {
    const Notice = sequelize.define('notice',
        {
            // attributes
            id: {
                field: 'ID',
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            isRead: {
                field: 'IS_READ',
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            content: {
                field: 'CONTENT',
                type: Sequelize.STRING(200),
                defaultValue: '',
                allowNull: false
            },
            title: {
                field: 'TITLE',
                type: Sequelize.ENUM('PRODUCT', 'TRANSACTION', 'VOUCHER'),
                allowNull: false,
                defaultValue: 'VOUCHER'
            },
            transactionId: {
                field: 'TRANSACTION_ID',
                type: Sequelize.INTEGER,
                allowNull: true
            },
            productId: {
                field: 'PRODUCT_ID',
                type: Sequelize.INTEGER,
                allowNull: true
            },
            userId: {
                field: 'USER_ID',
                type: Sequelize.INTEGER,
                allowNull: false
            },
            createdAt: {
                field: 'CREATED_AT',
                type: 'TIMESTAMP',
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updatedAt: {
                field: 'UPDATED_AT',
                type: 'TIMESTAMP',
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
        },
        {
            tableName: tableName,
            timestamps: false,
        }
    );

    Notice.sync({force: false, alter: true}).then(() => {
        if (!global.sequelizeModels) {
            global.sequelizeModels = {}
        }
        global.sequelizeModels.Notice = Notice
        console.log('sync Chat done')

    });
}