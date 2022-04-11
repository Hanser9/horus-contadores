this.getProduccion = function() {
  return true;
}

this.getUrl = function() {
  return this.getProduccion() ? "http://104.236.194.47:3004" : "http://192.168.1.12:3004";
}
