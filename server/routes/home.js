var express        = require('express');
var router         = express.Router();
var ctrl           = require('../controllers/home');
var fs             = require('fs');
var multer         = require('multer');
var path           = require('path')
var moment         = require('moment')

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
    var d = req.file
    var i = req.body.user
    var i = {id_user: i}
    console.log(i, '<-------body');
    ctrl.sendFile(d, i)
    .then(function (result) {
          res.json(result)   
    })
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
