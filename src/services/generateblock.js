const request = require('request');
const { config } = require('../../util');


function generateBlock() {
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
                        console.log('block generated');
                    
                        
                });
    
}

module.exports = generateBlock;
