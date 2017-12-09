var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;
var sql = require('mssql');
var bcrypt = require('bcrypt-nodejs');
var giftnewKPcoins = require('../../controllers/loginActions').giftnewKPcoins;
const logger = require('../../services/logger');

module.exports = function () {
    passport.use(new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
        function (req, email, password, done) {
            logger.info('running local login strategy for ' + email);
            var ps = new sql.PreparedStatement();
            ps.input('email', sql.VarChar(50));
            ps.prepare('select id, email, password, confirmedlogin from kpcusers where email = @email', function (err) {
                ps.execute({
                        email: email
                    },

                    function (err, result) {
                        if (err) {
                            return done(err);
                        }
                   
                        if (result.recordset.length === 0) {
                            ps.unprepare();
                            return done(null, false, req.flash('loginMessage', 'Incorrect login details, please try again'));
                        } else if (result.recordset[0].confirmedlogin === false) { 
                            ps.unprepare();
                            return done (null, false, req.flash('emailNotConfirmed', 'Your email has not been confirmed yet - please recheck your inbox and spam folder for the confirmation link - contact kpcoin@myaxis.co.uk for further assistance'));
                            
                        } else if (bcrypt.compareSync(password, result.recordset[0].password) === true) {
                            ps.unprepare();
                            logger.info('login Actions called ' + email);
                            Promise.all([
                            giftnewKPcoins(email, function (err) {
                                if (err) {
                                    logger.info('error from login actions ' + email + 'err: ' + err);
                                }
                            })
                            ]).then(function(){
                            var user = result;
                            return done(null, user);
                            });
                        } else {
                            ps.unprepare();
                            done(null, false,
                                req.flash('loginMessage', 'Incorrect login details, please try again')
                            );
                        }
                    });
            });
        }));

};
