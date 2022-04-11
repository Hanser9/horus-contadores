var express = require('express');
var router = express.Router();
var helpers = require('../modules/helpers')
var Url = helpers.getUrl()

router.get('/', function(req, res) {      
  console.log(Url)
  var sesion = req.session.usuario;
  console.log(sesion, 'sesion <<<<<<<<<<<<<<<')
  if(sesion === undefined){  
    res.redirect('login')
  }else if(sesion.id_tipo_user === 4){
    res.redirect('tienda')
  }else{
    res.redirect('inicio')
  }
});

router.get('/inicio', function(req, res) {
  var sesion = req.session.usuario;
  console.log(sesion, '<--------sesion');
  if(sesion === undefined){  
    res.redirect('login')
  }else(
    res.render('inicio', {usuario: sesion.usuario, id_tipo_user: sesion.id_user_type, nombre: sesion.nombre, apellidos: sesion.apellidos, url : Url})
  ) 
});

router.get('/login', function(req, res) {
  var sesion = req.session.usuario;
  if(sesion === undefined){  
    res.render('login', {usuario:true, url : Url})
  }else{
    res.redirect('/')
  }  
});

router.get('/401', function(req, res) {
  res.render('401', {usuario:true, url : Url})
});

module.exports = router;
