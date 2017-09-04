const sql = require('mssql');
const mailshot = require('../services/mail').mailshot;
const readHTMLFile = require('../services/mail').readHTMLFile;
const fs = require('fs');
const {
    config
} = require('../../util');
const ejs = require('ejs');

function sendAsset (assetid, assetname, email) {
                    var ps = new sql.PreparedStatement();
                    ps.input('id', sql.Int());
                    ps.prepare('select * from assets where id = @id', function (err) {
                        ps.execute({
                            id: assetid
                        }, function (err, result) {
                            ps.unprepare();
                            console.log('asset send sql result is: ' + result);
                            var assetpath = result.recordset[0].assetpath;              

                            readHTMLFile('src/templates/sendDA.ejs', function (err, html) {
                                var template = ejs.compile(html);
                                var replacements = {
                                    assetpath: assetpath,
                                    assetname: assetname
                                };
                                var htmlToSend = template(replacements);
                                var mailOptions = {
                                    from: config.mailFromAddress,
                                    to: email,
                                    subject: 'KPCoin - Congratulations, you bought '+ assetname,
                                    html: htmlToSend
                                };
                                mailshot(mailOptions);
                                console.log(err);
                            });
                        });
                    });
    
}

module.exports = sendAsset;