const request = require('request');
const {config} = require('../../util');


var viewTxDetail = function (id, hash, cb) {
       let data;
        var options = {
            method: 'GET',
            url: config.vURL + '/wallet/' + id + '/tx/' + hash,
            json: true
        };
console.log('url is ' + options.url);
        request.get(options, function (err, res, body) {
                if (err) {
                    console.log('error viewing tx detail' + err);
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
