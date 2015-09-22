function intToIP(int) {
    var part1 = int & 255;
    var part2 = ((int >> 8) & 255);
    var part3 = ((int >> 16) & 255);
    var part4 = ((int >> 24) & 255);

    return part4 + "." + part3 + "." + part2 + "." + part1;
}

(function main() {
  var http = require('http');
  var network = require('./network.js');
  var url = require('url');
  var player = require('./player.js');
  //localIP
  var ip = network();
  var file = '../media/tvshows/[720pMkv.Com]_The.Sopranos.S06E21.Members.Only.480p.BluRay.x264-GAnGSteR.webm';
  //var file = './video.webm'
  var server = http.createServer(function (req, response) {
    //lets filter our http request and find its parameters 
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    //url arguments
    var op = query.op?  query.op.trim().toLowerCase() : null;
    var media = query.media;
    var name = query.name;
    
    console.log('INFO: ', 'client requested operation ' + op  + '.');

    //This media server has two operations:
    //list
    if(op == 'list'){
      console.log('INFO: ', 'listing files.');
      return;
    }
    //play
	  else if(op == 'play'){
      var range = req.headers.range;
      player(file,range,response);
      return;
    } 
     
    else if (req.url != '/video.mp4') {
      console.log(ip);
      response.writeHead(200, { "Content-Type": "text/html" });
      response.end('<video width="320" height="240" autoplay controls><source src="http://'+ 'localhost'/*ip*/ +':8030/?op=play" ></video>');
      return;
    }

    
  });
  server.listen(8030);
})()  