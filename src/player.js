var file = './[720pMkv.Com]_The.Sopranos.S06E21.Members.Only.480p.BluRay.x264-GAnGSteR.webm';

function play(req,response){
    var ip = network.discoverLocalIP();
     
    if (req.url != '/video.mp4') {
      console.log(ip);
      response.writeHead(200, { "Content-Type": "text/html" });
      response.end('<video width="320" height="240" autoplay controls><source src="http://'+ ip +':8030/video.mp4" type="video/mp4"></video>');
      return;
    }

    console.log('INFO: ', 'client requested video');
    fs.stat(file, function (err, stats) {
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
          response.end(err);
        });
    });
}