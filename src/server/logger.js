var logPath = '';
var logFile = 'Media-Server-' + createTimestamp() + '.txt';

function initializeLogger(logDirectory){
  logPath =logDirectory;
  var fs = require('fs');
}

function writeLog(message,ip){
  var timestamp = createTimestamp();
  var logEntry = '|'+ 'info,' + timestamp + (ip? (',c:'+ ip) :'') +'|' +'\t' + '|' + message + '|';
  //console.log(logEntry);
  writeToFile(logEntry);
}

function createTimestamp(){
  var date = new Date();
  return date.getFullYear() + '-' 
       + date.getMonth() + '-' 
       + date.getDay() + '-' 
       + date.getHours() + 'h-' 
       + date.getMinutes() +'m';
}

function intToIP(int) {
  var part1 = int & 255;
  var part2 = ((int >> 8) & 255);
  var part3 = ((int >> 16) & 255);
  var part4 = ((int >> 24) & 255);

  return part4 + "." + part3 + "." + part2 + "." + part1;
}

function requestedOperationToJson(pathname,op,media,name){
  return '{"pathname":"' + pathname +'",' 
          + '"op:"' + '"' + op + '",' 
          + '" ' + 'media:"'+ media + '",'
          + '" '+'name:"' + name + '"}';
}

function writeToFile(message) {
  var fs = require('fs');
  fs.appendFile(logPath + logFile, message + '\n', function (err) {
    if (err) {
      console.log('erro:'+err);
    }
  }); 
}

module.exports = { writeLog : writeLog,
                   intToIP : intToIP,
                   requestedOperationToJson : requestedOperationToJson,
                   initializeLogger : initializeLogger
}

