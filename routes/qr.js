var express = require('express');
var router = express.Router();
var qr = require('qrcode');
const fs = require('fs');
const path = require('path');
var bcrypt = require('bcrypt-nodejs');

router.post('/hash-code', (req, res) => {
    let body = req.body;

    let user = global.sequelizeModels.User.findOne(req.body.userId);
    let value = user.userId + user.name;

    return res.status(200).json({
        status: 200,
        data: {
            hash: bcrypt.hashSync(value, bcrypt.genSaltSync(8), null)
        }
    });

})

router.post('/gen-qr', async (req, res) => {
    try {
        console.log("api gen-qr");
        console.log(__dirname);
        // Get data from the request body (assuming it's a JSON with a 'data' property)
        const data = req.body.data;

        if (!data) {
            return res.status(500).json({
                status: 500,
                message: 'data not found'
            });
        }

        // Generate QR code as a data URL
        const qrCodeDataURL = await qr.toDataURL(data);

        // Convert data URL to image file and save it
        const imagePath = path.join('./' + __dirname, 'qrcode.png');
        console.log("path: ", imagePath);
        await qr.toFile(imagePath, data);

        // Send the image file as a response
        return res.sendFile(imagePath, {}, (err) => {
            if (err) {
                res.status(500).json({error: 'Failed to send QR code image'});
            } else {
                // Optionally, you can delete the image file after sending it
                fs.unlinkSync(imagePath);
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Failed to generate QR code'});
    }
})

module.exports = router;