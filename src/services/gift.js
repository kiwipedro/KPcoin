
const {
    config
} = require('../../util');
const request = require('request');




function getReceiveAddress(id) {
  
    try { 
    var str = '';
        var options = {
            method: 'GET',
            url: config.vURL + '/wallet/' + id,
            json: true
        };
        request(options, (err, res, body) => {
                if (err) {
                    console.log('error viewing wallet' + err);
                    return (err);
                }
            })
            .on('data', (chunk) => {
                str += chunk;
            })
            .on('end', () => {
                 console.log('getReceiveAddress: is' + str);
                var toJSONObj = JSON.parse(str);
                var toStr = JSON.stringify(toJSONObj.account.receiveAddress);
                var receiveAddress = toStr.replace(/['"]+/g, '');
                sendGiftCoins(receiveAddress);
            });
    } catch(err) {
        console.log('getting address error' + err);
    }
}


function sendGiftCoins(receiveAddress) {
    console.log('^*^*^ receiveaddress is ' + receiveAddress);
    try {

        var str = '';
        var options = {
            method: 'POST',
            url: config.vURL + '/wallet/primary/send',
            body: {
                'outputs': [{
                    'value': '500000',
                    'address': receiveAddress
            }]
            },
            json: true
        };
        console.log('receive add is ' + receiveAddress);

        request(options, (err, res, body) => {
                if (err) {
                    console.log('error sending tx ' + err);
                    console.log('response on tx err was ' + res);
                    console.log('body on tx err was ' + body);

                    //return (err);
                }
            })
            .on('data', (chunk) => {
                str += chunk;
            })
            .on('end', (res) => {
                console.log('response was ' + res);
                console.log('bdoy was ' + str);
                var genstr = '';
                var genopts = {
                    method: 'POST',
                    url: config.vURL,
                    body: {
                        method: 'generate',
                        params: ['1']
                    },
                    json: true
                };
                request(genopts, (err, res, body) => {
                        if (err) {
                            console.log('error generating ' + err);
                            console.log('response on generate err was ' + res);
                            console.log('body on generate err was ' + body);
                        }
                    })
                    .on('data', (chunk) => {
                        genstr += chunk;
                    })
                    .on('response', (res) => {
                        console.log('resp code on coin generate was ' + JSON.stringify(res.statusCode));                    
                        })
                       
                    .on('end', (res) => {
                        console.log('coins delievered');
                        
                });
                    });

    } catch (err) {
        console.log('gifting coins function error: ' + err);
    }

}

module.exports.getReceiveAddress = getReceiveAddress;
