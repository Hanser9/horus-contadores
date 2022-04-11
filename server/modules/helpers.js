module.exports.isProduccion = function() {
  return true
}

module.exports.getUrl = function() {
  var produccion = true
  return produccion ? "http://104.236.194.47:3004/" : "http://192.168.1.12:3004/";  
}
