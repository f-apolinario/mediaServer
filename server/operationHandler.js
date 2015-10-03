var http = require("http");

module.exports = {doListOperation:doListOperation,
                  doPlayOperation:doPlayOperation,
                  forceMediaTag:forceMediaTag}

//Sends as response the list of all the files in 'path' directory
function doListOperation(path,response,callback,errorCallback){
  response.writeHead(200, { "Content-Type": "text/html" });
  listFiles(path, response,callback,errorCallback);
  return;
} 

function listFiles(path,response,callback){
    var fs = require('fs');
    
    fs.readdir(path, function(err,files){
        if(err || !files){
          throw 'failed to read directory ' + path + '.';
        }
        callback(files);
    });
}

//Sends as response a video stream
function doPlayOperation(file_path,range,response,callback,errorCallback){

  play(file_path, range, response,callback,errorCallback);
  return;
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

      start > end ? start = end : start;
      var stream = fs.createReadStream(filename, { start: start, end: end })
        .on("open", function () {
          clientStream.writeHead(206, {
            "Content-Range": "bytes " + start + "-" + end + "/" + total,
            "Accept-Ranges": "bytes",
            "Content-Length": chunksize,
            "Content-Type": 'video/' + discoverMediaType(filename)
          });
          stream.pipe(clientStream);
          callback();
        }).on("error", function (err) {
          errorCallback(err);//throw 'cannot read fileStream';
        });
    });
};

function discoverMediaType(name){
  var ar = name.toString().split('.');
  var videoType = ar.pop().toLowerCase();
  var t = videoType;
  videoType == 'mp3' ? videoType = 'mpeg' : videoType = videoType;
  if(t == 'mp3'){
    return {
      extension:videoType,
      mediaType:'audio'
    }
  }
  else return {extension:videoType,
               mediaType:'video'
               }
}
function forceMediaTag(pathname,media,name,ip,response,callback){
  var o = discoverMediaType(name);
  
  var url = 'http://' + ip + ':8030/player?op=play'+ '&&media=' + media + '&&name='+ name;
  url.replace.replace(' ','+');
  response.writeHead(200, { "Content-Type": "text/html" });
  response.write('<a href="' + url + '">Download</a>');
  response.write('<'+ o.mediaType + ' width="100%" height="100%" autoplay controls id=' + name.replace(' ','+') + '>' 
    + '<source '
            + 'src="' + url +'" '
            + 'type="' + o.mediaType + '/' + o.extension + '">'
    + '</video>');
    response.end();
    callback();
  return;
}

