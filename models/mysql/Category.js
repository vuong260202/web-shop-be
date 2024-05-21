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
        type: Sequelize.ENUM('active', 'deActive', 'hidden'),
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
    }
  );

  Category.sync({force: false, alter: true}).then(() => {
    if (!global.sequelizeModels) {
      global.sequelizeModels = {}
    }



      setTimeout(() => {
          Category.findAll().then(categoies => {
              if (categoies.length === 0) {
                  setTimeout(() => addCategory({
                      categoryName: 'nike',
                      path: '/img/1713743835139.png',
                      status: 'active'
                  }), 100);

                  setTimeout(() => addCategory({
                      categoryName: 'adidas',
                      path: '/img/adidas-logo.jpg',
                      status: 'active'
                  }), 200);

                  setTimeout(() => addCategory({
                      categoryName: 'Puma',
                      path: '/img/puma-logo.jpg',
                      status: 'active'
                  }), 300);
              }
          })
      }, 1000)

    global.sequelizeModels.Category = Category
    console.log('sync Category done')
  });

    const addCategory = (category) => {
        Category.create(category)
            .then(newCategory => {
                console.log(`Add category ${newCategory.categoryName} done!!`);
            })
            .catch(error => {
                console.error('Error creating user:', error);
            });
    }
}