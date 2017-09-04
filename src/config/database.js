var configDB = {
    user: 'KPcoinSQLUser',
    password: 'myDBpass123',
    server: 'MYAXISPC004\\SQLEXPRESS', // You can use 'localhost\\instance' to connect to named instance 
    database: 'KPcoin',

    options: {
        encrypt: false // Use this if you're on Windows Azure 
    }
};

module.exports = configDB;
