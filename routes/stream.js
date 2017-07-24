var express = require('express');
var ffmpeg = require('fluent-ffmpeg');
var router = express.Router();
var mysql      = require('mysql');


router.get('/', function(req, res, next) {
    res.sendFile('views/stream.html', {root: '.'});
});

router.get('/get/', function(req, res, next) {
    var proc = ffmpeg('data/bird.avi')
        .setFfmpegPath('C:/Users/joshh/Downloads/ffmpeg-20170723-dd4b7ba-win64-static/bin/ffmpeg.exe')
        .setFfprobePath('C:/Users/joshh/Downloads/ffmpeg-20170723-dd4b7ba-win64-static/bin/ffprobe.exe')
        .format('mp4')
        .save('data/your_target.mp4')
        .on('end', function() {
            console.log('file has been converted successfully');
            res.send('data/your_target.mp4');
        })
        .on('error', function(err) {
            console.log('an error happened: ' + err.message);
        });

    var mysql      = require('mysql');
    var connection = mysql.createConnection({
        host     : 'dbinstance.cw5leslchkpk.us-east-2.rds.amazonaws.com',
        port     : '3306',
        user     : 'admin',
        password : 'adminadmin'
    });

    connection.connect(function(err) {
        if (err) {
            console.error('error connecting: ' + err.stack);
            return;
        }

        console.log('connected as id ' + connection.threadId);
    });

    connection.end();
});

module.exports = router;
