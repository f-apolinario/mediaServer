module.exports = function discoverLocalIP(){
  var os = require('os');

  var interfaces = os.networkInterfaces();
  var addresses = [];
  for (var k in interfaces) {
    for (var k2 in interfaces[k]) {
      var address = interfaces[k][k2];
      if (address.family === 'IPv4' && !address.internal) {
        addresses.push(address.address);
      }
    }
  }

  //console.log('INFO: ', 'this are the local IP addresses: ' + addresses);
  return addresses[2];
};