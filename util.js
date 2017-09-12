const config = {
    port: process.env.PORT || 5000,
    siteaddress: 'http://localhost:5000',
    vURL: 'http://x:M60yC87vmul6PPp3fqw7RFZ9shcE8zRO@35.197.193.32:48445',
    vendorAddress: 'RMXF9JgfMaLSCpHyugaLahcn2TkqJKvh9A',
    mailFromAddress: 'kpcoin@myaxis.co.uk',
    mailFromPwd: 'qIGznKkwG03nqUhrUFvF3FV7zc2C1WFL'
};

//const configDB = {
//        user: 'KPcoinSQLUser',
//        password: 'myDBpass123',
//        server: 'MYAXISPC004\\SQLEXPRESS', // You can use 'localhost\\instance' to connect to named instance 
//        database: 'KPcoin',
//        options: {
//        encrypt: false // Use this if you're on Windows Azure 
//        }
//    };



var configDB = {
    user: 'kpc.sql',
    password: 'jaEeCekeQa7PHP7ur3rMvneRcptDEoZNo',
    server: 'az-kpc-db-sv1.database.windows.net', 
    database: 'KPcoin',
    encrypt: true,
    connectionTimeout: 50000,
   // port: 1433,
    options: {
        encrypt: true // Use this if you're on Windows Azure 
    }
};


module.exports.config = config;
module.exports.configDB = configDB;
