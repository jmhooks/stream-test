var express = require('express');
var ffmpeg = require('fluent-ffmpeg');
var router = express.Router();
var mysql = require('mysql');
var fs = require('fs');
var aws = require('aws-sdk');

var connection = null;

router.get('/', function(req, res) {
    res.sendFile('public/stream.html', {root: '.'});
});

/**
 * Transcode and push all video files to S3
 */
router.get('/get/', function(req, res) {

    connection = mysql.createConnection({
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

/**
 * Return names of files to front end select list
 */
router.get('/names/', function(req, res) {

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

        connection.query('select name from videos', function (err, rows) {
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

/**
 * Transcode from other video formats to mp4
 * @param fileName
 */
function transcodeVideo(fileName) {
    var fileNoExt = fileName.replace(/\.[^/.]+$/, "");

    var proc = ffmpeg('data/in/' + fileName)
        .setFfmpegPath('C:/Users/joshh/Downloads/ffmpeg-20170723-dd4b7ba-win64-static/bin/ffmpeg.exe')
        .setFfprobePath('C:/Users/joshh/Downloads/ffmpeg-20170723-dd4b7ba-win64-static/bin/ffprobe.exe')
        .outputOptions('-movflags frag_keyframe+empty_moov')
        .format('mp4')
        .save('data/out/' + fileNoExt + '.mp4')
        .on('progress', function(info) {
            console.log('progress ' + info.percent + '%');
        })

        .on('end', function() {
            console.log(fileNoExt + ' has been converted successfully');
            fs.readFile('data/in/' + fileName, function(err, data) {
                if (err) { console.log("Error reading file " + fileName); }
                else {
                    sendToS3(fileNoExt + '.mp4', data, function(err, data) {
                        if(err) {
                            console.log(err);
                        } else {
                           fs.unlink('data/out/' + fileNoExt + '.mp4', function(err, data) {
                                if(err) {
                                    console.log(err);
                                } else {
                                    console.log('Deleted ' + '"data/out/' + fileNoExt + '.mp4"');
                                }
                            });
                        }
                    });
                }
            })

        })
        .on('error', function(err) {
            console.log('Error: ' + err.message);
        });

    console.log("THERE")
}

/**
 * Send mp4 located in correct directory over to AWS S3 bucket
 * @param fileName
 * @param fileData
 * @param callback
 */
function sendToS3(fileName, fileData, callback) {

    console.log("Sending " + fileName + " to S3");
    var s3 = new aws.S3();

    var params = {
        Body: fileData,
        Bucket: "stream-test-decode",
        ContentType: 'video/mp4',
        Key: 'videos/' + fileName,
        ACL: 'public-read'
    };

    s3.putObject(params, function(err, data) {
        if (err) {
            console.log("S3 Error: " + err);
            callback(err);
        }
        else {
            console.log("S3 Data: " + data);
            callback(null, data);
        }

    });
}

module.exports = router;
