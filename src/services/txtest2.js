//Test written by Peter Thompson peter@myaxis.co.uk for problem with random invalid receiveAddress created in wallet after transaction
//Keep running running module until "Socket hang up error" on line 65, then check bcoin debug log for 'Invalid bech32 string.'
//Test assumes config is set to regtest network and that you have created a new wallet with id 'receiveAddProblem'
//Generate at least 101 blocks prior to testing so primary wallet has coins to share

const {
    config
} = require('../../util'); //used for config.vURL in options below.  Set your own val as applicable
const request = require('request');


var id = 'receiveAddProblem'; // set the id for the target wallet

getReceiveAddress(id);


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
                    console.log('error viewing wallet: ' + err);
                    return (err);
                }
            })
            .on('data', (chunk) => {
                str += chunk;
            })
            .on('end', () => {
                console.log(str);
                var toJSONObj = JSON.parse(str);
                var toStr = JSON.stringify(toJSONObj.account.receiveAddress);

                var receiveAddress = toStr.replace(/['"]+/g, ''); //strip off quote marks
                sendCoins(receiveAddress);
            });
    } catch (err) {
        console.log('getting address error' + err);
    }
}



function sendCoins(receiveAddress) {
    console.log('receiveaddress is ' + receiveAddress);
    try {

        var str = '';
        var options = {
            method: 'POST',
            url: config.vURL + '/wallet/primary/send', //make sure your primary wallet has some coins
            body: {
                'outputs': [{
                    'value': '5000',
                    'address': receiveAddress
            }]
            },
            json: true
        };
        console.log('receive add is ' + receiveAddress);

        request(options, (err, res, body) => {
                if (err) {
                    console.log('Error sending tx ' + err); //if "Error: socket hang up" check bcoin debug log on server
                }
            })
            .on('data', (chunk) => {
                str += chunk;
            })
            .on('end', (res) => {
                console.log('response was ' + res);
                console.log('body was ' + str);
                var genstr = '';
                var genopts = {
                    method: 'POST',
                    url: config.vURL,
                    body: {
                        method: 'generate', //using the bitcoind genrate method to confirm transaction
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
                        console.log('resp code on generate was ' + JSON.stringify(res.statusCode));
                    });

            });

    } catch (err) {
        console.log('sending coins function error: ' + err);
    }

}