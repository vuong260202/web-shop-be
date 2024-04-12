const cron = require('cron');

const updateJobSchedule = new cron.CronJob('* * * * *', async () => {
    try {
        console.log("start job calculator rate!")
        let startTime = new Date().getTime();
        let productRates = await global.sequelizeModels.ProductRate.findAll();

        for (let productRate of productRates) {
            let rates = await global.sequelizeModels.Rate.findAll({where: {
                    productId: productRate.dataValues.productId
                }});

            let total = 0;
            rates.forEach(rateDetail => {
                total += rateDetail.dataValues.rate;
            })

            await global.sequelizeModels.ProductRate.update({ totalRate: total / rates.length }, {
                where: {
                    productId: productRate.dataValues.productId
                }
            });
        }

        console.log('end job calculator rate with: ' + (new Date().getTime() - startTime));
    } catch (error) {
        console.error('Error updating jobs:', error);
    }
}, null, true, 'Asia/Ho_Chi_Minh');

updateJobSchedule.start();