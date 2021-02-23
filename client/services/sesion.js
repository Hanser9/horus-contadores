var helper = require('../helpers')

angular.module(MODULE_NAME)
.service('sesionService', ['$http', function($http) {  
  var url = helper.getUrl();
  var urlBase = url + '/sesion';

  this.sendLogin = function(d) {
    return $http.post(urlBase + '/sendLogin', d);
  }

}]);
