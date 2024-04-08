var express = require('express');
const {isAdmin} = require('../utils/webUtils');
var router = express.Router();

router.post('/update-product', isAdmin, function (req, res) {
    return res.status(200).json({
        status: 200,
        data: {}
    });
})

router.get('/')


module.exports = router;