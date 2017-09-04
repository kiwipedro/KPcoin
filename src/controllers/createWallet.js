const wallet = require('../services/wallet');
const sql = require('mssql');


function createWalletifEmailConfirmed(email) {
    var ps = new sql.PreparedStatement();
    ps.input('email', sql.VarChar(50));
    ps.input('confirmedlogin', sql.Bit());
    console.log('running first SQL call');
    ps.prepare('select id, email, confirmedlogin, haswallet from kpcusers where email = @email', function (err) {
        ps.execute({
            email: email
        }, function (err, result) {
            ps.unprepare();
            if (result.recordset[0].haswallet !== true) {
                wallet.createNewWallet(result.recordset[0].id);
            }
        });
    });
}

module.exports.createWalletifEmailConfirmed = createWalletifEmailConfirmed;
