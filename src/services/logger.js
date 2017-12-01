var winston = require('winston');

var logger = new winston.Logger({
 transports: [
     new (winston.transports.File)({filename:'./src/logs/app.log'})
 ]
});
  
//logger.on('error', function(err) {
//  // Handle, report, or silently ignore connection errors and failures 
//});
 
//var logger = new winston.Logger({
//  transports: [winstonPapertrail]
//});

module.exports = logger;