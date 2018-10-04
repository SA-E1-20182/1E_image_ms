var redis = require('redis');
var express = require("express");
var fileUpload = require("express-fileupload");
var bodyParser = require('body-parser');
var client = redis.createClient();
var app = express();
var path = require('path');
var fs = require('fs');
//app.use(bodyParser.json());
app.use(fileUpload());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

var server = app.listen(8080, function () {
    console.log('Server is running..');
});

client.on('error', function(err){
  console.log('Something went wrong ', err)
});

app.get('/image/:id/', function(req, res) {
  client.get(req.params.id,function(error, result){
    if (fs.existsSync(result)) {
			res.sendFile(path.join(result));
		}else{return res.status(404).send('Image not found.');}
  });
});

app.post('/image/', function(req, res) {
  if (!req.files)
    return res.status(400).send('No files were uploaded.');
  let sampleFile = req.files.file;
	sampleFile.name = req.body.project +'v'+ req.body.version +'p'+ req.body.page + '.png';
	uploadPath = __dirname + '/uploads/' + sampleFile.name;
  client.incr("counter");
  sampleFile.mv(uploadPath, function(err) {
    if (err) {
      return res.status(500).send(err);
    }
    client.get("counter", function(error, result) {
      if (error) throw error;
      client.set(result, uploadPath, redis.print)
      res.send('El archivo fue guardado con el codigo ' + result);
    });
  });
});

app.put('/image/:id/', function(req, res) {
	if (!req.files)
    return res.status(400).send('Missing image to update.');
  let sampleFile = req.files.file;
  client.get(req.params.id,function(error, result){
    if (fs.existsSync(result)) {
      sampleFile.mv(result, function(err) {
      if (err) {
        return res.status(500).send(err);
      }
      res.send('El archivo con codigo ' + req.params.id + ' ha sido actualizado');
      });
    }else{return res.status(404).send('No image to update.');}
  });
});

app.delete('/image/:id/', function(req, res) {
  client.get(req.params.id,function(error, result){
    if (fs.existsSync(result)) {
      fs.unlink(result, (err) => {
        if (err) throw err;
        res.send('El archivo con codigo ' + req.params.id + ' ha sido eliminado');
      });
      client.del(req.params.id)
		}else{return res.status(404).send('Image not found.');}
  });
});
