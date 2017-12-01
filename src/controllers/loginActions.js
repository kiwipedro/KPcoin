
const sql = require('mssql');
const getReceiveAddress = require('../services/gift.js').getReceiveAddress;
const logger = require('../services/logger');



function giftnewKPcoins(email) {
    logger.info('starting gift assessment for ' + email);
    var ps = new sql.PreparedStatement();
    ps.input('email', sql.VarChar(50));
    ps.prepare('select id, email, lastlogin, nooflogins from kpcusers where email = @email', function (err) {
        ps.execute({
            email: email
        }, function (err, result) {
            if (err) {
                ps.unprepare();
                logger.info('cannot retrieve lastlogin info for new kpcoins for ' + email + ' err: ' + err);
            } else {
                ps.unprepare();
                var nooflogins = result.recordset[0].nooflogins;
                var id = result.recordset[0].id;
                    getReceiveAddress(id);  //runs the gifting process
                    updateLoginDetails(email, nooflogins);
            }
        });
    });
}
                

        function updateLoginDetails(email, nooflogins){
                var ps = new sql.PreparedStatement();
                var nowNew = new Date();
                var lastlogin = nowNew.toJSON();
                ps.input('email', sql.VarChar(50));
                ps.input('lastlogin', sql.VarChar('max'));
                ps.input('nooflogins', sql.Int());
                ps.prepare('update kpcusers set lastlogin = @lastlogin, nooflogins = @nooflogins where email = @email', function (err) {
                    ps.execute({
                        email: email,
                        lastlogin: lastlogin,
                        nooflogins: ++nooflogins
                    }, function (err, result) {
                        if (err) {
                            ps.unprepare();
                            logger.info('error writing lastlogin and nooflogin data: ' + email + ' err: ' + err);                          
                        }
                        ps.unprepare();

                    });
                }); 
        }


module.exports.giftnewKPcoins = giftnewKPcoins;
