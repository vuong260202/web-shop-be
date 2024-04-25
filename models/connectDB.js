const Sequelize = require('sequelize');
let CONFIG = require('../config');

let sequelize = new Sequelize(CONFIG.db.dbname, CONFIG.db.user, CONFIG.db.password, {
    host: CONFIG.db.host,
    port: CONFIG.db.port,
    dialect: 'mysql'
});

sequelize
.authenticate()
.then(() => {
    console.log('Connection has been established successfully.');
    global.sequelize = sequelize;

    require('./mysql/User')(sequelize);
    require('./mysql/Session')(sequelize);
    require('./mysql/Product')(sequelize);
    require('./mysql/Category')(sequelize);
    require('./mysql/Transaction')(sequelize);
    require('./mysql/ProductStatistic')(sequelize);
    require('./mysql/Rate')(sequelize);
    require('./mysql/Feedback')(sequelize);
    require('./mysql/Chat')(sequelize);
    require('./mysql/ChatContent')(sequelize);

    // Add other models as needed...

})
.catch(err => {
    console.error('Unable to connect to the database:', err);
    process.exit(1);
});