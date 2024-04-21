const Sequelize = require('sequelize');

const tableName = 'product_statistic'

module.exports = function (sequelize) {
    const ProductStatistic = sequelize.define('product_statistic',
        {
            productId: {
                field: 'PRODUCT_ID',
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            transactionCount: {
                field: 'TRANSACTION_COUNT',
                type: Sequelize.INTEGER,
                defaultValue: 0,
                allowNull: false,
            },
            totalCount: {
                field: 'PRODUCT_COUNT',
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            totalRate: {
                field: 'TOTAL_RATE',
                type: Sequelize.DOUBLE,
                allowNull: false,
                defaultValue: 5.0,
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

    ProductStatistic.sync({force: false, alter: true}).then(() => {
        if (!global.sequelizeModels) {
            global.sequelizeModels = {}
        }
        global.sequelizeModels.ProductStatistic = ProductStatistic
        console.log('sync ProductStatistic done')
    });
}