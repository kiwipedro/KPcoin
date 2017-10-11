var express = require('express');
const { config } = require('./util');
const { configDB } = require('./util');
var app = express();
var server = require('http').createServer(app);
var sql = require('mssql');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var flash = require('connect-flash');
var passport = require('passport');
var session = require('express-session');
var MSSQLStore = require('connect-mssql')(session);
var nav = require('./src/controllers/navControllers');
var morgan = require('morgan');
var port = config.port;
const io = require('socket.io')(server);





sql.connect(configDB, function (err) {
    console.log(err);
});

app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json()); // get information from html forms

app.use(session({
    store: new MSSQLStore(configDB), // options are optional 
    secret: 'kpcoiniswonderful',
    resave: true,
    saveUninitialized: true
}));


require('./src/config/passport')(app);
app.use(flash()); // use connect-flash for flash messages stored in session


app.set('views', 'src/views');
app.set('view engine', 'ejs');


server.listen(port, function(err){
    console.log('running server on port ' + port);
});
require('./src/routes/routes.js')(app, passport);


module.exports.app = app;
module.exports.io = io;
