const sql = require('mssql');
const mailshot = require('../services/mail').mailshot;
const readHTMLFile = require('../services/mail').readHTMLFile;
const fs = require('fs');
const {
    config
} = require('../../util');
const ejs = require('ejs');

var sendEmailConfirm = function (email, emailtoken) {

        var webaddress = config.siteaddress + '/confirm-email?email=';

        readHTMLFile('src/templates/email-confirm.ejs', function (err, html) {
                    var template = ejs.compile(html);
                    var replacements = {
                        webaddress: webaddress,
                        email: email,
                        emailtoken: emailtoken
                    };
                    var htmlToSend = template(replacements);
                    var mailOptions = {
                        from: config.mailFromAddress,
                        to: email,
                        subject: 'KPcoin - Please confirm your email address',
                        html: htmlToSend
                    };
                    mailshot(mailOptions);
                    console.log(err);

                });
};
                     

module.exports = sendEmailConfirm;
