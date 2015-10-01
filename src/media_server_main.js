//Server variables
var ip;
var port;
var mediaPath;
var htmlPagesPath;
var logPath;


//global required modules
var http = require('http');
var operationHandler = require('./server/operationHandler.js');
var logger = require('./server/logger.js');

function initializeServer(){
  //Server Config
  config = require('./config.json');
  ip = config.ip;
  port = config.port;
  mediaPath = config.media_path;
  htmlPagesPath = config.html_pages_path;
  logPath = config.log_path;
}


(function main() {
  initializeServer();
  
  logger.initializeLogger(logPath);
  logger.writeLog('starting server {"ip":"'+ip+'",'
                            +'"port":'+port+'",'
                            +'"media_path":"'+mediaPath+'"'
                            +'","html_pages_path":"'+htmlPagesPath+'"}');
  
  //Launch media server service
  var server = http.createServer(function (req, response) {
    
    var urlMetadata = preprocessRequest(req);
    //url arguments
    var op = urlMetadata.op;
    var media = urlMetadata.media;
    var name = urlMetadata.name;
    var pathname = urlMetadata.pathname;
    var incommingIP = req.socket.remoteAddress;
    
    var message = 'Incomming request ' + logger.requestedOperationToJson(pathname,op,media,name);
    logger.writeLog(message,incommingIP);
       
    var errorHandler = function (error) {
      var message = 'error:' + error + 'in request ' + logger.requestedOperationToJson(pathname,op, media, name);
      logger.writeLog(message, incommingIP);
      response.end();
    }
    
    //perform one of two types of operations:
    //list
    if (op == 'list') {
      var sendResultFunction = processServerData(op,media,incommingIP,port,response);
      operationHandler.doListOperation(mediaPath,media,response,sendResultFunction,errorHandler);
    }
    //play
    else if (op == 'play') {
      var range = req.headers.range;
      var callback = function(){
        var oper = logger.requestedOperationToJson(op,media,name);
        logger.writeLog('finished request ' + oper,incommingIP);
      }
      operationHandler.doPlayOperation(pathname,mediaPath,media,range,name,ip,response,callback,errorHandler);
    }
    else {
      var fs = require('fs');
      response.writeHead(200, { "Content-Type": "text/html" });
      fs.readFile(htmlPagesPath + 'index.html', function (err, data) {
        response.end(data);
      })
    }
  });
  server.listen(port,ip);
})() 




function processServerData(op,media,ip,port,clientStream){
  return function(names){
	  var array = [];
	  names.forEach(function(name){
		array.push(name);
	  });
	  clientStream.end(array.toString());
	  
	  var oper = logger.requestedOperationToJson(op,media,'');
	  logger.writeLog('finished request ' + oper,ip);
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

