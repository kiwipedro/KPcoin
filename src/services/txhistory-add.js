const {
    config
} = require('../../util');
const sql = require('mssql');

function addToTxHistory(str, id, assetname, txprice, txflag) {
    console.log('what are txprice/flag' + txprice + ' ' + txflag);
    var txObj = JSON.parse(str);
    var txhash = txObj.hash;
    var txdate = txObj.date;
    var ps = new sql.PreparedStatement();
    ps.input('userid', sql.Int());
    ps.input('txhash', sql.VarChar('max'));
    ps.input('assetname', sql.VarChar('50'));
    ps.input('txdate', sql.VarChar('max'));
    ps.input('txprice', sql.Int());
    ps.input('txflag',sql.Bit());
    ps.prepare('insert into txhistory (userid, txhash, assetname, txdate, txprice, txflag) values (@userid, @txhash, @assetname, @txdate, @txprice, @txflag)', function (err) {
        ps.execute({
            userid: id,
            txhash: txhash,
            assetname: assetname,
            txdate: txdate,
            txprice: txprice,
            txflag: txflag
        }, function (err, result) {
            ps.unprepare();
            if (err) {
                console.log('error loading into txhistory ' + err);
            } else {
                console.log('loaded into tx history ' + JSON.stringify(result));
            }
        });
    });
}

module.exports = addToTxHistory;

