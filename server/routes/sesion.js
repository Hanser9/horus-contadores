var express        = require('express');
var router         = express.Router();
var ctrl           = require('../controllers/sesion');
var fs             = require('fs');

router.post('/sendLogin', sendLogin)

function sendLogin(req, res){    
  var d = req.body
  ctrl.sendLogin(d)
  .then(function (result) {
    if(result.err){
        res.json(result)
    }else{
        req.session.usuario = result.res[0]
        res.json(result)
    }    
  })
}

module.exports = router;
