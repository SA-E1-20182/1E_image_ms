var redis = require('redis');
var express = require("express");
var fileUpload = require("express-fileupload");
var bodyParser = require('body-parser');
var cloudinary = require('cloudinary');
var cors = require('cors')
var client = redis.createClient(6379, 'image-db');
var app = express();
var path = require('path');
var fs = require('fs');
//app.use(bodyParser.json());

cloudinary.config({
  cloud_name: 'olimita',
  api_key: '471581619822586',
  api_secret: 'qm1kwv1rcBk4jIdTXQymLASXAL4'
});

app.use(fileUpload());
app.use(express.static('public'));
//app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use(cors());


var server = app.listen(80, function () {
    console.log('Server is running..');
});

client.on('error', function(err){
  console.log('Something went wrong ', err)
});

app.post('/image/collection/', function(req, res) {
  console.log(JSON.stringify(req.body))
  client.mget(req.body.codes,function(error, result){
    res.send(result)
  });
});

/*app.get('/image/', function(req, res) {
  console.log(JSON.stringify(req.params))
  client.mget(req.params.codes,function(error, result){
    res.send(result)
  });
});*/

app.get('/image/:id/', function(req, res) {
  client.get(req.params.id,function(error, result){
    res.send(result);
  });
});

app.post('/image/', function(req, res) {
  if (!req.files)
    return res.status(400).send('No files were uploaded.');
  let sampleFile = req.files.file;
	uploadPath = __dirname + '/uploads/' + sampleFile.name;
  client.incr("counter");
  sampleFile.mv(uploadPath, function(err) {
    if (err) {
      return res.status(500).send(err);
    }
    client.get("counter", function(error, result) {
      if (error) throw error;
      var numero = result
      cloudinary.v2.uploader.upload(uploadPath,{public_id: numero},
        function(err, result) {
          console.log(result)
          client.set(numero, result.url, redis.print)
        });
    });
    client.get("counter", function(error, result) {
      if (error) throw error;
      res.send(result);
    });
  });
});

app.put('/image/:id/', function(req, res) {
  if (!req.files)
    return res.status(400).send('No image to upload.');
  let sampleFile = req.files.file;
	uploadPath = __dirname + '/uploads/' + sampleFile.name;
  sampleFile.mv(uploadPath, function(err) {
    if (err) {
      return res.status(500).send(err);
    }
    var numero = req.params.id
    cloudinary.v2.uploader.upload(uploadPath,{public_id: numero},
      function(err, result) {
        client.set(numero, result.url, redis.print)
      });
    res.send(true);
  });
});


app.delete('/image/:id/', function(req, res) {
  client.get(req.params.id,function(err,reply){
    if (reply != null){
      var numero = req.params.id
      cloudinary.uploader.destroy(numero,
        function(error, result){console.log(result, error)});
      client.del(numero)
      res.send(true);
    }else{return res.status(404).send('Image not found.')};
  });
});
