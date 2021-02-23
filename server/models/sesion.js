var mssql = require("mssql")
var config = {
    //stringConnection
};

module.exports = {
    validateUser: validateUser
};

function validateUser (d) {
    return new Promise(function(resolve, reject) {
        console.log(d)
        mssql.connect(config, function (err) {
            if (err){
                console.log(err);
            }else {
                var query =
                `
                        SELECT 
                            a1.id_user, a1.id_user_type, a1.usuario, a1.nombre, a1.apellidos, a2.nombre as tipo_usuario 
                        FROM 
                            users a1
                        INNER JOIN
                            user_type a2
                        ON
                            a1.id_user_type = a2.id_user_type 
                        WHERE 
                            a1.usuario = '${d.user}'
                        AND 
                            a1.pass = '${d.pass}'
                        AND 
                            a1.activo = 1;
                              `;
                console.log(query, '\n Query ejecutado')
                var request = new mssql.Request();
                request.query(query,
                    function (err, recordset) {
                        if (err) {
                            console.log(err)
                        }else {
                            console.log(recordset.recordset)
                            resolve(recordset.recordset)
                        }
                    });
            }
        });
    })
}