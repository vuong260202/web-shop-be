const Sequelize = require('sequelize');
const {add} = require("nodemon/lib/rules");
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
            categoryId: {
                field: 'CATEGORY_ID',
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            sizes: {
                field: 'SIZES',
                type: Sequelize.STRING(200),
                defaultValue: '[]',
                allowNull: false
            },
            description: {
                field: 'DESCRIPTION',
                type: Sequelize.STRING(200),
                defaultValue: '',
                allowNull: false
            },
            path: {
                field: 'PATH',
                type: Sequelize.STRING(200),
                defaultValue: '',
                allowNull: false
            },
            total: {
                field: 'TOTAL',
                type: Sequelize.INTEGER,
                defaultValue: 0
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

    Product.sync({force: false, alter: true}).then(() => {
        if (!global.sequelizeModels) {
            global.sequelizeModels = {}
        }

        global.sequelizeModels.Product = Product

        console.log('sync Product done')
    });

    const addProduct = (product) => {
        Product.findOne({
            where: {
                productName: product.productName
            }
        }).then((existingProduct) => {
            if (existingProduct) {
                console.log('product already exists<<<< ');
            } else {
                Product.create(product)
                    .then(newUser => {
                        console.log(`Add product ${product.productName} done!!`);
                    })
                    .catch(error => {
                        console.error('Error creating user:', error);
                    });
            }
        })
    }

    addProduct({
        productName: 'test1',
        price: 100000,
        categoryId: 1,
        sizes: '[1, 2, 3]',
        description: '',
        path: '/img/1713726098183.webp',
        total: 10,
        status: 'active'
    })
    addProduct({
        productName: 'test2',
        price: 100000,
        categoryId: 1,
        sizes: '[1, 2, 3]',
        description: '',
        path: '/img/1713726103813.jpg',
        total: 10,
        status: 'active'
    })
    addProduct({
        productName: 'test3',
        price: 100000,
        categoryId: 1,
        sizes: '[1, 2, 3]',
        description: '',
        path: '/img/1713726116307.png',
        total: 10,
        status: 'active'
    })
}