
const {
    config
} = require('../../util');
const request = require('request');
const addToTxHistory = require('./txhistory-add');
const generateBlock = require('./generateblock');




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
                sendGiftCoins(id,receiveAddress);
            });
    } catch(err) {
        console.log('getting address error' + err);
    }
}


function sendGiftCoins(id,receiveAddress) {
    console.log('^*^*^ receiveaddress is ' + receiveAddress);
    try {
        var giftamount = '500000';
        var assetname = 'Gift Coins';
        var str = '';
        var options = {
            method: 'POST',
            url: config.vURL + '/wallet/primary/send',
            body: {
                'outputs': [{
                    'value': giftamount,
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
                var debitOrCreditFlag = 0;
                addToTxHistory(str, id, assetname, giftamount, debitOrCreditFlag);
                generateBlock();
       
                    });

    } catch (err) {
        console.log('gifting coins function error: ' + err);
    }

}

module.exports.getReceiveAddress = getReceiveAddress;
