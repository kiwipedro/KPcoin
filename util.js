const config = {
    port: process.env.PORT || 5000,
    vURL: 'http://x:M60yC87vmul6PPp3fqw7RFZ9shcE8zRO@35.197.193.32:48445',
    vendorAddress: 'RMXF9JgfMaLSCpHyugaLahcn2TkqJKvh9A',
    mailFromAddress: 'kpcoin@myaxis.co.uk',
    mailFromPwd: 'qIGznKkwG03nqUhrUFvF3FV7zc2C1WFL',
    configDB: {
        user: 'KPcoinSQLUser',
        password: 'myDBpass123',
        server: 'MYAXISPC004\\SQLEXPRESS', // You can use 'localhost\\instance' to connect to named instance 
        database: 'KPcoin',
        options: {
        encrypt: false // Use this if you're on Windows Azure 
        }
    }
};

module.exports.config = config;
