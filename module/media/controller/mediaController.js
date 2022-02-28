var request = require("request");
var fs = require("fs");
var download = require('image-downloader')

exports.saveFacebookImageUrl = function(url,imgname,callback) {
    request(url, function(err, res, body) {
        var data = JSON.parse(body)
        options = {
            url: data.data.url,
            dest: __basedir +'/media/images/user/'+imgname+'.jpg'      // will be saved to /path/to/dest/photo.jpg
          }
          download.image(options)
          .then(({ filename }) => {
            callback("success")
          });
    });

}

exports.saveImageUrl = function(url,imgname,callback) {
    var options = {
        url: url,
        dest: __basedir +'/media/images/user/'+imgname+'.jpg'      // will be saved to /path/to/dest/photo.jpg
      }
      download.image(options)
      .then(({ filename }) => {
        callback("success")
      });
}

exports.uploadImage = function (req,res) {
  res.json({
    status: true,
    message: 'image upload successfully completed'
  })
}