
const Sequelize = require('sequelize');

let CONFIG = require('../config');

let sequelize = new Sequelize(CONFIG.db.dbname, 'root', '', {
    host: CONFIG.db.host,
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

    // Add other models as needed...

})
.catch(err => {
    console.error('Unable to connect to the database:', err);
    process.exit(1);
});