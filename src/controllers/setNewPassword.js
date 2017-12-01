const sql = require('mssql');
const bcrypt = require('bcrypt-nodejs');
const {
    config
} = require('../../util');
const logger = require('../services/logger');





var clearResetPW = function(email){
    var ps = new sql.PreparedStatement();
    ps.input('email', sql.VarChar(50));
    ps.prepare('delete from pwreset where email = @email', function (err) {
            logger.info('err sql prepare from clearResetPW '  + email + ' err: ' + err);
            ps.execute({
                email: email
            }, function (err, result){
                ps.unprepare();
                console.log('deleting result' + result);
                return;
            });
    });
};



var setthePassword = function (email, newpass) {
bcrypt.hash(newpass, null, null, function (err, hash) {
   var ps = new sql.PreparedStatement();
    ps.input('email', sql.VarChar(50));
    ps.input('password', sql.VarChar('max'));
    ps.prepare('UPDATE kpcusers set password = @password where email = @email', function (err) {
            logger.info('err sql prepare from pwsetting '  + email + ' err: ' + err);
            ps.execute({
                    email: email,
                    password: hash
                }, function (err, result) {
                  ps.unprepare();
                if(err){
                 logger.info('err sql execute from pwsetting '  + email + ' err: ' + err);
                } else {
                    clearResetPW(email);
                    return;
                }
                });
            });
    });
};


var setNewPassword = function (email, resettoken, newpass, cb) {
    var ps = new sql.PreparedStatement();
    ps.input('email', sql.VarChar(50));
    ps.input('resettoken', sql.VarChar('max'));
    ps.prepare('select * from pwreset where email = @email', function (err) {
        logger.info('reset pw sql error '  + email + ' err: ' + err);
        ps.execute({
            email: email
        }, function (err, result) {
            ps.unprepare();
            if (result.recordset.length === 0) {
                logger.info('no result from sql execute from pwreset '  + email + ' res: ' + result);
                return cb('token mismatch');
            } else if (resettoken !== result.recordset[0].resettoken) { //stop if being hacked
                logger.info('token mismatch! '  + email);
                return cb('token mismatch');
            } else {
                setthePassword(email, newpass);
                return cb('ok');
            }
        });
    });
};




module.exports.setNewPassword = setNewPassword;
