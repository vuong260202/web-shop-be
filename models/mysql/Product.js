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

        setTimeout(() => {
            Product.findAll().then(products => {
                if (!products || products.length === 0) {
                    addProduct({
                        productName: 'Duramo speed',
                        price: 2500000,
                        categoryId: 2,
                        sizes: '[38, 39, 40, 41, 42]',
                        description: '',
                        path: '/img/adidas-175439.png',
                        total: 10,
                        status: 'active'
                    })
                    addProduct({
                        productName: 'Supernova solution',
                        price: 4000000,
                        categoryId: 2,
                        sizes: '[38, 39, 40, 41, 42]',
                        description: '',
                        path: '/img/adidas-175714.png',
                        total: 10,
                        status: 'active'
                    })
                    addProduct({
                        productName: 'Adidas Samba Classic White',
                        price: 99000,
                        categoryId: 2,
                        sizes: '[38, 39, 40, 41, 42]',
                        description: '',
                        path: '/img/adidas-180426.png',
                        total: 10,
                        status: 'active'
                    })
                }
            })
        }, 2000);
    });

    const addProduct = (product) => {
        Product.create(product)
            .then(newProduct => {
                global.sequelizeModels.ProductStatistic.create({
                    productId: newProduct.id,
                });
                console.log(`Add product ${product.productName} done!!`);
            })
            .catch(error => {
                console.error('Error creating user:', error);
            });
    }
}