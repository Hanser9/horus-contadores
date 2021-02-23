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
    alasql.promise(`SELECT top 1 [Model Name] as modelo, [Unit Serial Number] as n_serie FROM CSV('${path.join(__dirname + '/../../public/upload/' + f.filename)}', {headers:true})`)
    .then(function(data){
         console.log(data);
         var i = data[0]
         if(i.modelo === undefined){
            alasql.promise(
              `
                SELECT 
                  *
                FROM 
                  CSV('${path.join(__dirname + '/../../public/upload/' + f.filename)}', {headers:true})                    
              `)
            .then(function(data){   
              data = JSON.stringify(data);
              data = data.replace(/�/g, '_')
              data = JSON.parse(data)  
              var infoMaquina = data            
              alasql.promise(`SELECT top 1 [Nombre del modelo] as modelo, [N_mero de serie de la unidad] as n_serie FROM ?`, [infoMaquina])
              .then(function(data){
                var e = data[0]
                console.log(e);
                model.sendFile(f, d, e)
                .then(function(res){
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
                    `, [infoMaquina])
                  .then(function(data){        
                    console.log(data);              
                      resolve({err: false, res: data})                                   
                  }).catch(function(err){
                    console.log(err);
                    resolve({err: true, res: err})
                  });      
                }) 
              }).catch(function(err){
                console.log('Error:', err);
                });
            }).catch(function(err){
              console.log(err);
            });                      
         }else{
          model.sendFile(f, d, i)
          .then(function(res){
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
                  CSV('${path.join(__dirname + '/../../public/upload/' + f.filename)}', {headers:true})
              
              `)
            .then(function(data){
                //[Full Color Total Count] as colour_count
                var valida = alasql("SELECT TOP 1 colour_count FROM ?", [data] );
                console.log(valida, '<------ valida');        
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
                        CSV('${path.join(__dirname + '/../../public/upload/' + f.filename)}', {headers:true})
                    
                    `)
                  .then(function(data){
                        resolve({err: false, res: data})
                  }).catch(function(err){
                    resolve({err: true, res: err})
                  });
                }else{
                  resolve({err: false, res: data})
                }               
            }).catch(function(err){
              resolve({err: true, res: err})
            });      
          }) 
         }
    }).catch(function(err){
         console.log('Error:', err);
    });
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
        console.log(res, '<--------archivo');


        var i;
        var e;
        alasql.promise(`SELECT top 1 [Model Name] as modelo, [Unit Serial Number] as n_serie FROM CSV('${path.join(__dirname + '/../..' + res[0].ruta)}', {headers:true})`)
        .then(function(data){
            console.log(data);
            var i = data[0]
            if(i.modelo === undefined){
              
                alasql.promise(
                  `
                    SELECT 
                      *
                    FROM 
                      CSV('${path.join(__dirname + '/../..' + res[0].ruta)}', {headers:true})                    
                  `)
                .then(function(data){   
                  data = JSON.stringify(data);
                  data = data.replace(/�/g, '_')
                  data = JSON.parse(data)  
                  var infoMaquina = data 
                    var e = data[0]
                    console.log(e);
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
                      `, [infoMaquina])
                    .then(function(data){        
                      console.log(data);              
                        resolve({err: false, res: data})                                   
                    }).catch(function(err){
                      console.log(err);
                      resolve({err: true, res: err})
                    });  
                }).catch(function(err){
                  console.log(err);
                });                      
            }else{
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
                      CSV('${path.join(__dirname + '/../..' + res[0].ruta)}', {headers:true})
                  
                  `)
                .then(function(data){
                    //[Full Color Total Count] as colour_count
                    var valida = alasql("SELECT TOP 1 colour_count FROM ?", [data] );
                    console.log(valida, '<------ valida');        
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
                            CSV('${path.join(__dirname + '/../..' + res[0].ruta)}', {headers:true})
                        
                        `)
                      .then(function(data){
                            resolve({err: false, res: data})
                      }).catch(function(err){
                        resolve({err: true, res: err})
                      });
                    }else{
                      resolve({err: false, res: data})
                    }               
                }).catch(function(err){
                  resolve({err: true, res: err})
                });
            }
        }).catch(function(err){
            console.log('Error:', err);
        });




    })
  })
}

