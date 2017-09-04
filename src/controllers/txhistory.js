const sql = require('mssql');
const {
    config
} = require('../../util');


var getTxHistory = function (id, page, cb) {
    var resultsArray = [];
    const request = new sql.Request();

    request.stream = true;
    request.query('select * from txHistoryAsset where userid = ' + id);
    request.on('row', row => {
        resultsArray.push(row);
    });

    request.on('error', err => {
        console.log('error = ' + JSON.stringify(err));
        return cb('err occured on txhistory datastream', null);
    });

    request.on('done', result => {
        var pageCount = Math.ceil(JSON.stringify(result.rowsAffected[0])/5);
        console.log('pageCount is ' + pageCount);
        return cb(null, resultsArray, pageCount);

    });
};



module.exports = getTxHistory;
