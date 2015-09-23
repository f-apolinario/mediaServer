var http = require("http");

function play(filename,range,clientStream){
    var fs = require('fs');
    console.log('INFO: ', 'client requested video');
    
    fs.stat(filename, function (err, stats) {
      if(err){
        console.log("ERROR: ", 'cannot read stream.');
        return;
      }
      var total = stats.size;
      var start = 0, end = total -1;
      if(range){
        var positions = range.replace(/bytes=/, "").split("-");
        end = positions[1] ? parseInt(positions[1], 10) : total - 1;
        start = parseInt(positions[0], 10);  
      }
      var chunksize = (end - start) + 1;

      clientStream.writeHead(206, {
        "Content-Range": "bytes " + start + "-" + end + "/" + total,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": "video/mp4"
      });
      start > end ? start = end : start;
      var stream = fs.createReadStream(filename, { start: start, end: end })
        .on("open", function () {
          stream.pipe(clientStream);
        }).on("error", function (err) {
          console.log("ERROR: ", 'cannot read stream.');
          clientStream.end(err);
        });
    });
};


function doListOperation(mediaPath,media,response,callback){
  var listFiles = require('./list.js');
  console.log('INFO: ', 'listing files.');
  var path = mediaPath;
  if (media) {
    path += media + '/';
  }
  response.writeHead(200, { "Content-Type": "text/html" });
  listFiles(path, response,callback);
  return;
} 

function doPlayOperation(urlPathName,mediaPath,media,range,name,ip,response){
  
  if (urlPathName != '/player') {
    forceVideoTag(urlPathName,media,name,ip,response);
    return;
  }
  var file_path = mediaPath + media + '/' + name;
  play(file_path, range, response);
  return;
}

function forceVideoTag(pathname,media,name,ip,response){
  console.log(response)
  response.writeHead(200, { "Content-Type": "text/html" });
  response.write('<video width="100%" height="100%" autoplay controls id=' + name + '>' 
    + '<source '
            + 'src="http://' + ip + ':8030/player?op=play'
            + '&&media=' + media
            + '&&name='+ name + '" '
            + 'type="video/webm">'
    + '</video>');
    response.end();
  return;
}

module.exports = {doPlayOperation:doPlayOperation,
                  doListOperation:doListOperation
}