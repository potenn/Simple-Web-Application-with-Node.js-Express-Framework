/**
 * Created by KimMinki on 2017. 8. 23..
 */

var express = require('express');
var router = express.Router();
var fs = require('fs');
var conn = require('../config/mysql/db')();


/* GET home page. */

/*
    Create
 */
router.get('/add', function(req, res, next) {

    var sql = 'select id, title from board';
    conn.query(sql, function(err, topics,fields){
        res.render('./board/add',{topics:topics, user:req.user});
    });

});
router.post('/add',function(req,res){


    var title = req.body.title;
    var description = req.body.description;
    var author = req.body.author;

    var data = {'title' : title,'description' : description, 'author' : author};
    console.log(data);

    var sql = 'insert into board (title, description, author) values (?, ?, ?)';
    conn.query(sql,[title,description,author], function(err,rows,fields){
        // res.redirect('/topic'+rows);
        res.redirect('/board/'+rows.insertId);
    });


});

/*
    Read
 */
router.get(['/','/:id'],function(req,res){

    var sql = 'select id, title from board';

    //rows = topics

    conn.query(sql, function (err, topics, fields) {

        var id = req.params.id;
        if(id){

            var sql = 'select id, title, description, author from board where id=?';
            conn.query(sql,[id],function (err,topic,fields) {

               if(err){
                   console.log(err);
               }
               console.log(topics);
               console.log(topic);

               res.render('./board/board',{topics:topics,topic:topic[0],user:req.user});

            });

        }else{
            console.log('rows1',topics);
            res.render('./board/board',{topics:topics,topic:null,user:req.user});
        }

    });

});

/*
    Update
 */
router.get(['/:id/edit'],function (req,res){

    var sql = 'SELECT id,title FROM board';
    conn.query(sql, function(err, topics, fields){
        var id = req.params.id;
        if(id){
            var sql = 'SELECT * FROM board WHERE id=?';
            conn.query(sql, [id], function(err, topic, fields){
                if(err){
                    console.log(err);
                    res.status(500).send('Internal Server Error');
                } else {
                    res.render('./board/edit', {topics:topics, topic:topic[0], user:req.user});
                }
            });
        } else {
            console.log('There is no id.');
            res.status(500).send('Internal Server Error');
        }
    });

});

router.post([':/id/edit'],function (req,res) {

    var title = req.body.title;
    var description = req.body.description;
    var author = req.body.author;


    var id = req.params.id;
    var sql = 'UPDATE board SET title=?, description=?, author=? WHERE id=?';
    conn.query(sql, [title, description, author, id], function(err, result, fields){
        if(err){
            console.log(err);
            res.status(500).send('Internal Server Error');
        } else {
            res.redirect('./board/board/'+id);
        }
    });

});


/*
    Delete
 */
router.get('/:id/delete', function(req, res){
    var sql = 'SELECT id,title FROM board';
    var id = req.params.id;
    conn.query(sql, function(err, topics, fields){
        var sql = 'SELECT * FROM board WHERE id=?';
        conn.query(sql, [id], function(err, topic){
            if(err){
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                if(topic.length === 0){
                    console.log('There is no record.');
                    res.status(500).send('Internal Server Error');
                } else {
                    res.render('./board/delete', {topics:topics, topic:topic[0], user:req.user});
                }
            }
        });
    });
});
router.post('/:id/delete', function(req, res){
    var id = req.params.id;
    var sql = 'DELETE FROM board WHERE id=?';
    conn.query(sql, [id], function(err, result){
        res.redirect('/board/');
    });
});

module.exports = router;
