const {
    config
} = require('../../util');
const sql = require('mssql');
const logger = require('./logger');

function addToTxHistory(str, id, assetname, txprice, txflag) {
    var txObj = JSON.parse(str);
    var txhash = txObj.hash;
    var txdate = txObj.date;
    var txfee = txflag === 0 ? 0 : txObj.fee;
    var ps = new sql.PreparedStatement();
    ps.input('userid', sql.Int());
    ps.input('txhash', sql.VarChar('max'));
    ps.input('assetname', sql.VarChar('50'));
    ps.input('txdate', sql.VarChar('max'));
    ps.input('txfee', sql.Int());
    ps.input('txprice', sql.Int());
    ps.input('txflag',sql.Bit());
    ps.prepare('insert into txhistory (userid, txhash, assetname, txdate, txfee, txprice, txflag) values (@userid, @txhash, @assetname, @txdate, @txfee, @txprice, @txflag)', function (err) {
        ps.execute({
            userid: id,
            txhash: txhash,
            assetname: assetname,
            txdate: txdate,
            txfee: txfee,
            txprice: txprice,
            txflag: txflag
        }, function (err, result) {
            ps.unprepare();
            if (err) {
                logger.info('error loading into txhistory user id = ' + id + ' err: ' + err);
            } else {
                return;
            }
        });
    });
}

module.exports = addToTxHistory;

