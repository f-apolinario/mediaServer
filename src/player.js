module.exports = function play(filename,range,clientStream){
    var fs = require('fs');
    console.log('INFO: ', 'client requested video');
    
    fs.stat(filename, function (err, stats) {
      if(err){
        console.log("ERROR: ", 'cannot read stream.')
        return;
      }
      var total = stats.size;
      var start = 0, end = total -1;
      if(range){
        var positions = range.replace(/bytes=/, "").split("-");
        end = positions[1] ? parseInt(positions[1], 10) : total - 1;
        start = parseInt(positions[0], 10);  
      }
      var chunksize = (end - start) + 1;

      clientStream.writeHead(206, {
        "Content-Range": "bytes " + start + "-" + end + "/" + total,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": "video/mp4"
      });

      var stream = fs.createReadStream(filename, { start: start, end: end })
        .on("open", function () {
          stream.pipe(clientStream);
        }).on("error", function (err) {
          console.log("ERROR: ", 'cannot read stream.');
          clientStream.end(err);
        });
    });
};