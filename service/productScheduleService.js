const cron = require('cron');
const {BelongsTo, HasMany} = require("sequelize");

const updateJobSchedule = new cron.CronJob('* * * * *', async () => {
    let ProductStatistic = global.sequelizeModels.ProductStatistic;
    let Rate = global.sequelizeModels.Rate;
    let Transaction = global.sequelizeModels.Transaction;
    let Product = global.sequelizeModels.Product;

    try {
        let updatePromises = [];
        console.log("start job calculator rate!")
        let startTime = new Date().getTime();
        let productStatistics = await ProductStatistic.findAll(
            {
                include: [
                    {
                        association: new BelongsTo(ProductStatistic, Product, {
                            as: 'product', foreignKey: 'productId', targetKey: 'id'
                        }),

                        include: [
                            {
                                association: new HasMany(Product, Rate, {
                                    as: 'rates', targetKey: 'id', foreignKey: 'productId'
                                }),
                            },
                            {
                                association: new HasMany(Product, Transaction, {
                                    as: 'transactions', foreignKey: 'productId', targetKey: 'productId'
                                }),
                            }
                        ]
                    },
                ]
            }
        );

        console.log('productStatistics', productStatistics);

        productStatistics.forEach(productStatistic => {
            // handle rating
            productStatistic.product.rates = productStatistic.product.rates?.filter(rate => rate.rate > 0) ?? [];

            let length = Math.max(productStatistic.product.rates.length, 1);
            let sum = productStatistic.product.rates.reduce((total, rate) => total + rate.rate, 0) || 0;

            productStatistic.totalRate = sum / length;

            productStatistic.transactions = productStatistic.product.transactions?.filter(transaction => transaction.status === 'DONE') ?? [];
            productStatistic.transactionCount = productStatistic.product.transactions.length;
            productStatistic.totalCount = productStatistic.product.transactions.reduce((total, transaction) => total + transaction.count, 0) || 0;

            // console.log(product);
            updatePromises.push(productStatistic.save());
        })

        await Promise.all(updatePromises);

        console.log('end job calculator rate with: ' + (new Date().getTime() - startTime));

    } catch (error) {
        console.error('Error updating jobs:', error);
    }
}, null, true, 'Asia/Ho_Chi_Minh');

updateJobSchedule.start();