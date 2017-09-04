var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;
var sql = require('mssql');
var bcrypt = require('bcrypt-nodejs');
var giftnewKPcoins = require('../../controllers/loginActions').giftnewKPcoins;

module.exports = function () {
    passport.use(new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
        function (req, email, password, done) {
            console.log('running local strat');
            var ps = new sql.PreparedStatement();

            ps.input('email', sql.VarChar(50));
            console.log('running local strat2');
            ps.prepare('select id, email, password from kpcusers where email = @email', function (err) {
                console.log('running local strat3');
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
                        } else if (bcrypt.compareSync(password, result.recordset[0].password) === true) {
                            ps.unprepare();
                            console.log('login Actions called');
                            giftnewKPcoins(email, function (err) {
                                if (err) {
                                    console.log('error from login actions');
                                    //return res.redirect('/login');
                                }
                            });
                            var user = result;
                            done(null, user);
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
