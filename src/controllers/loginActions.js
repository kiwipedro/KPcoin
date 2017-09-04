
const sql = require('mssql');
const getReceiveAddress = require('../services/gift.js').getReceiveAddress;




function giftnewKPcoins(email) {
    console.log('starting gift assessment');
    var ps = new sql.PreparedStatement();
    ps.input('email', sql.VarChar(50));
    ps.prepare('select id, email, lastlogin, nooflogins from kpcusers where email = @email', function (err) {
        ps.execute({
            email: email
        }, function (err, result) {
            if (err) {
                ps.unprepare();
                console.log('cannot retrieve lastlogin info for new kpcoins');
            } else {
                ps.unprepare();
                var lastloginDf = new Date(result.recordset[0].lastlogin);
                var now = Date.now();
                var ONE_DAY = 86400000; //milliseconds in a day
                var nooflogins = result.recordset[0].nooflogins;
                var id = result.recordset[0].id;
                console.log('doing the date compare now');
                if (nooflogins === 0 || (now - lastloginDf) < ONE_DAY) {
                    console.log('GIVE COINS!!!');
                    getReceiveAddress(id);  //runs the gifting process
                } else if ((now - lastloginDf) < ONE_DAY) {
                    console.log('TOO SOON BRO');
                } else {
                    console.log('GIVE COINS ANYWAY!!!');
                }
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
                            console.log('error writing lastlogin and nooflogin data: ' + err);
                          
                        }
                        ps.unprepare();
                        console.log('end of last login check');

                    });
                }); 
        }


module.exports.giftnewKPcoins = giftnewKPcoins;
