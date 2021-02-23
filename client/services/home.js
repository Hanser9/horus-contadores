var helper = require('../helpers')

angular.module(MODULE_NAME)
.service('HomeService', ['$http', function($http) {
  var url = helper.getUrl();
  var urlBase = url + '/home';

  this.cerrarSesion = function(d) {
    return $http.post(urlBase + '/cerrarSesion', d);
  }

  this.enviarArchivo = function(d, i) {
    var fd = new FormData();
    fd.append('file', d)
    fd.append('user', i)
    return $http.post(urlBase + '/sendFile', fd, {
      transformRequest: angular.identity,
      headers: {'Content-Type': undefined}
      });
  }

  this.getClientes = function() {
    return $http.get(urlBase + '/getClientes');
  }

  this.getArchivo = function() {
    return $http.get(urlBase + '/getArchivo');
  }

}]);
