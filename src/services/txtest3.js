const request = require('request');
const {config} = require('../../util');

var id = '19';
var hash = '15bb16fd2a5872503d59bdf5713f8133c8aa255057b6cbfcc87a90f2c0710edc'; 

viewTxDetail(id, hash, function (err, txHashObj){
    if (txHashObj[0] === 'u'){
        var txHashObjFixed = txHashObj.substr(9,txHashObj.length);
        console.log(txHashObjFixed);
        txObj = JSON.parse(txHashObjFixed);
        console.log(txObj.outputs[0].value);
    }
});

function viewTxDetail (id, hash, cb) {
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
                    return cb(null, data);
                });

    };



