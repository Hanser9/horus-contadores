this.getProduccion = function() {
  return false;
}

this.getUrl = function() {
  return this.getProduccion() ? "https://hazher.com.mx/contadores/" : "http://localhost:3004";
}