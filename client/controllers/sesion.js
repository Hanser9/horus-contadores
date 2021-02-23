require('../services/sesion');
var swal = require('sweetalert2')
var CryptoJS = require('crypto-js');


angular.module(MODULE_NAME)
.controller('sesionCtrl', ['$scope', 'sesionService', '$timeout', function($scope, sesionService, $timeout) {
  var ctrl = this;

  $scope.data = {
     user: '',
     pass: ''
  };
  $scope.url = ''

  $scope.init = init;
  $scope.btnEnviarLogin = btnEnviarLogin;

  $('#loginMovil').hide()

   if(screen.width <= 800){
      $('#loginMovil').show()
      $('#loginWeb').hide()
   }


  function init(url) {
   $('#spinner').attr('class', 'loading');
   $scope.url = url
   $('#spinner').attr('class', 'loaded');
  }

  function btnEnviarLogin() {
   $('#spinner').attr('class', 'loading');
     var d  = $scope.data
     if(d.user === '' || d.pass === ''){
      $('#spinner').attr('class', 'loaded');
      swal.fire({
         icon: 'error',
         text: 'El campo usuario y/o contraseña son requeridos',
       })
     }else{        
        var password = CryptoJS.AES.encrypt(d.pass, 'cochis').toString();
        d.pass = password        
        sesionService.sendLogin(d)
        .success(function(res){            
            if(res.err){
               $('#spinner').attr('class', 'loaded');
               swal.fire({
                  icon: 'error',
                  text: res.description,
                })
            }else{               
               location.href = $scope.url
            }
        })
     }
  }


}]);

    angular.module(MODULE_NAME)
    .directive('fileModel', ['$parse', function ($parse) {
        return {
           restrict: 'A',
           link: function(scope, element, attrs) {
              var model = $parse(attrs.fileModel);
              var modelSetter = model.assign;
              element.bind('change', function(){
                 scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                 });
              });
           }
        };
     }]);
