const Sequelize = require('sequelize');
// var bcrypt = require('bcrypt-nodejs');

const tableName = 'products'

module.exports = function (sequelize) {
  const Product = sequelize.define('products',
    {
      // attributes
      id: {
        field: 'ID',
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      productName: {
        field: 'PRODUCT_NAME',
        type: Sequelize.STRING(100),
        defaultValue: '',
        allowNull: false,
      },
      price: {
        field: 'PRICE',
        type: Sequelize.INTEGER,
        allowNull: true
      },
      category: {
        field: 'CATEGORY',
        type: Sequelize.STRING(100),
        defaultValue: '',
        allowNull: false,
      },
      status: {
        field: 'STATUS',
        type: Sequelize.ENUM('sold', 'unsold'),
        defaultValue: 'unsold'
      },
      total: {
        field: 'TOTAL',
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      createdAt: {
        field: 'CREATED_AT',
        type: 'TIMESTAMP',
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      saleAt: {
        field: 'SALE_AT',
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

  Product.sync({force: false, alter: true}).then(() => {
    if (!global.sequelizeModels) {
      global.sequelizeModels = {}
    }
    global.sequelizeModels.Product = Product
    console.log('sync User done')

  });
}