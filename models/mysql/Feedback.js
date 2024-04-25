const Sequelize = require('sequelize');
// var bcrypt = require('bcrypt-nodejs');

const tableName = 'feedback'

module.exports = function (sequelize) {
    const Feedback = sequelize.define('feedback',
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
            userId: {
                field: 'USER_ID',
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            content: {
                field: 'CONTENT',
                type: Sequelize.STRING(200),
                defaultValue: '',
                allowNull: false,
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
        }
    );

    Feedback.sync({force: false, alter: true}).then(() => {
        if (!global.sequelizeModels) {
            global.sequelizeModels = {}
        }
        global.sequelizeModels.Feedback = Feedback
        console.log('sync Feedback done')
    });
}