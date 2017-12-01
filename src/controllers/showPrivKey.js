const request = require('request');
const {config} = require('../../util');
const logger = require('../services/logger');


var showPrivKey = function (id, receiveaddress, cb) {
        var str = '';
        var options = {
            method: 'GET',
            url: config.vURL + '/wallet/' + id + '/wif/' + receiveaddress,
            json: true
        };

        request.get(options, function (err, res, body) {
                if (err) {
                    logger.info('error viewing private key, user id: '  + id + ' err: ' + err);
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


module.exports = showPrivKey;