const Sequelize = require('sequelize');
var bcrypt = require('bcrypt-nodejs');

const tableName = 'chat_content'

module.exports = function (sequelize) {
    const ChatContent = sequelize.define('chat_content',
        {
            // attributes
            id: {
                field: 'ID',
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            chatId: {
                field: 'CHAT_ID',
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            senderId: {
                field: 'SENDER_ID',
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

    ChatContent.sync({force: false, alter: true}).then(() => {
        if (!global.sequelizeModels) {
            global.sequelizeModels = {}
        }
        global.sequelizeModels.ChatContent = ChatContent
        console.log('sync ChatContent done')

    });
}