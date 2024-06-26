const Sequelize = require('sequelize');
var bcrypt = require('bcrypt-nodejs');

const tableName = 'users'

module.exports = function (sequelize) {
    const User = sequelize.define('users',
        {
            // attributes
            id: {
                field: 'ID',
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            username: {
                field: 'USERNAME',
                type: Sequelize.STRING(100),
                defaultValue: '',
                allowNull: false,
            },
            password: {
                field: 'PASSWORD',
                type: Sequelize.STRING(200),
                defaultValue: '',
                allowNull: false,
            },
            googleId: {
                field: 'GOOGLE_ID',
                type: Sequelize.STRING(100),
                allowNull: true,
            },
            email: {
                field: 'EMAIL',
                type: Sequelize.STRING(100),
                defaultValue: '',
                allowNull: false,
            },
            fullname: {
                field: 'NAME',
                type: Sequelize.STRING(100),
                defaultValue: '',
                allowNull: false,
            },
            lastLogin: {
                field: 'LAST_LOGIN',
                type: 'TIMESTAMP',
                allowNull: true
            },
            numberPhone: {
                field: 'PHONE',
                type: Sequelize.STRING(200),
                defaultValue: null,
            },
            address: {
                field: 'ADDRESS',
                type: Sequelize.STRING(200),
                allowNull: true
            },
            resetToken: {
                field: 'RESET_TOKEN',
                type: Sequelize.STRING(100),
                defaultValue: '',
                allowNull: false
            },
            resetTokenExpiration: {
                field: 'RESET_TOKEN_EXPIRATION',
                type: Sequelize.DATE,
                allowNull: true
            },
            role: {
                field: 'ROLE',
                type: Sequelize.ENUM('user', 'admin'),
                defaultValue: 'user',
                allowNull: false
            },
            avatar: {
                field: 'AVATAR',
                type: Sequelize.STRING(100),
                defaultValue: null,
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

    User.sync({force: false, alter: true}).then(() => {
        if (!global.sequelizeModels) {
            global.sequelizeModels = {}
        }

        global.sequelizeModels.User = User
        console.log('sync User done')

    });


    User.prototype.hashPassword = function (plainPassword) {
        return bcrypt.hashSync(plainPassword, bcrypt.genSaltSync(8), null);
    }

    User.prototype.validPassword = function (plainPassword) {
        return bcrypt.compareSync(plainPassword, this.password);
    }

}