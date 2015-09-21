function intToIP(int) {
    var part1 = int & 255;
    var part2 = ((int >> 8) & 255);
    var part3 = ((int >> 16) & 255);
    var part4 = ((int >> 24) & 255);

    return part4 + "." + part3 + "." + part2 + "." + part1;
}

(function main() {
  var http = require('http');
  var fs = require('fs');
  var network = require('./network.js');
  var url = require('url')
  //localIP
  var ip = network();
  var file = '../media/tvshows/[720pMkv.Com]_The.Sopranos.S06E21.Members.Only.480p.BluRay.x264-GAnGSteR.webm';
  //var file = './video.webm'
  var server = http.createServer(function (req, response) {
    //lets filter our http request and find its parameters 
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    //url arguments
    var op = query.op;
    var media = query.media;
    var name = query.name;
    //This media server has two operations:
    //list
    if(op === 'list'){
      
    }
    //play
	  if(op === 'play'){
      
    } 
     
    if (req.url != '/video.mp4') {
      console.log(ip);
      response.writeHead(200, { "Content-Type": "text/html" });
      response.end('<video width="320" height="240" autoplay controls><source src="http://'+ 'localhost'/*ip*/ +':8030/video.mp4" ></video>');
      return;
    }

    console.log('INFO: ', 'client requested video');
    fs.stat(file, function (err, stats) {
      if(err){
        console.log("ERROR: ", 'cannot read stream.')
        return;
      }
      var total = stats.size;
      var range = req.headers.range;
      var start = 0, end = total -1;
      if(range){
        var positions = range.replace(/bytes=/, "").split("-");
        end = positions[1] ? parseInt(positions[1], 10) : total - 1;
        start = parseInt(positions[0], 10);  
      }
      var chunksize = (end - start) + 1;

      response.writeHead(206, {
        "Content-Range": "bytes " + start + "-" + end + "/" + total,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": "video/mp4"
      });

      var stream = fs.createReadStream(file, { start: start, end: end })
        .on("open", function () {
          stream.pipe(response);
        }).on("error", function (err) {
          console.log("ERROR: ", 'cannot read stream.');
          response.end(err);
        });
    });
  });
  server.listen(8030);
})()  