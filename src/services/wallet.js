var request = require('request');
var verificationUrl = 'http://x:M60yC87vmul6PPp3fqw7RFZ9shcE8zRO@35.197.193.32:48445';
var sql = require('mssql');


function createNewWallet (id) {

    var options = {
        method: 'PUT',
        url: verificationUrl + '/wallet/' + id,
        body: {
            'type': 'pubkeyhash'
        },
        json: true
    };
    
    console.log ('***wallet command is ' + verificationUrl + '/wallet/' + id);
    request(options, function check(err, res, body) {

        if (err) {
            console.log(err);
            return (err);
        }
        console.log('**wallet creation body ' + JSON.stringify(body) + ' and resp: ' + JSON.stringify(res));
        var ps = new sql.PreparedStatement();
        ps.input('id', sql.Int());
        ps.input('haswallet', sql.Bit());
        ps.prepare('update kpcusers set haswallet = @haswallet where id =@id', function (err) {
            ps.execute({
                id: id,
                haswallet: '1'
            }, function (err, result) {
                ps.unprepare();
                if (err) {
                    console.log('haswallet sql err ' + err);
                    return (err);
                }
            });
        });        
    });    
}



function viewWallet (id) {
    var str = '';
    var options = {
        method: 'GET',
        url: verificationUrl + '/wallet/' + id,
        json: true
    };
   
       request.get(options, function (err, res, body) {
        if (err) {
            console.log('error viewing wallet' + err);
            return (err);
        }
    })     
        .on('data', function(chunk){
           str += chunk;
         console.log('BODY: ' + chunk);
        });

   // return viewWallet;
    
    }
    


//};
module.exports.createNewWallet = createNewWallet;
module.exports.viewWallet = viewWallet; 


