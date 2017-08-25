/**
 * Created by KimMinki on 2017. 8. 23..
 */
module.exports = function () {

    var mysql = require('mysql');
    var conn = mysql.createConnection({

        host: '*',
        port: '*',
        user: '*',
        password: '*',
        database: '*'
    });
    conn.connect();
    return conn;

}