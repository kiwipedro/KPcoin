const sql = require('mssql');
const bcrypt = require('bcrypt-nodejs');
const {
    config
} = require('../../util');




var clearResetPW = function(email){
    var ps = new sql.PreparedStatement();
    ps.input('email', sql.VarChar(50));
    ps.prepare('delete from pwreset where email = @email', function (err) {
            console.log('err sql prepare from clearResetPW ' + err);
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
            console.log('err sql prepare from pwsetting ' + err);
            ps.execute({
                    email: email,
                    password: hash
                }, function (err, result) {
                  ps.unprepare();
                if(err){
                 console.log('err sql execute from pwsetting ' + err);
                } else {
                    console.log('reset pw result from pwsetting ' + result);
                    clearResetPW(email);
                    return;
                }
                });
            });
    });
};


var setNewPassword = function (email, resettoken, newpass, cb) {
    var ps = new sql.PreparedStatement();
    console.log('email from setnewpassword is ' + email);
    ps.input('email', sql.VarChar(50));
    ps.input('resettoken', sql.VarChar('max'));
    ps.prepare('select * from pwreset where email = @email', function (err) {
        console.log('reset sql error?' + err);
        ps.execute({
            email: email
        }, function (err, result) {
            console.log('reset sql error?' + err);
            ps.unprepare();
            if (result.recordset.length === 0) {
                console.log('no result from sql execute from pwreset ' + result);
                return cb('token mismatch');
            } else if (resettoken !== result.recordset[0].resettoken) { //stop if being hacked
                console.log('token mismatch!');
                return cb('token mismatch');
            } else {
                setthePassword(email, newpass);
                return cb('ok');
            }
        });
    });
};




module.exports.setNewPassword = setNewPassword;
