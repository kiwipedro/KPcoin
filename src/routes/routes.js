const express = require('express');
const sql = require('mssql');
const request = require('request');
const bcrypt = require('bcrypt-nodejs');
const navOptions = require('../controllers/navControllers');
const mailshot = require('../services/mail').mailshot;
const readHTMLFile = require('../services/mail').readHTMLFile;
const fs = require('fs');
const ejs = require('ejs');
const wallet = require('../services/wallet');
const {
    config
} = require('../../util');
var getReceiveAddress = require('../services/gift').getReceiveAddress;
const sendAsset = require('../controllers/sendAsset');
const sendEmailConfirm = require('../controllers/sendEmailConfirm');
const sendResetToken = require('../controllers/pwReset');
const setNewPassword = require('../controllers/setNewPassword').setNewPassword;
const getTxHistory = require('../controllers/txhistory');
const viewWalletDetails = require('../controllers/walletview');
const viewTxDetail = require('../controllers/txdetail');




module.exports = function (app, passport) {

    app.get('/', function (req, res) {
        res.render('index.ejs', {
            user: req.user,
            navSignedOut: navOptions.navSignedOut,
            navSignedIn: navOptions.navSignedIn
        });
    });





    app.get('/login', function (req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', {
            navSignedOut: navOptions.navSignedOut,
            message: req.flash('loginMessage'),
            message2: req.flash('signUpMessage'),
            message3: req.flash('emailNotConfirmed'),
            message4: req.flash('captchaNotClicked')
        });
    });



    app.use('/login', function (req, res, next) {
        //        if (req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null) {
        //            req.flash('captchaNotClicked', 'Please click the \"I\'m not a robot\" reCatptcha box');
        //            return res.redirect('/login');
        //
        //        }
        //
        //        var secretKey = '6LeMaywUAAAAAGnPxL-ns89I3WNlXDh8JVCdbsdS';
        //
        //        var verificationUrl = 'https://www.google.com/recaptcha/api/siteverify?secret=' + secretKey + '&response=' + req.body['g-recaptcha-response'] + '&remoteip=' + req.connection.remoteAddress;
        //
        //        request(verificationUrl, function (error, response, body) {
        //            body = JSON.parse(body);
        //
        //            if (body.success !== undefined && !body.success) {
        //                return res.json({
        //                    'responseCode': 1,
        //                    'responseDesc': 'Failed captcha verification'
        //                });
        //            } else {

        return next();
    });

    //        });
    //    }
    //);


    // process the login form
    app.post('/login',
        passport.authenticate('local', {
            successRedirect: '/mywallet',
            failureRedirect: '/login',
            failureFlash: true
        }));






    // process the signup form
    app.post('/signup', function (req, res) {

        function checkPassword(str) {
            var re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/;
            return re.test(str);
        }

        if (checkPassword(req.body.password) === false) {
            return res.json({
                'responseCode': 1,
                'responseDesc': 'Password wrong pattern - server'
            });
        }

        if (req.body.password !== req.body.confirmpassword) {
            return res.json({
                'responseCode': 1,
                'responseDesc': 'Passwords not matched - server'
            });
        }


        var ps = new sql.PreparedStatement();
        ps.input('email', sql.VarChar(50));
        ps.prepare('select email, password from kpcusers where email = @email', function (err) {
            ps.execute({
                email: req.body.email
            }, function (err, result) {
                ps.unprepare();
                if (result.recordset.length !== 0) {
                    req.flash('signUpMessage', 'Already registered, please log in');
                    res.redirect('/login');
                } else {

                    bcrypt.hash(req.body.password, null, null, function (err, hash) {
                        //create confirmation token   
                        require('crypto').randomBytes(24, function (err, buffer) {
                            var emailtoken = buffer.toString('hex');
                            var now = new Date();
                            var lastlogin = now.toJSON();
                            var confirmedlogin = 0;


                            var ps = new sql.PreparedStatement();
                            ps.input('email', sql.VarChar(50));
                            ps.input('password', sql.VarChar('max'));
                            ps.input('emailtoken', sql.VarChar('max'));
                            ps.input('lastlogin', sql.VarChar('max'));
                            ps.input('confirmedlogin', sql.Bit());

                            ps.prepare('INSERT INTO kpcusers (email, password, emailtoken, lastlogin,confirmedlogin) VALUES(@email, @password, @emailtoken, @lastlogin, @confirmedlogin)', function (err) {
                                ps.execute({
                                    email: req.body.email,
                                    password: hash,
                                    emailtoken: emailtoken,
                                    lastlogin: lastlogin,
                                    confirmedlogin: confirmedlogin
                                }, function (err, result) {
                                    ps.unprepare();
                                    res.redirect('/confirm-email-prompt');
                                    sendEmailConfirm(req.body.email, emailtoken);

                                });
                            });
                        });
                    });
                }

            });

        });
    });

    app.get('/confirm-email-prompt', function (req, res) {

        res.render('confirm-email-prompt', {
            navSignedOut: navOptions.navSignedOut
        });
    });

    app.get('/confirm-email-success', function (req, res) {
        res.render('confirm-email-success', {
            navSignedOut: navOptions.navSignedOut
        });
    });

    app.get('/confirm-email-failed', function (req, res) {
        res.render('confirm-email-failed', {
            navSignedOut: navOptions.navSignedOut
        });
    });

    app.get('/confirm-email', function (req, res) {
        var email = req.query.email;
        var token = req.query.token;
        var ps = new sql.PreparedStatement();
        ps.input('email', sql.VarChar(50));
        ps.prepare('select id, email, emailtoken from kpcusers where email = @email', function (err) {
            ps.execute({
                email: email
            }, function (err, result) {
                if (result.recordset.length !== 0) {
                    if (result.recordset[0].emailtoken === token) {
                        var confirmedlogin = 1;
                        var ps = new sql.PreparedStatement();
                        ps.input('email', sql.VarChar(50));
                        ps.input('confirmedlogin', sql.Bit());
                        ps.prepare('update kpcusers set confirmedlogin = @confirmedlogin where email = @email', function (err) {
                            ps.execute({
                                email: email,
                                confirmedlogin: confirmedlogin
                            }, function (err, result) {
                                ps.unprepare();
                                console.log(err);
                            });
                        });
                        ps.unprepare();
                        wallet.createNewWallet(result.recordset[0].id);
                        res.redirect('/confirm-email-success');
                    } else {
                        res.redirect('/confirm-email-failed');
                    }
                } else {
                    res.redirect('/confirm-email-failed');
                }
            });

        });
    });

    // =====================================
    // RESET PASSWORD SECTION ==============
    // =====================================


    app.get('/password-reset-prompt', function (req, res) {
        res.render('password-reset-prompt.ejs', {
            user: req.user,
            navSignedOut: navOptions.navSignedOut,
            navSignedIn: navOptions.navSignedIn
        });
    });

    app.get('/password-reset-sent', function (req, res) {
        res.render('password-reset-sent.ejs', {
            user: req.user,
            navSignedOut: navOptions.navSignedOut,
            navSignedIn: navOptions.navSignedIn
        });
    });

    app.get('/new-password', function (req, res) {
        res.render('new-password.ejs', {
            message: req.flash('tokenMismatch'),
            user: req.user,
            navSignedOut: navOptions.navSignedOut,
            navSignedIn: navOptions.navSignedIn
        });
    });


    app.post('/password-reset', function (req, res) {
        sendResetToken(req.body.email);
        res.redirect('/password-reset-sent');
    });

    app.get('/new-password-confirmed', function (req, res) {
        res.render('new-password-confirmed.ejs', {
            user: req.user,
            navSignedOut: navOptions.navSignedOut,
            navSignedIn: navOptions.navSignedIn
        });
    });


    app.post('/new-password', function (req, res) {
        console.log('req body is ' + JSON.stringify(req.body));
        var email = req.body.email;
        var resettoken = req.body.resettoken;
        var newpass = req.body.password;

        setNewPassword(email, resettoken, newpass, function (result) {
            if (result === 'token mismatch') {
                req.flash('tokenMismatch', 'Expired token: please click \"Log in\" and \"Forgot Password \" for a new one');
                res.redirect('/new-password');
            } else {
                res.redirect('/new-password-confirmed');
                console.log('password update ok:' + result);
            }
        });

    });





    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)

    //    app.use('/mywallet', function(req,res,next){
    //        viewWalletDetails(req.user.id, function(err, walletArray){
    //            if (!err) {
    //                res.locals.walletArray = walletArray;
    //                return next();
    //            } else {
    //                return next(err);
    //            }
    //            });
    //    });


    app.get('/mywallet', isLoggedIn, function (req, res) {
        setTimeout(function () {
            var currentPage = 1;
            if (typeof req.query.page !== 'undefined') {
                currentPage = +req.query.page;
            }
            var id = req.user.id;


            viewWalletDetails(id, function (err, walletArray) {
                if (err) {
                    console.log('err in getTxHistory');
                } else {
                    var wallet = walletArray;
                }

                getTxHistory(id, currentPage, function (err, txHistArray, pageCount) {
                    if (err) {
                        console.log('err in getTxHistory');
                    } else {
                        var transactions = txHistArray;
                        var txHistArrays = [];
                        var currList = [];
                        //split list into groups
                        while (txHistArray.length > 0) {
                            txHistArrays.push(txHistArray.splice(0, 5));
                            currList = txHistArrays[+currentPage - 1];

                        }

                        res.render('mywallet.ejs', {
                            user: req.user,
                            currentPage: currentPage,
                            currList: currList,
                            pageCount: pageCount,
                            wallet: walletArray,
                            transactions: txHistArray,
                            navSignedIn: navOptions.navSignedIn

                        });
                    }

                });
            });
        }, 400);
    });


    app.get('/transaction-detail', function (req, res) {
        var hash = req.query.txhash;
        var id = req.user.id;
        viewTxDetail(id, hash, function (err, detailArray) {
            detailArray = detailArray.substr(9,detailArray.length);
            res.render('transaction-detail.ejs',{
                txdetails: detailArray,
                 navSignedIn: navOptions.navSignedIn
            });

        });
    });



    //marketplace

    app.get('/market', function (req, res) {

        if (req.user) {
            var id = req.user.id;
            var str = '';
            var options = {
                method: 'GET',
                url: config.vURL + '/wallet/' + id,
                json: true
            };

            request.get(options, function (err, res, body) {
                    if (err) {
                        console.log('error viewing wallet' + err);
                        return (err);
                    }
                })
                .on('data', function (chunk) {
                    str += chunk;
                })
                .on('end', function () {

                    var ps = new sql.PreparedStatement();
                    ps.prepare('select * from assets', function (err) {
                        ps.execute({}, function (err, result) {
                            ps.unprepare();
                            var assets = result.recordset;
                            res.render('market.ejs', {
                                assets: assets,
                                wallet: str,
                                user: req.user,
                                navSignedOut: navOptions.navSignedOut,
                                navSignedIn: navOptions.navSignedIn
                            });

                        });
                    });
                });
        } else {
            res.redirect('/');
        }
    });


    app.get('/asset/:id', function (req, res) {
        var id = req.params.id;
        console.log('id is ' + id);
        if (req.user) {
            var userid = req.user.id;
            var str = '';
            var options = {
                method: 'GET',
                url: config.vURL + '/wallet/' + userid,
                json: true
            };

            request.get(options, function (err, res, body) {
                    if (err) {
                        console.log('error viewing wallet' + err);
                        return (err);
                    }
                })
                .on('data', function (chunk) {
                    str += chunk;
                })
                .on('end', function () {


                    var ps = new sql.PreparedStatement();
                    ps.input('id', sql.Int());
                    ps.prepare('select * from assets where id = @id', function (err) {
                        ps.execute({
                            id: id
                        }, function (err, result) {
                            var asset = result.recordset;
                            ps.unprepare();
                            res.render('asset', {
                                asset: asset,
                                wallet: str,
                                user: req.user,
                                balancemessage: req.flash('balancemessage'),
                                navSignedOut: navOptions.navSignedOut,
                                navSignedIn: navOptions.navSignedIn
                            });
                        });
                    });
                });
        }
    });

    app.post('/transaction-result', function (req, res) {
        var balance = req.query.balance;
        var assetid = req.query.assetid;
        var assetprice = req.query.price;
        var assetname = req.query.assetname;
        var assettb = req.query.assettb;
        var str = '';
        console.log('asset info: ' + assetname + ' ' + assetid + ' ' + balance + ' ' + assetprice + ' ' + assettb);
        if (balance < assetprice) {
                res.render('transaction-result', {
                        user: req.user,
                        balancemessage: 'Funding error',
                        navSignedOut: navOptions.navSignedOut,
                        navSignedIn: navOptions.navSignedIn
                    });
        } else {
        if (req.user) {

            var options = {
                method: 'POST',
                url: config.vURL + '/wallet/' + req.user.id + '/send',
                body: {
                    'outputs': [{
                        'value': assetprice,
                        'address': config.vendorAddress
                                            }]
                },
                json: true
            };

            request(options, function check(err, res, body) {
                    if (err) {
                        console.log(err);
                        return (err);
                    }
                })
                .on('data', function (chunk) {
                    str += chunk;
                })
                .on('end', function () {
                    var txObj = JSON.parse(str);
                    var txhash = txObj.hash;
                    var txdate = txObj.date;
                    var ps = new sql.PreparedStatement();
                    ps.input('userid', sql.Int());
                    ps.input('txhash', sql.VarChar('max'));
                    ps.input('assetid', sql.Int());
                    ps.input('txdate', sql.VarChar('max'));
                    ps.prepare('insert into txhistory (userid, txhash, assetid, txdate) values (@userid, @txhash, @assetid, @txdate)', function (err) {
                        ps.execute({
                            userid: req.user.id,
                            txhash: txhash,
                            assetid: assetid,
                            txdate: txdate
                        }, function (err, result) {
                            ps.unprepare();
                            if (err) {
                                console.log('error loading into txhistory ' + err);
                            } else {
                                console.log('loaded into tx history ' + result);
                            }
                        });
                    });
                    res.render('transaction-result', {
                        assetname: assetname,
                        assettb: assettb,
                        user: req.user,
                        tx: str,
                        balancemessage: '',
                        navSignedOut: navOptions.navSignedOut,
                        navSignedIn: navOptions.navSignedIn
                    });
                    sendAsset(assetid, assetname, req.user.email);
                });
        }
        }
    });


    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function (req, res) {
        req.logout();
        req.session.destroy(function (err) {
            res.redirect('/');
        });
    });
    //};



    // route middleware to make sure a user is logged in
    function isLoggedIn(req, res, next) {

        // if user is authenticated in the session, carry on 
        if (req.isAuthenticated()) {
            return next();
        }

        // if they aren't redirect them to the home page
        res.redirect('/');
    }
};
