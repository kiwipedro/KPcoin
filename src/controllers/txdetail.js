const request = require('request');
const {config} = require('../../util');
const logger = require('../services/logger');


var viewTxDetail = function (id, hash, cb) {
       let data;
        var options = {
            method: 'GET',
            url: config.vURL + '/wallet/' + id + '/tx/' + hash,
            json: true
        };
        request.get(options, function (err, res, body) {
                if (err) {
                    logger.info('error viewing tx detail, user id: '  + id + ' err: ' + err);
                    return cb(err, null);
                }
            })
            .on('data', function (chunk) {
                data += chunk;
            })
            .on('end', function () {
                    cb(null, data);
                });

    };



module.exports = viewTxDetail;
