/**
 * Created by KimMinki on 2017. 8. 23..
 */



module.exports = function (passport) {

    var bkfd2Password = require('pbkdf2-password');
    var hasher = bkfd2Password();

    var conn = require('../config/mysql/db')();
    var express = require('express');
    var router = express.Router(); //Router Level

    /*
    logout
     */
    router.get('/logout', function(req, res){
        req.logout();
        req.session.save(function(){
            res.redirect('/board');
        });
    });

    /*
    login
     */
    router.get('/login',function(req,res){

        var sql = 'select id, title from board';
        conn.query(sql,function(err,topics,fields){
            res.render('auth/login',{topics:topics,user:req.user});
        });

    });

    /*
    Facebook Strategy
     */

    //First Come
    router.get('/facebook',
        passport.authenticate(
            'facebook',
            {scope: 'email'}
        )
    );
    //Second Come
    router.get('/facebook/callback',
        passport.authenticate('facebook',
            {
                successRedirect: '/board',
                failureRedirect: '/auth/login'
            })
    );

    /*
    local Strategy
    */
    router.post('/login',
        passport.authenticate('local',
    {
        successRedirect:'/board',
        failureRedirect:'/auth/login',
        failureFlash: false
    }));


    /*
    register
     */
    router.get('/register',function(req,res){
        var sql = 'select id, title  from board';
        conn.query(sql,function(err,topics,fields){
            res.render('auth/register',{topics:topics,user:req.user});
        });
    });

    router.post('/register',function (req,res){

            hasher({password:req.body.password},function(err, pass, salt, hash){

                var user = {
                    authId:'local:'+req.body.username,
                    username:req.body.username,
                    password:hash,
                    salt:salt,
                    displayName:req.body.displayName
                };

                var sql = 'insert into users set ?';
                conn.query(sql, user, function(err,results){

                    if(err){
                        console.log(err);
                        res.status(500);
                    }else{
                        req.login(user,function(err){
                            if(err){
                                console.log(err);
                            }
                            req.session.save(function(){
                                res.redirect('/board');
                            });
                        });
                    }
                });
            });

    });

    return router;
}