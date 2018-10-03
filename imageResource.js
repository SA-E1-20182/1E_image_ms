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

/*app.get('/image/:id', function(req, res, next) {
  var itemId = req.params.id;
  client.get(itemId, function(error, result) {
    if (error) throw error;
		saveImage("/" + string(itemId), result);
    res.send('image ' + itemId +' is '+ result)
  });
});*/

app.get('/image/:project/:version/:page/', function(req, res) {
		var name = req.params.project +'v'+ req.params.version +'p'+ req.params.page + '.png';
		downloadPath = __dirname + '/uploads/' + name;
		if (fs.existsSync(uploadPath)) {
			res.sendFile(path.join(downloadPath));
		}else{return res.status(404).send('Image not found.');}
});

app.post('/image/', function(req, res) {
  if (!req.files)
    return res.status(400).send('No files were uploaded.');
  let sampleFile = req.files.file;
	sampleFile.name = req.body.project +'v'+ req.body.version +'p'+ req.body.page + '.png';
	uploadPath = __dirname + '/uploads/' + sampleFile.name;
  sampleFile.mv(uploadPath, function(err) {
    if (err) {
      return res.status(500).send(err);
    }
    res.send('El archivo fue guardado bajo el nombre de ' + sampleFile.name);
  });
});

app.set('/image/', function(req, res) {
		if (!req.files)
    	return res.status(400).send('Missing image to update.');
		let sampleFile = req.files.file;
		sampleFile.name = req.params.project +'v'+ req.params.version +'p'+ req.params.page + '.png';
		console.log(sampleFile.name)
		uploadPath = __dirname + '/uploads/' + sampleFile.name;
		if (fs.existsSync(uploadPath)) {
    	fs.unlinkSync(uploadPath);
			sampleFile.mv(uploadPath, function(err) {
		    if (err) {
		      return res.status(500).send(err);
		    }
		    res.send('El archivo ' + sampleFile.name +' has sido actualizado');
		  });
		}else{return res.status(400).send('No image to update.');}
});
