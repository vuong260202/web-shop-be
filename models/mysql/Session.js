const Sequelize = require('sequelize');

const tableName = 'session'

module.exports = function (sequelize) {
    const Session = sequelize.define('session',
        {
            // attributes
            id: {
                field: 'sid',
                type: Sequelize.STRING(200),
                primaryKey: true
            },
            session: {
                field: 'sess',
                type: Sequelize.STRING(1000),
                defaultValue: '',
                allowNull: false,
            },
            expires: {
                field: 'expire',
                type: 'TIMESTAMP',
                allowNull: false,
            },
        },
        {
            tableName: tableName,
            timestamps: false
        }
    );

    Session.sync({ force: false }).then(() => {
        if (!global.sequelizeModels) {
            global.sequelizeModels = {}
        }
        global.sequelizeModels.Session = Session
        console.log('sync Session done')
    });
}