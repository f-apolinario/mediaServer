(function main() {
  var http = require('http');
  var network = require('./network.js');
  //localIP
  var ip = 'localhost'//network();
  var port = 8030;
  
  var server = http.createServer(function (req, response) {
    var urlMetadata = preprocessRequest(req);
    //url arguments
    var op = urlMetadata.op;
    var media = urlMetadata.media;
    var name = urlMetadata.name;
    var pathname = urlMetadata.pathname;

    console.log('INFO: ', 'Incomming request with:'
       ,'op: "' + op + '"' 
       ,'media "'+ media + '"'
       ,'name "' + name + '"');
       
    //perform one of two types of operations:
    //list
    if (op == 'list') {
      var sendResultFunction = hyperlinkServerData(media,ip,port,response);
      doListOperation(media,response,sendResultFunction);
      
    }
    //play
    else if (op == 'play') {
      var range = req.headers.range;
      doPlayOperation(pathname,media,range,name,ip,response);
    }
    else {
      var fs = require('fs');
      response.writeHead(200, { "Content-Type": "text/html" });
      fs.readFile('client/index.html',function(err,data){
        response.end(data);
      })
    }
  });
  server.listen(port,ip);
})() 


function intToIP(int) {
  var part1 = int & 255;
  var part2 = ((int >> 8) & 255);
  var part3 = ((int >> 16) & 255);
  var part4 = ((int >> 24) & 255);

  return part4 + "." + part3 + "." + part2 + "." + part1;
}

function hyperlinkServerData(media,ip,port,clientStream){
  if(media){
    return function(files){
      files.forEach(function(fileName){
        //clientStream.write('<br>');
        console.log('DEBUG: ', fileName)
        clientStream.write(/*'<a href="http://'+ ip + ':' + 8030 + '/?op=play'
                            + '&&name=' + */fileName/* 
                            + '&&media=' + media + '">' 
            + fileName
            + '</a>'*/);
      });
      clientStream.end();
    };
  }
  else return function(mediaTypes){
      mediaTypes.forEach(function(media){
        //clientStream.write('<br>');
        console.log('DEBUG: ', media)
        clientStream.write(/*'<a href="http://'+ ip + ':' + 8030 + '/?op=list'
                            + '&&media=' + */media /*+ '">' 
            + media
            + '</a>'*/);
      });
      clientStream.end();
    };
}

function doListOperation(media,response,callback){
  var listFiles = require('./list.js');
  console.log('INFO: ', 'listing files.');
  var path = '../media/';
  if (media) {
    path += media + '/';
  }
  response.writeHead(200, { "Content-Type": "text/html" });
  listFiles(path, response,callback);
  return;
} 

function doPlayOperation(pathname,media,range,name,ip,response){
  var player = require('./player.js');
  if (pathname != '/player') {
    forceVideoTag(pathname,media,name,ip,response);
    return;
  }
  player('../media/' + media + '/' + name, range, response);
  return;
}

function forceVideoTag(pathname,media,name,ip,response){
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

function preprocessRequest(req){
  var url = require('url');
  //lets filter our http request and find its parameters 
  var url_parts = url.parse(req.url, true);
  var query = url_parts.query;
  //url arguments
  var op = query.op ? query.op.trim().toLowerCase() : null;
  var media = query.media;
  var name = query.name;
  var pathname = url_parts.pathname;
  return {op:op
          ,media:media
          ,name:name
          ,pathname:pathname};
}