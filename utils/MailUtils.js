const nodemailer = require("nodemailer");
const CONFIG = require("../config");
let exported = {}
module.exports = exported

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: CONFIG.email.username,
        pass: CONFIG.email.password
    }
});

function mailOptions(resetToken, user) {

    const urlMap = {
        user: CONFIG.email.urlUser,
        admin: CONFIG.email.urlAdmin
    }
    console.log(urlMap, "---", user.role)
    const url = urlMap[user.role] + resetToken;
    return {
        from: CONFIG.email.username,
        to: user.email,
        subject: 'Forgot password',
        html: `
        <h2>Hi "${user.fullname}",</h2>
        <h2>You have submitted a password change request</h2>
        <p>Please click the link below to change your password. The password reset is only valid for the next 5 minutes.</p>
        <div><span style="font-weight: bold">URL: </span><a href="${url}">"${url}"</a></div>
        <div>
        <a>If you did not request a password reset, please ignore this email, make sure you can still login to your account or contact us via email:</a>
        <a href="${url}">support@gmail.com</a>
        </div>
        <div>
        <p>Thank you,</p>
        <p>Shoe Shop</p>
        </div>`
    }
}

exported.transporter = transporter
exported.mailOptions = mailOptions
