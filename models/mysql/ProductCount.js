const Sequelize = require('sequelize');
// var bcrypt = require('bcrypt-nodejs');

const tableName = 'product_counts'

module.exports = function (sequelize) {
    const ProductCount = sequelize.define('product_counts',
        {
            productId: {
                field: 'PRODUCT_ID',
                type: Sequelize.INTEGER,
                defaultValue: 0,
                allowNull: false,
            },
            transactionCount: {
                field: 'COUNT',
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            totalCount: {
                field: 'COUNT',
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
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
            }
        },
        {
            tableName: tableName,
            timestamps: false,
        }
    );

    ProductCount.sync({force: false, alter: true}).then(() => {
        if (!global.sequelizeModels) {
            global.sequelizeModels = {}
        }
        global.sequelizeModels.ProductCount = ProductCount
        console.log('sync ProductCount done')
    });
}