//global required modules
var server = require('./server/server');

(function main() {
  //initialize server module
  server.initializeServer();
  //run media server
  server.startServer();
})() 



