const request = require('request');
const {config} = require('../../util');
const logger = require('../services/logger');


var viewWalletDetails = function (id, cb) {
        var str = '';
        var options = {
            method: 'GET',
            url: config.vURL + '/wallet/' + id,
            json: true
        };

        request.get(options, function (err, res, body) {
                if (err) {
                    logger.info('error viewing wallet for user id = '  + id + ' err: ' + err);
                    return (err);
                }
            })
            .on('data', function (chunk) {
                str += chunk;
            })
            .on('end', function () {
             cb(null, str);
        });

    };


module.exports = viewWalletDetails;


