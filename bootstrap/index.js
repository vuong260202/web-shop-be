const passport = require('passport');
const fs = require('fs');
const path = require('path');

const CONFIG = require('../config');

async function initPassport() {
  while (!global.sequelizeModels || !global.sequelizeModels.User) {
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        return resolve(true)
      }, 1000);
    })
  }
  console.log('init passport now');
  require('./passport')(passport, global.sequelizeModels.User)
}

initPassport()