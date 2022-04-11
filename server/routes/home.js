var express        = require('express');
var router         = express.Router();
var ctrl           = require('../controllers/home');
var fs             = require('fs');
var multer         = require('multer');
var path           = require('path')
var moment         = require('moment')
var JSZip = require('jszip');

var storage = multer.diskStorage({
    destination: __dirname + '/../../public/upload/',
 
    filename: function (req, file, cb) {
        cb(null, file.originalname.replace(path.extname(file.originalname), "") + '-' + moment().format('YY-MM-DD') + path.extname(file.originalname))
    }
})
  
var upload = multer({ storage: storage });

router.post('/cerrarSesion', cerrarSesion)
router.post('/sendFile', upload.single('file'), sendFile)

router.get('/getClientes', getClientes)
router.get('/getArchivo', getArchivo)

function cerrarSesion(req, res){    
      req.session.destroy((err) => {
        if(err) {
            return console.log(err);
        }
        res.json({err: false});
    });
}

function sendFile(req, res){    
    var sesion = req.session.usuario;
    var i = JSON.parse(req.body.user)
    var d = {
        filename: i.filename 
    }    
    var i = {id_user: i.user}
    var filePath = __dirname + '/../../public/upload/blob-' + moment().format('YY-MM-DD');

    fs.readFile(filePath, function(err, data) {
        if (!err) {
            var zip = new JSZip();
            zip.loadAsync(data).then(function(contents) {
                Object.keys(contents.files).forEach(function(filename) {
                    zip.file(filename).async('nodebuffer').then(function(content) {
                        var dest = __dirname + '/../../public/upload/' + filename;
                        fs.writeFileSync(dest, content);
                        fs.unlink(filePath, (err) => {
                          if (err) {
                            console.error(err)
                            return
                          }

                          ctrl.sendFile(d, i)
                            .then(function (result) {
                                  res.json(result)   
                            })
                        })
                    });
                });
            });
        }
    });
}

function getClientes(req, res){ 
    ctrl.getClientes()
    .then(function (result) {
          res.json(result)   
    })
}

function getArchivo(req, res){ 
    var sesion = req.session.usuario;
    ctrl.getArchivo(sesion)
    .then(function (result) {
          res.json(result)   
    })
}

module.exports = router;
