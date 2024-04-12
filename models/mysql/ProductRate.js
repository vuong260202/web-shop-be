const Sequelize = require('sequelize');
// var bcrypt = require('bcrypt-nodejs');

const tableName = 'product_rate'

module.exports = function (sequelize) {
    const ProductRate = sequelize.define('product_rate',
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
                type: Sequelize.INTEGER,
                defaultValue: null,
            },
            totalRate: {
                field: 'TOTAL_RATE',
                type: Sequelize.DOUBLE,
                defaultValue: 5.0,
                allowNull: false,
            },
        },
        {
            tableName: tableName,
            timestamps: false,
        }
    );

    ProductRate.sync({force: false, alter: true}).then(() => {
        if (!global.sequelizeModels) {
            global.sequelizeModels = {}
        }
        global.sequelizeModels.ProductRate = ProductRate
        console.log('sync ProductRate done')
    });
}