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
const sendAsset = require('../controllers/sendAsset');
const sendEmailConfirm = require('../controllers/sendEmailConfirm');
const sendResetToken = require('../controllers/pwReset');
const setNewPassword = require('../controllers/setNewPassword').setNewPassword;
const getTxHistory = require('../controllers/txhistory');
const viewWalletDetails = require('../controllers/walletview');
const viewTxDetail = require('../controllers/txdetail');
const addToTxHistory = require('../services/txhistory-add');
const generateBlock = require('../services/generateblock');
const moment = require('moment');
const querystring = require('querystring');
const showPrivKey = require('../controllers/showPrivKey');
const logger = require('../services/logger');




module.exports = function (app, passport) {

    app.get('/', function (req, res) {
//        const IP_ADDRESS = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
//        logger.info('Request from' + IP_ADDRESS);
        if (req.headers['user-agent'].indexOf('MSIE') >= 0) {
            res.redirect('http://outdatedbrowser.com/en');
        } else {
            res.render('index.ejs', {
                user: req.user,
                navSignedOut: navOptions.navSignedOut,
                navSignedIn: navOptions.navSignedIn
            });
        }
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
        if (req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null) {
            req.flash('captchaNotClicked', 'Please click the \"I\'m not a robot\" reCatptcha box');
            return res.redirect('/login?#login__form');

        }

        var secretKey = '6LeMaywUAAAAAGnPxL-ns89I3WNlXDh8JVCdbsdS';

        var verificationUrl = 'https://www.google.com/recaptcha/api/siteverify?secret=' + secretKey + '&response=' + req.body['g-recaptcha-response'] + '&remoteip=' + req.connection.remoteAddress;

        request(verificationUrl, function (error, response, body) {
            body = JSON.parse(body);

            if (body.success !== undefined && !body.success) {
                return res.json({
                    'responseCode': 1,
                    'responseDesc': 'Failed captcha verification'
                });
            } else {

                return next();
            }

        });
    });


    // process the login form
    app.post('/login',
        passport.authenticate('local', {
            successRedirect: '/mywallet',
            failureRedirect: '/login?#login__form',
            failureFlash: true
        }));



    app.get('/about', function (req, res) {
        res.render('about', {
            user: req.user,
            navSignedOut: navOptions.navSignedOut,
            navSignedIn: navOptions.navSignedIn
        });
    });

    app.get('/discover-more', function (req, res) {
        res.render('discover-more', {
            user: req.user,
            navSignedOut: navOptions.navSignedOut,
            navSignedIn: navOptions.navSignedIn
        });
    });

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
        sendResetToken(req.body.email, function (result) {
            if (result === 'ok') {
                res.redirect('/password-reset-sent');
            } else {
                res.redirect('/password-reset-not-confirmed');
            }
        });

    });

    app.get('/password-reset-not-confirmed', function (req, res) {
        res.render('password-reset-not-confirmed', {
            user: req.user,
            navSignedOut: navOptions.navSignedOut,
            navSignedIn: navOptions.navSignedIn
        });
    });

    app.get('/new-password-confirmed', function (req, res) {
        res.render('new-password-confirmed.ejs', {
            user: req.user,
            navSignedOut: navOptions.navSignedOut,
            navSignedIn: navOptions.navSignedIn
        });
    });


    app.post('/new-password', function (req, res) {
        var email = req.body.email;
        var resettoken = req.body.resettoken;
        var newpass = req.body.password;

        setNewPassword(email, resettoken, newpass, function (result) {
            if (result === 'token mismatch') {
                req.flash('tokenMismatch', 'Expired token: please click \"Log in\" and \"Forgot Password \" for a new one');
                res.redirect('/new-password');
            } else {
                res.redirect('/new-password-confirmed');
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
                    logger.info('mywallet err in wallet viewing user id: ' + id + ' err: ' + err);
                } else {
                    var wallet = walletArray;
                }

                getTxHistory(id, currentPage, function (err, txHistArray, pageCount) {
                    if (err) {
                        logger.info('mywallet err in getTxHistory ' + id + ' err: ' + err);
                    } else {
                        var transactions = txHistArray;
                        var txHistArrays = [];
                        var currList = [];
                        //split list into groups
                        while (txHistArray.length > 0) {
                            txHistArrays.push(txHistArray.splice(0, 9));
                            currList = txHistArrays[+currentPage - 1];

                        }

                        res.render('mywallet.ejs', {
                            user: req.user,
                            moment: moment,
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
        }, 500);
    });


    app.get('/transaction-detail', function (req, res) {
        var hash = req.query.txhash;
        var id = req.user.id;
        viewTxDetail(id, hash, function (err, detailArray) {
            detailArray = detailArray.substr(9, detailArray.length);
            res.render('transaction-detail.ejs', {
                tx: detailArray,
                navSignedIn: navOptions.navSignedIn
            });

        });
    });



    //marketplace

    app.get('/marketplace', function (req, res) {

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
                        logger.info('market place err getting wallet info = ' + err);
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
                        logger.info('Asset id page error viewing wallet, userid = ' + userid + ' err: ' + err);
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
        var assetprice = parseInt(req.query.price);
        var assetname = req.query.assetname;
        var assettb = req.query.assettb;
        var str = '';

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
                        logger.info('tx result error sending funds user id =  '  + req.user.id + ' err: ' + err);
                        return (err);
                    }
                })
                .on('data', function (chunk) {
                    str += chunk;
                })
                .on('end', function () {
                    var txObj = JSON.parse(str);
                    var txhash = txObj.hash;
                    if (txhash === undefined) {
                        res.redirect('/asset/' + assetid + '?#funding-problem');
                    } else {
                        var debitOrCreditFlag = 1; //1 for debit, 0 for credit
                        var qstring = 'assetid=' + assetid + '&price=' + assetprice + '&assetname=' + assetname + '&assettb=' + assettb + '&txhash=' + txhash;
                        Promise.all([ addToTxHistory(str, req.user.id, assetname, assetprice, debitOrCreditFlag), 
                                     generateBlock(),
                                     sendAsset(assetid, assetname, req.user.email) ])
                                    .then(res.redirect('/transaction-result/?' + qstring));
                    }
                });
        }
    });

    app.get('/transaction-result', function (req, res) {
        var assetid = req.query.assetid;
        var assetprice = parseInt(req.query.price);
        var assetname = req.query.assetname;
        var assettb = req.query.assettb;
        var txhash = req.query.txhash;
        var id = req.user.id;


        viewTxDetail(id, txhash, function (err, detailArray) {
            detailArray = detailArray.substr(9, detailArray.length);
            setTimeout(function () {
                res.render('transaction-result', {
                    assetname: assetname,
                    assettb: assettb,
                    user: req.user,
                    tx: detailArray,
                    navSignedOut: navOptions.navSignedOut,
                    navSignedIn: navOptions.navSignedIn,
                    myval: 1
                });
            }, 0);
        });
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

    app.get('/terms-of-use', function (req, res) {
        res.render('terms-of-use.ejs', {
            user: req.user,
            navSignedOut: navOptions.navSignedOut,
            navSignedIn: navOptions.navSignedIn
        });
    });

    app.get('/privacy-cookie-policy', function (req, res) {
        res.render('privacy-cookie-policy.ejs', {
            user: req.user,
            navSignedOut: navOptions.navSignedOut,
            navSignedIn: navOptions.navSignedIn
        });
    });

    app.get('/acceptable-use', function (req, res) {
        res.render('acceptable-use.ejs', {
            user: req.user,
            navSignedOut: navOptions.navSignedOut,
            navSignedIn: navOptions.navSignedIn
        });
    });

    app.get('/blockchain-bingo', function (req, res) {
        res.render('blockchain-bingo', {
            user: req.user,
            navSignedOut: navOptions.navSignedOut,
            navSignedIn: navOptions.navSignedIn
        });
    });


    app.post('/priv-key', function (req, res) {
        var recAdd = req.query.receiveaddress;
        var id = req.user.id;
        showPrivKey(id, recAdd, function (err, privkey) {
            if (err) {
                logger.info('error getting private key user id ' + id + ' err: ' + err);
            } else {
                res.redirect('/priv-key/?privkey=' + privkey);
            }

        });


    });



    app.get('/priv-key', function (req, res) {
        var privkey = req.query.privkey;
        res.render('priv-key', {
            privkey: privkey
        });
    });



    // route middleware to make sure a user is logged in
    function isLoggedIn(req, res, next) {

        // if user is authenticated in the session, carry on 
        if (req.isAuthenticated()) {
            return next();
        }

        // if they aren't redirect them to the home page
        res.redirect('/');
    }

    app.use(function (req, res, next) {
        res.status(404);

        if (req.accepts('html')) {
            res.render('404', {
                url: req.url,
                user: req.user,
                navSignedOut: navOptions.navSignedOut,
                navSignedIn: navOptions.navSignedIn
            });
            return;
        }
    });


};
