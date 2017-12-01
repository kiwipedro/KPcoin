const sql = require('mssql');
const {
    config
} = require('../../util');
const logger = require('../services/logger');

var getTxHistory = function (id, page, cb) {
    var resultsArray = [];
    const request = new sql.Request();

    request.stream = true;
    request.query('select * from txHistory where userid = ' + id);
    request.on('row', row => {
        resultsArray.push(row);
    });

    request.on('error', err => {
        logger.info('error getting TX history = ' + JSON.stringify(err));
        return cb('err occured on txhistory datastream', null);
    });

    request.on('done', result => {
        var pageCount = Math.ceil(JSON.stringify(result.rowsAffected[0])/9);
        return cb(null, resultsArray, pageCount);
    });
};



module.exports = getTxHistory;
