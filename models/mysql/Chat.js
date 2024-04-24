const Sequelize = require('sequelize');
var bcrypt = require('bcrypt-nodejs');

const tableName = 'chat'

module.exports = function (sequelize) {
    const Chat = sequelize.define('chat',
        {
            // attributes
            id: {
                field: 'ID',
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            senderId: {
                field: 'SENDER_ID',
                type: Sequelize.INTEGER,
                allowNull: true
            },
            receiverId: {
                field: 'RECEIVER_ID',
                type: Sequelize.INTEGER,
                allowNull: true
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

    Chat.sync({force: false, alter: true}).then(() => {
        if (!global.sequelizeModels) {
            global.sequelizeModels = {}
        }
        global.sequelizeModels.Chat = Chat
        console.log('sync Chat done')

    });
}