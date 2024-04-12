const Sequelize = require('sequelize');
var bcrypt = require('bcrypt-nodejs');

const tableName = 'category'

module.exports = function (sequelize) {
  const Category = sequelize.define('category',
    {
      // attributes
      id: {
        field: 'ID',
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      categoryName: {
        field: 'name',
        type: Sequelize.STRING(100),
        defaultValue: '',
        allowNull: false,
      },
        path: {
          field: 'path',
          type: Sequelize.STRING(100),
          defaultValue: '',
          allowNull: false,
        },
      status: {
        field: 'STATUS',
        type: Sequelize.ENUM('active', 'deActive'),
        defaultValue: 'active',
        allowNull: false,
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
      // instanceMethods: {
      //   hashPassword: function (plainPassword) {
      //     return bcrypt.hashSync(plainPassword, bcrypt.genSaltSync(8), null);
      //   },
      //   validPassword: function (plainPassword) {
      //     return bcrypt.compareSync(plainPassword, this.password);
      //   }
      // }
    }
  );

  Category.sync({force: false, alter: true}).then(() => {
    if (!global.sequelizeModels) {
      global.sequelizeModels = {}
    }
    global.sequelizeModels.Category = Category
    console.log('sync Category done')
  });
}