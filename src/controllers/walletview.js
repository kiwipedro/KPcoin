const request = require('request');
const {config} = require('../../util');


var viewWalletDetails = function (id, cb) {
        var str = '';
        var options = {
            method: 'GET',
            url: config.vURL + '/wallet/' + id,
            json: true
        };

        request.get(options, function (err, res, body) {
                if (err) {
                    console.log('error viewing wallet' + err);
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
