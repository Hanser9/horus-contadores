var moment = require('moment')
var mssql = require("mssql")
var config = {
    user: 'sa',
    password: '',
    server: '104.236.194.47',
    database: 'contadores'
};

module.exports = {
    sendFile: sendFile,
    getClientes: getClientes,
    getArchivo: getArchivo
};

function sendFile (f, d, i) {
    return new Promise(function(resolve, reject) {
        console.log(d)
        mssql.connect(config, function (err) {
            if (err){
                console.log(err);
            }else {
                var query =
                `
                  INSERT INTO contadores.dbo.files
                  ([path], nombre, fecha, maquina, n_serie, id_user)
                  VALUES('/public/upload/', '${f.filename}', '${moment().format('YYYY-MM-DD')}', '${i.modelo}', '${i.n_serie}', ${d.id_user});                
                              `;
                //console.log(query, '\n Query ejecutado')
                var request = new mssql.Request();
                request.query(query,
                    function (err, recordset) {
                        if (err) {
                            console.log(err)
                        }else {
                            resolve(recordset.recordset)
                        }
                    });
            }
        });
    })
}

function getClientes () {
  return new Promise(function(resolve, reject) {
      mssql.connect(config, function (err) {
          if (err){
              console.log(err);
          }else {
              var query =
              `
                SELECT 
                  a.id_user, a.nombre 
                FROM
                  users a 
                WHERE
                  a.activo = 1
                AND
                  a.id_user_type = 2;               
                            `;
              //console.log(query, '\n Query ejecutado')
              var request = new mssql.Request();
              request.query(query,
                  function (err, recordset) {
                      if (err) {
                          console.log(err)
                      }else {
                          resolve(recordset.recordset)
                      }
                  });
          }
      });
  })
}

function getArchivo (d) {
  return new Promise(function(resolve, reject) {
      mssql.connect(config, function (err) {
          if (err){
              console.log(err);
          }else {
              var query =
              `
                SELECT TOP 1 
                  CONCAT([path], nombre) as ruta
                FROM 
                  files 
                WHERE
                  id_user = ${d.id_user}
                ORDER BY 
                  id_file DESC;               
                            `;
              //console.log(query, '\n Query ejecutado')
              var request = new mssql.Request();
              request.query(query,
                  function (err, recordset) {
                      if (err) {
                          console.log(err)
                      }else {
                          resolve(recordset.recordset)
                      }
                  });
          }
      });
  })
}