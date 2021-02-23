module.exports.isProduccion = function() {
  return false
}

module.exports.getUrl = function() {
  var produccion = false
  return produccion ? "https://hazher.com.mx/contadores/" : "http://localhost:3004/";  
}
