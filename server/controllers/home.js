var model = require("../models/home");
var fs = require('fs');
var path = require('path')
var alasql = require('alasql')
var moment = require('moment')
var csv = require('csvtojson')

module.exports = {
  sendFile : sendFile,
  getClientes: getClientes,
  getArchivo: getArchivo
}

function sendFile(f, d) {
  return new Promise(function (resolve, reject) { 
    var i;
    var e;
    const dir = path.join(__dirname + '/../../public/upload/' + f.filename);
    var dataJson = [];
    getData(dir)
    .then(function(res){
      dataJson = res
      validateLang(dataJson)
      .then(function(res){
        if(res.lang === 1){            
          dataJson = JSON.stringify(dataJson);
          dataJson = dataJson.replace(/�/g, '_')
          dataJson = JSON.parse(dataJson)            
          getModelo(dataJson)
          .then(function(res){
            var e = res                
            model.sendFile(f, d, e)
            .then(function(res){
              saveJson(dataJson, dir, 1)
              .then(function(result){
                resolve({err: false, res: result})
              })         
            })  
          })                                                           
         }else{
          model.sendFile(f, d, res.data)
          .then(function(res){
            saveJson(dataJson, dir, 2)
            .then(function(result){
              resolve({err: false, res: result})
            })
          }) 
         }
      })               
    })    
  })
}

function getClientes() {
  return new Promise(function (resolve, reject) {  
    model.getClientes()
    .then(function(res){
        resolve({err: false, res: res})        
    })
  })
}


function getArchivo(d) {
  return new Promise(function (resolve, reject) {  
    model.getArchivo(d)
    .then(function(res){       
        var rawdata = fs.readFileSync(__dirname + '/../..' + res[0].ruta.replace(/.csv/g, '.json'));
        var dataJson = JSON.parse(rawdata)
        resolve({err: false, res: dataJson})                                    
    })
  })
}


function getData(d) {
  return new Promise(function(resolve, reject) {
    console.log(d)
    alasql.promise(`SELECT * FROM CSV('${d}', {headers:true})`)
    .then(function(data){
        resolve(data);
      }).catch(function(err){
         console.log('Error:', err);
      });          
  });
}

function validateLang(d) {
  return new Promise(function(resolve){
    alasql.promise('SELECT top 1 [Model Name] as modelo, [Unit Serial Number] as n_serie FROM ?', [d])
      .then(function(data){
           var i = data[0]
           var res = {
            lang: (i.modelo === undefined) ? 1 : 2,
            data: i
           }
           resolve (res)
    }).catch(function(err){
           console.log('Error:', err);
    });
  })
}


function getModelo(d) {
  return new Promise(function(resolve){
    alasql.promise(`SELECT top 1 [Nombre del modelo] as modelo, [N_mero de serie de la unidad] as n_serie FROM ?`, [d])
    .then(function(data){
      resolve(data[0])
    })
    .catch(function(err){
      console.log('Error:', err);
    });
  })
}

function saveJson(d, r, i) {
  return new Promise(function(resolve){
    if(i != 1){
      alasql.fn.datetime = function(dateStr) {
          var date = moment(dateStr).format('YYYY-MM-DD HH:mm')
          return date
        };
      alasql.promise(
        `
          SELECT 
            [Job Mode] as job_mode, [Computer Name] as computer_name, [User Name] as user_name, [Login Name] as login_name, datetime([Starting Date & Time]) as start_date, datetime([Completing Date & Time]) as end_date,
            [Black & White Total Count] as bn_count, [Full Colour Total Count] as colour_count, Result as result, [Unit Serial Number] as n_serie, [Model Name] as model, [Machine Location] as machine_location
          FROM 
            ?
            `, [d])
      .then(function(data){
          //[Full Color Total Count] as colour_count
          var valida = alasql("SELECT TOP 1 colour_count FROM ?", [data] );      
          if(valida[0].colour_count === undefined){
              alasql.fn.datetime = function(dateStr) {
                var date = moment(dateStr).format('YYYY-MM-DD HH:mm')
                return date
              };
            alasql.promise(
              `
                SELECT 
                  [Job Mode] as job_mode, [Computer Name] as computer_name, [User Name] as user_name, [Login Name] as login_name, datetime([Starting Date & Time]) as start_date, datetime([Completing Date & Time]) as end_date,
                  [Black & White Total Count] as bn_count, [Full Color Total Count] as colour_count, result as result, [Unit Serial Number] as n_serie, [Model Name] as model, [Machine Location] as machine_location
                FROM 
                  ?              
              `, [d])
            .then(function(data){
              let datajson = JSON.stringify(data);
                fs.writeFileSync(r.replace(/.csv/g, '.json'), datajson);             
                  resolve(data) //guardar json
            }).catch(function(err){
              resolve({err: true, res: err})
            });
          }else{
            let datajson = JSON.stringify(data);
                fs.writeFileSync(r.replace(/.csv/g, '.json'), datajson);             
            resolve(data) //guardar json
          }               
      }).catch(function(err){
        resolve({err: true, res: err})
      });
    }else{
      alasql.fn.datetime = function(dateStr) {
        var date = moment(dateStr).format('YYYY-MM-DD HH:mm')
        return date
      };
      alasql.promise(
        `
          SELECT 
            [Modo Trabajo] as job_mode, [Nombre del Ordenador] as computer_name, [Nombre Usuario] as user_name, [Nombre Usuar.] as login_name, datetime([Fecha y Hora de Comienzo]) as start_date, datetime([Fecha y Hora de Finalizaci_n]) as end_date,
            [Con. Total de Blanco y Negro] as bn_count, [Con. Total a Todo Color] as colour_count, [Resultado] as result, [Nombre del modelo] as model, [N_mero de serie de la unidad] as n_serie, [Ubicaci_n de m_quina] as machine_location
          FROM 
            ?                    
        `, [d])
      .then(function(data){
          let datajson = JSON.stringify(data);
          fs.writeFileSync(r.replace(/.csv/g, '.json'), datajson);             
          //resolve({err: false, res: data}) //aqui guardar el json                                  
          resolve(data) //aqui guardar el json                                  
      }).catch(function(err){
        console.log(err);
        //resolve({err: true, res: err})
      });
    }    
  })
}

