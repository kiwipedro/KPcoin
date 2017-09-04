var request = require('request');
var verificationUrl = 'http://x:M60yC87vmul6PPp3fqw7RFZ9shcE8zRO@35.197.193.32:48445';

sendTX();

function sendTX () {

    var options = {
        method: 'POST',
        url: verificationUrl + '/wallet/primary/send',
        body: {
            'outputs':[{
                'value':'5000',
                'address': 
            }]
        },
        json: true
    };
    
   
    request(options, function check(err, res, body) {

        if (err) {
            console.log(err);
            return (err);
        }
        var tx = body.tx;
        console.log(tx);
        
        console.log('**transaction send body ' + JSON.stringify(body) + ' and resp: ' + JSON.stringify(res));
    });
}