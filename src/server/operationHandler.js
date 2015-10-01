var http = require("http");

function listFiles(path,response,callback){
    var fs = require('fs');
    
    fs.readdir(path, function(err,files){
        if(err || !files){
          throw 'failed to read directory ' + path + '.';
        }
        callback(files);
    });
}

function play(filename,range,clientStream,callback,errorCallback){
    var fs = require('fs');
    
    fs.stat(filename, function (err, stats) {
      if(err){
        errorCallback('cannot find required video');
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
        "Content-Type": 'video/' + discoverVideoType(filename)
      });
      start > end ? start = end : start;
      var stream = fs.createReadStream(filename, { start: start, end: end })
        .on("open", function () {
          stream.pipe(clientStream);
          callback();
        }).on("error", function (err) {
          errorCallback(err);//throw 'cannot read fileStream';
        });
    });
};


function doListOperation(mediaPath,media,response,callback,errorCallback){
  //var listFiles = require('./list.js');
  var path = mediaPath;
  if (media) {
    path += media + '/';
  }
  response.writeHead(200, { "Content-Type": "text/html" });
  listFiles(path, response,callback,errorCallback);
  return;
} 

function doPlayOperation(urlPathName,mediaPath,media,range,name,ip,response,callback,errorCallback){
  
  if (urlPathName != '/player') {
    forceVideoTag(urlPathName,media,name,ip,response,callback);
    return;
  }
  var file_path = mediaPath + media + '/' + name;
  play(file_path, range, response,callback,errorCallback);
  return;
}

function discoverVideoType(name){
  var ar = name.toString().split('.');
  var videoType = ar.pop();
  return videoType; 
  
}
function forceVideoTag(pathname,media,name,ip,response,callback){
  var videoType = discoverVideoType(name);
  response.writeHead(200, { "Content-Type": "text/html" });
  response.write('<video width="100%" height="100%" autoplay controls id=' + name + '>' 
    + '<source '
            + 'src="http://' + ip + ':8030/player?op=play'
            + '&&media=' + media
            + '&&name='+ name + '" '
            + 'type="video/' + videoType + '">'
    + '</video>');
    response.end();
    callback();
  return;
}

module.exports = {doPlayOperation:doPlayOperation,
                  doListOperation:doListOperation
}