const sql = require('mssql');
const mailshot = require('../services/mail').mailshot;
const readHTMLFile = require('../services/mail').readHTMLFile;
const fs = require('fs');
const ejs = require('ejs');
const {
    config
} = require('../../util');


var clearPreviousResetTokens = function (email) {
        var ps = new sql.PreparedStatement();
        ps.input('email', sql.VarChar(50));
        ps.prepare('delete from pwreset where email = @email', function (err) {
                    ps.execute({
                        email: email,
                    }, function (err, result) {
                        ps.unprepare();
                        console.log('delete pwreset result is ' + err);
                    });
        });
};



var sendResetToken = function (email) {
    clearPreviousResetTokens(email);
    require('crypto').randomBytes(26, function (err, buffer) {
        var resettoken = buffer.toString('hex');
        var ps = new sql.PreparedStatement();
        ps.input('email', sql.VarChar(50));
        ps.input('resettoken', sql.VarChar('max'));
        ps.prepare('insert into pwreset (email, resettoken) values (@email, @resettoken)', function (err) {
            console.log('pw sql insert err: ' + err);
            ps.execute({
                email: email,
                resettoken: resettoken
            }, function (err, result) {
                ps.unprepare();
                if (err) {
                    console.log('err on pw reset sql execute ' + err);
                } else {
                    var webaddress = config.siteaddress + '/new-password?email=';
                    readHTMLFile('src/templates/password-reset.ejs', function (err, html) {
                        var template = ejs.compile(html);
                        var replacements = {
                            webaddress: webaddress,
                            email: email,
                            resettoken: resettoken
                        };
                        var htmlToSend = template(replacements);
                        var mailOptions = {
                            from: config.mailFromAddress,
                            to: email,
                            subject: 'KPcoin - Reset password request',
                            html: htmlToSend
                        };
                        mailshot(mailOptions);
                        console.log(err);

                    });
                }
            });
        });
    });
};





                    
            
module.exports = sendResetToken;
