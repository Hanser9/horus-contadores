var model = require("../models/sesion");
var fs = require('fs')
var CryptoJS = require('crypto-js');

module.exports = {
  sendLogin : sendLogin
}

function sendLogin(d) {
  return new Promise(function (resolve, reject) {      
    var i = {
        user: d.user,
        pass: d.pass
    }
    var password = CryptoJS.AES.decrypt(i.pass, 'cochis');
    i.pass = password
    i.pass = i.pass.toString(CryptoJS.enc.Utf8);
    model.validateUser(i)
    .then(function(res){
        if(res.length === 0){
            resolve({err: true, description: 'Usuario y/o contraseña incorrectos'})
        }else(
            resolve({err: false, res: res})
        )
        console.log(res.length)
    })
  })
}