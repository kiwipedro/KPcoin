 function giftnewKPcoins() {
     var express = require('express');
     var app = express();
     app.listen(5000);
    

     var sql = require('mssql');

     var configDB = {
         user: 'KPcoinSQLUser',
         password: 'myDBpass123',
         server: 'MYAXISPC004\\SQLEXPRESS', // You can use 'localhost\\instance' to connect to named instance 
         database: 'KPcoin',

         options: {
             encrypt: false // Use this if you're on Windows Azure 
         }
     };

     sql.connect(configDB, function (err) {
         console.log(err);
     });
     debugger;


     //var sql = require('mssql');
     console.log('starting gift assessment');
     var ps = new sql.PreparedStatement();
     var email = 'kiwipedro@hotmail.com';
     var now = new Date();
     var ONE_DAY = 2000; // 86400000 milliseconds in a day
     ps.input('email', sql.VarChar(50));
     ps.input('lastlogin', sql.VarChar('max'));
     ps.prepare('select email, lastlogin from kpcusers where email = @email', function (err) {

         ps.execute({
             email: email
         }, function (err, result) {
             if (err) {
                 console.log('cannot retrieve lastlogin info for new kpcoins');
             }
             console.log('result');
             debugger;
             var lastlogin = result.recordset[0].lastlogin;
             var lastloginDateFormat = lastlogin.toUTCString();
             console.log('dates are ' + lastlogin + lastloginDateFormat);

             if (((new Date()) - lastloginDateFormat) > ONE_DAY) {
                 console.log('GIVE COINS!!!');
             } else {

                 console.log('end');
             }
         });
     });
 }

 giftnewKPcoins();
