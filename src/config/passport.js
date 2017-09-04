var passport = require('passport');

module.exports = function (app) {
    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser(function (user, done) {
        var usertostore = user.recordset[0];
        done(null, usertostore);
    });
    
    passport.deserializeUser(function (user, done) {
        
        done(null, user);

    });
    
     require('./strategies/local.strategy')();

};
