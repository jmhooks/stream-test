function insertPlayer() {
    //TODO
    //Make converting the video upload it to an s3 instance

    $.get( "/stream/get", function(data) {
        //
    });
}

function getNames() {
    $.get( "/stream/names", function(data) {
        var counter = 0;
        data.forEach(function(name){
            counter++;
            name = name.trim();
            $('#nameSelect').append('<option value="' + name.toLowerCase() + '">' + (name.charAt(0).toUpperCase() + name.slice(1)) + '</option>');
            if(counter === data.length) {
                $('#videoPlayer').html("<video controls><source src='https://s3.us-east-2.amazonaws.com/stream-test-decode/" + data[0] + ".mp4' type='video/mp4'>Your browser does not support HTML5 video.</video>");
            }
        })
    });
}

$('#transcodeButton').click(function(){
    insertPlayer();
});

$(document).ready(function(){
    getNames();
});

$('#nameSelect').change(function(){
    $('#videoPlayer').html("<video controls><source src='https://s3.us-east-2.amazonaws.com/stream-test-decode/" + $('#nameSelect').val() + ".mp4' type='video/mp4'>Your browser does not support HTML5 video.</video>");
});