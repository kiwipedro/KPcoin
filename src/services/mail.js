const nodemailer = require('nodemailer');
const fs = require('fs');
const {
    config
} = require('../../util');




var readHTMLFile = function (path, callback) {
    fs.readFile(path, {
        encoding: 'utf-8'
    }, function (err, html) {
        if (err) {
            callback(err);
        } else {
            callback(null, html);
        }
    });
};

var mailshot = function (mailOptions) {
    console.log('does mailshot run?');
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: config.mailFromAddress,
            pass: config.mailFromPwd
        }
    });
    var mailsend = transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
};


var sendDA = function (mailOptions) {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'peter@myaxis.co.uk',
            pass: '@k1w1p3dr0'
        }
    });

    var mailsend = transporter.sendMail(mailOptions, function (err, info) {
        if (err) {
            console.log('err sending DA: ' + err);
        } else {
            console.log('DA Email sent: ' + info.repsonse);
        }
    });
};






module.exports.mailshot = mailshot;
module.exports.readHTMLFile = readHTMLFile;
