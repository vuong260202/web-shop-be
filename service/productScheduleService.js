const cron = require('cron');
const {BelongsTo, HasMany} = require("sequelize");

const updateJobSchedule = new cron.CronJob('* * * * *', async () => {
    let ProductStatistic = global.sequelizeModels.ProductStatistic;
    let Rate = global.sequelizeModels.Rate;
    let Transaction = global.sequelizeModels.Transaction;

    try {
        let updatePromises = [];
        console.log("start job calculator rate!")
        let startTime = new Date().getTime();
        let productStatistics = await ProductStatistic.findAll(
            {
                include: [
                    {
                        association: new HasMany(ProductStatistic, Rate, {
                            as: 'rates', foreignKey: 'productId', targetKey: 'productId'
                        }),
                    },
                    {
                        association: new HasMany(ProductStatistic, Transaction, {
                            as: 'transactions', foreignKey: 'productId', targetKey: 'productId'
                        }),
                    }
                ]
            }
        );

        productStatistics.forEach(product => {
            // handle rating
            product.rates = product.rates?.filter(rate => rate.rate > 0) ?? [];

            let length = Math.max(product.rates.length, 1);
            let sum = product.rates.reduce((total, rate) => total + rate.rate, 0) || 0;

            product.totalRate = sum / length;

            product.transactions = product.transactions?.filter(transaction => transaction.status === 'DONE') ?? [];
            product.transactionCount = product.transactions.length;
            product.totalCount = product.transactions.reduce((total, transaction) => total + transaction.count, 0) || 0;

            updatePromises.push(product.save());
        })

        await Promise.all(updatePromises);

        console.log('end job calculator rate with: ' + (new Date().getTime() - startTime));

    } catch (error) {
        console.error('Error updating jobs:', error);
    }
}, null, true, 'Asia/Ho_Chi_Minh');

updateJobSchedule.start();