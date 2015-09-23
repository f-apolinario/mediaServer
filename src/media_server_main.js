var connectionNumber = 0;

(function main() {
  //global required modules
  var http = require('http');
  //var network = require('./network.js');
  var operationHandler = require('./server/player.js');
  
  //Server Config
  var config = require('./config.json');
  var ip = config.ip;
  var port = config.port;
  var mediaPath = config.media_path;
  var html_pages_path = config.html_pages_path;
  
  writeLog('starting server {"ip":"'+ip+'",'
                            +'"port":'+port+'",'
                            +'"media_path":"'+mediaPath+'"'
                            +'","html_pages_path":"'+html_pages_path+'"');
  
  //Launch media server service
  var server = http.createServer(function (req, response) {
    connectionNumber++;
    
    var urlMetadata = preprocessRequest(req);
    //url arguments
    var op = urlMetadata.op;
    var media = urlMetadata.media;
    var name = urlMetadata.name;
    var pathname = urlMetadata.pathname;
    
    var message = 'Incomming request: op:"' + op + '" ' + 'media:"'+ media + '" '+'name:"' + name + '"';
    writeLog(message);
       
    //perform one of two types of operations:
    //list
    if (op == 'list') {
      var sendResultFunction = processServerData(media,ip,port,response);
      operationHandler.doListOperation(mediaPath,media,response,sendResultFunction); 
    }
    //play
    else if (op == 'play') {
      var range = req.headers.range;
      operationHandler.doPlayOperation(pathname,mediaPath,media,range,name,ip,response);
    }
    else {
      var fs = require('fs');
      response.writeHead(200, { "Content-Type": "text/html" });
      fs.readFile(html_pages_path+'index.html',function(err,data){
        response.end(data);
      })
    }
  });
  server.listen(port,ip);
})() 




function processServerData(media,ip,port,clientStream){
  if(media){
    return function(files){
      var array = [];
      files.forEach(function(fileName){
        array.push(fileName);
      });
      clientStream.end(array.toString());
    };
  }
  else return function(mediaTypes){
      var array = [];
      mediaTypes.forEach(function(media){
        array.push(media);
      });
      clientStream.end(array.toString());
    };
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

function writeLog(message){
  var date = new Date();
  var timestamp = date.getFullYear() + '-' + date.getMonth() + '-' + date.getDay() + '-' + date.getHours() + ':' + date.getMinutes();
  
  console.log('|'+ 'INFO:' + timestamp + ':c:' + connectionNumber +'|', '|' + message + '|');
}