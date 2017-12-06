const request = require('request');
const { config } = require('../../util');
const logger = require('./logger');



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
                            logger.info('error generating ' + err);
                            logger.info('response on generate err was ' + res);
                            logger.info('body on generate err was ' + body);
                        }
                    })
                    .on('data', (chunk) => {
                        genstr += chunk;
                    })
                    .on('response', (res) => {
                        logger.info('resp code on coin generate was ' + JSON.stringify(res.statusCode));                    
                        })
                       
                    .on('end', (res) => {
                        logger.info('block generated');
                    
                        
                });
    
}

module.exports = generateBlock;
