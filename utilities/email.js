const nodemailer = require('nodemailer');
const pass = require('fs').readFileSync('C://Users/LENOVO/Desktop/pass.txt', 'utf8');

/**
 * send email account activated
 */
exports.sendActivatedEmail = (user) => {
    if (!user) {
        return;
    }
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'i0527630096@gmail.com',
            pass: pass
        }
    });
    const mailOptions = {
        to: user.email,
        from: 'i0527630096@gmail.com',
        subject: 'Activated your account on Flower4u',
        text: 'You are receiving this email because you (or someone else) have registered to Flower4u'
    };
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
};