
const {
    config
} = require('../../util');
const request = require('request');
const addToTxHistory = require('./txhistory-add');
const generateBlock = require('./generateblock');
const logger = require('./logger');



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
                    logger.info('getreceive address err viewing wallet, user id = ' + id + ' err: ' + err);
                    return (err);
                }
            })
            .on('data', (chunk) => {
                str += chunk;
            })
            .on('end', () => {
                var toJSONObj = JSON.parse(str);
                var toStr = JSON.stringify(toJSONObj.account.receiveAddress);
                var receiveAddress = toStr.replace(/['"]+/g, '');
                sendGiftCoins(id,receiveAddress);
            });
    } catch(err) {
        logger.info('getreceiveaddress error = ' + err);
    }
}


function sendGiftCoins(id,receiveAddress) {
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

        request(options, (err, res, body) => {
                if (err) {
                    logger.info('error sending tx for userid = ' + id + ' err: ' + err);
                    logger.info('response on tx err for userid = ' + id + ' err: '  + res);
                    logger.info('body on tx err was for userid = ' + id + ' err: ' + body);

                    //return (err);
                }
            })
            .on('data', (chunk) => {
                str += chunk;
            })
            .on('end', (res) => {
                var debitOrCreditFlag = 0;
                addToTxHistory(str, id, assetname, giftamount, debitOrCreditFlag);
                generateBlock();
       
                    });

    } catch (err) {
        logger.info('gifting coins function error, userid ' + id + ' err: ' + err);
    }

}

module.exports.getReceiveAddress = getReceiveAddress;
