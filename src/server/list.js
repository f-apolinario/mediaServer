module.exports = function listFiles(path,response,callback){
    var fs = require('fs');
    
    fs.readdir(path, function(err,files){
        if(err || !files){
            console.log('ERROR: ', 'failed to read directory ' + path + '.');
            return;
        }
        callback(files);
    });
};

