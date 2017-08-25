/**
 * Created by KimMinki on 2017. 8. 22..
 */
module.exports = function(app){

    var conn = require('./db')();
    var bkfd2Password = require('pbkdf2-password');
    var hasher = bkfd2Password();
    var passport = require('passport');
    var LocalStrategy = require('passport-local').Strategy;
    var FacebookStrategy = require('passport-facebook').Strategy;

    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser(function(user, done) {
        console.log('serialize',user);
        done(null,user.authId);
    });

    passport.deserializeUser(function(id,done){

        console.log('deserialize',id);
        //id == 'local:'이미포함되있음
        var sql = 'select *from users where authId=?';
        conn.query(sql,[id],function(err,results){

            if(err){
                console.log(err);
                done('There is no user');
            }else{
                done(null,results[0]);
            }
        });

    });

    passport.use(new LocalStrategy(function (username,password,done) {

        var uname = username;
        var pwd = password;

        var sql = 'select *from users where authId=?';
        conn.query(sql, ['local:'+uname], function(err,results){
            console.log(results);

            if(err){
                return done('There is no User');
            }else{

                var user = results[0];
                return hasher({password:pwd, salt:user.salt}, function(err,pass,salt,hash){

                    if(hash === user.password){
                        console.log('LocalStrategy');
                        done(null,user);
                    }else{
                        done(null,false);
                    }
                });
            }
        });

    }));


    //일단 여기로 옴
    passport.use(new FacebookStrategy({
            clientID: '*',
            clientSecret: '*',
            callbackURL: "/auth/facebook/callback",
            profileFields:['id','email','gender','link','locale','name','timezone',
                'updated_time','verified','displayName']
        },
        function(accessToken, refreshToken, profile, done) {

            console.log(profile);

            var authId = 'facebook:'+profile.id;// 이 사용자의 고유 ID
            var sql = 'select *from users where authId=?';
            conn.query(sql,[authId],function(err, results){

                if(err){
                    console.log(err);
                    res.status(500);
                }else{
                    if(results.length > 0){
                        done(null, results[0]);
                    }else{
                        //사용자가없다면 사용자를 추가
                        var newuser = {
                            'authId':authId,
                            'username':profile.displayName,
                            'displayName':profile.displayName,
                            'email':profile.emails[0].value
                        };

                        var sql = 'insert into users set ?';

                        conn.query(sql,newuser, function(err,results){

                            if(err){
                                console.log(err);
                                done('Error');
                            }else{
                                done(null, newuser);
                            }
                        });
                    }
                }

            });

        }
    ));

    return passport;

}