//Server variables
var ip
var port
var mediaPath
var htmlPagesPath
var logPath

//required modules
var http = require('http')
var url = require('url')
var httpHandler = require('./httpHandler')
var operationHandler = require('./operationHandler')
var logger = require('./logger');

function initializeServer() {
  //Server Config
  config = require('./config.json');
  ip = config.ip;
  port = config.port;
  mediaPath = config.media_path;
  htmlPagesPath = config.html_pages_path;
  logPath = config.log_path;

  logger.initializeLogger(logPath);
  logger.writeLog('starting server {"ip":"' + ip + '",'
    + '"port":' + port + '",'
    + '"media_path":"' + mediaPath + '"'
    + '","html_pages_path":"' + htmlPagesPath + '"}');
}

function startServer(){
  http.createServer(serverHandler).listen(port,ip);
}

function serverHandler(request, response) {
  //received request
  
  //Prepare resources to process the request
  //extract information about request
  var urlMetadata = preprocessRequest(request);
  var op = urlMetadata.op;
  var media = urlMetadata.media;
  var name = urlMetadata.name;
  var pathname = urlMetadata.pathname;
  var incommingIP = request.socket.remoteAddress;
  //log the received request
  var message = 'Incomming request ' + logger.requestedOperationToJson(pathname, op, media, name);
  logger.writeLog(message, incommingIP);
  //build the errorhandler function
  var errorHandler = function (error) {
    var message = 'error:' + error + 'in request ' + logger.requestedOperationToJson(pathname, op, media, name);
    logger.writeLog(message, incommingIP);
    response.end();
  }
  
  //process and emit response to request
  //request can be one of three types of operations:
  //list
  if (op == 'list') {
      var sendResponseFunction = getSendResponseFunction(op,media,incommingIP,port,response);
      var path = mediaPath;
      if(media){
        path += media;
      }
      operationHandler.doListOperation(path,response,sendResponseFunction,errorHandler);
    }
    //play
    else if (op == 'play') {
      var range = request.headers.range;
      var callback = function(){
        var oper = logger.requestedOperationToJson(op,media,name);
        logger.writeLog('finished request ' + oper,incommingIP);
      }
      if (pathname != '/player') {
        operationHandler.forceMediaTag(pathname,media,name,ip,response,callback);
        return;
      }
      var file_path = mediaPath + media + '/';
      operationHandler.doPlayOperation(file_path,name,range,response,callback,errorHandler);
    }
  //present initial page
  else {
    var fs = require('fs');
      response.writeHead(200, { "Content-Type": "text/html" });
      fs.readFile(htmlPagesPath + 'index.html', function (err, data) {
        response.end(data);
      })
  }
}

function getSendResponseFunction(op, media, ip, port, clientStream) {
  if (media) {
    return function (files) {
      var array = [];

      files.forEach(function (fileName) {
        array.push(fileName);
      });
      
      clientStream.end(array.toString());

      var oper = logger.requestedOperationToJson(op, media, '');
      logger.writeLog('finished request ' + oper, ip);
    };
  }
  else return function (mediaTypes) {
    var array = [];

    mediaTypes.forEach(function (media) {
      array.push(media);
    });
    
    clientStream.end(array.toString());

    var oper = logger.requestedOperationToJson(op, media, '');
    logger.writeLog('finished request ' + oper, ip);
  };
}

function preprocessRequest(req) {
  //lets filter our http request and find its parameters 
  var url_parts = url.parse(req.url, true);
  var query = url_parts.query;
  //url arguments
  var op = query.op ? query.op.trim().toLowerCase() : null;
  var media = query.media;
  var name = query.name;
  var pathname = url_parts.pathname;
  return {
    op: op
    , media: media
    , name: name
    , pathname: pathname
  };

}

module.exports = {
  initializeServer: initializeServer,
  startServer: startServer,
  ip:ip,
  port:port
}