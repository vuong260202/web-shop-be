const Sequelize = require('sequelize');
let CONFIG = require('../config');
const {readFileSync} = require("fs");
const {join} = require("path");

let sequelize = new Sequelize(CONFIG.db.dbname, CONFIG.db.user, CONFIG.db.password, {
    host: CONFIG.db.host,
    port: CONFIG.db.port,
    dialect: 'mysql'
});

sequelize
.authenticate()
.then(() => {
    console.log('Connection has been established successfully.');

    require('./mysql/User')(sequelize);
    require('./mysql/Session')(sequelize);
    require('./mysql/Product')(sequelize);
    require('./mysql/Category')(sequelize);
    require('./mysql/Transaction')(sequelize);
    require('./mysql/ProductStatistic')(sequelize);
    require('./mysql/Rate')(sequelize);
    require('./mysql/Feedback')(sequelize);
    // require('./mysql/Chat')(sequelize);
    // require('./mysql/ChatContent')(sequelize);
    require('./mysql/Notice')(sequelize);

    // Add other models as needed...

})
// .then(async () => {
//         setTimeout(async () => {
//             await global.sequelizeModels.User.findAll().then(async (users) => {
//                 if (users.length === 0) {
//                     const sqlFilePath = join(__dirname, '../resource/db/init.sql');
//                     const sql = readFileSync(sqlFilePath, 'utf8');
//                     await sequelize.query(sql);
//                 }
//             })
//         }, CONFIG.db.dbImportTimeout)
//     })
.catch(err => {
    console.error('Unable to connect to the database:', err);
    process.exit(1);
});

sequelize.sync({force: false, alter: true}).then(() => {
    console.log("connect Success");

    global.sequelize = sequelize;
})