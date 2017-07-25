var express = require('express');
var ffmpeg = require('fluent-ffmpeg');
var router = express.Router();
var mysql = require('mysql');
var fs = require('fs');

var connection = null;

router.get('/', function(req, res, next) {
    res.sendFile('public/stream.html', {root: '.'});
});

router.get('/get/', function(req, res, next) {

    var connection = mysql.createConnection({
        host     : 'dbinstance1.cw5leslchkpk.us-east-2.rds.amazonaws.com',
        port     : '3306',
        user     : 'admin',
        password : 'adminadmin',
        database : 'db1'
    });

    connection.connect(function(err) {
        if (err) {
            console.error('Error: ' + err.stack);
            return;
        }

        console.log('Connected - ID: ' + connection.threadId);

        fs.readdir('data/in', function(err, files) {
            var counter = 0;
            files.forEach(function(file) {
                connection.query('insert into videos (name) values ("' + (file.replace(/\.[^/.]+$/, "")) + '")', function (err) {
                    counter++;
                    if (!err) {
                        transcodeVideo(file);
                    }
                    if(counter === files.length) {
                        connection.end();
                    }
                });
            });
        });
    });

    res.send("Done");

});

router.get('/names/', function(req, res, next) {

    var connection = mysql.createConnection({
        host     : 'dbinstance1.cw5leslchkpk.us-east-2.rds.amazonaws.com',
        port     : '3306',
        user     : 'admin',
        password : 'adminadmin',
        database : 'db1'
    });

    connection.connect(function(err) {
        if (err) {
            console.error('Error: ' + err.stack);
            return;
        }

        console.log('Connected - ID: ' + connection.threadId);

        connection.query('select name from videos', function (err, rows, fields) {
            if (err) {
                console.log("Error: " + err);
            }
            else{
                var counter = 0;
                var arr = [];
                rows.forEach(function(data){
                    arr.push(data.name);
                    counter++;
                    if(counter === rows.length) {
                        res.send(arr);
                        connection.end();
                    }
                })
            }
        });
    });

});

function transcodeVideo(fileName) {
    var fileNoExt = fileName.replace(/\.[^/.]+$/, "");

    var proc = ffmpeg('data/in/' + fileName)
        .setFfmpegPath('C:/Users/joshh/Downloads/ffmpeg-20170723-dd4b7ba-win64-static/bin/ffmpeg.exe')
        .setFfprobePath('C:/Users/joshh/Downloads/ffmpeg-20170723-dd4b7ba-win64-static/bin/ffprobe.exe')
        .format('mp4')
        .save('data/out/' + fileNoExt + '.mp4')
        .on('end', function() {
            console.log(fileNoExt + ' has been converted successfully');
        })
        .on('error', function(err) {
            console.log('Error: ' + err.message);
        });
}

module.exports = router;
