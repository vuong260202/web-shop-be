const Sequelize = require('sequelize');
// var bcrypt = require('bcrypt-nodejs');

const tableName = 'rate'

module.exports = function (sequelize) {
    const Rate = sequelize.define('rate',
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
                allowNull: true,
            },
            rate: {
                field: 'RATE',
                type: Sequelize.DOUBLE,
                defaultValue: 0,
                allowNull: false,
            },
            userId: {
                field: 'USER_ID',
                type: Sequelize.INTEGER,
                allowNull: true,
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

    Rate.sync({force: false, alter: true}).then(() => {
        if (!global.sequelizeModels) {
            global.sequelizeModels = {}
        }
        global.sequelizeModels.Rate = Rate
        console.log('sync Rate done')
    });
}