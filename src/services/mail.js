const nodemailer = require('nodemailer');
const fs = require('fs');
const {
    config
} = require('../../util');
const logger = require('./logger');



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
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: config.mailFromAddress,
            pass: config.mailFromPwd
        }
    });
    var mailsend = transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            logger.info('Mail sender error = ' + error);
        } else {
            logger.info('Email sent: ' + info.response);
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
            logger.info('err sending DA =  ' + err);
        } else {
        return;
        }
    });
};






module.exports.mailshot = mailshot;
module.exports.readHTMLFile = readHTMLFile;
