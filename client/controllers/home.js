require('../services/home');
var swal = require('sweetalert2')
var alasql = require('alasql')
var moment = require('moment')
var Chart = require('chart.js');


angular.module(MODULE_NAME)
.controller('homeCtrl', ['$scope', 'HomeService', '$timeout', function($scope, HomeService, $timeout) {
  var ctrl = this;
  
  $scope.init = init;
  $scope.btnCerrarSesion = btnCerrarSesion;
  $scope.btnCargaArchivo = btnCargaArchivo;
  $scope.btnFiltraRango = btnFiltraRango;
  $scope.btnFiltraSelect = btnFiltraSelect;
  $scope.btnGeneretePdf = btnGeneretePdf;

  $scope.url = ''
  $scope.showData = false
  $scope.showFile = true
  $scope.file = null;
  $scope.data = [];
  $scope.originalData = [];
  $scope.info = {
     contadorColor: 0,
     contadorBn: 0,
     model: '',
     n_serie: '',
     users: [],
     computers: [],
     jobs: []
  }
  $scope.filtro = {
   fechaIni: '',
   fechaFin: new Date(moment().format()),
   user: '1',
   computer: '1',
   job: '1',
   cliente: '1',
   validaRango: false
  }
  $scope.clientes = {}
  

  function init(url, user){   
   $('#spinner').attr('class', 'loading');  
      $scope.url = url   
      console.log(user);
      if(user === 2){
         HomeService.getArchivo()
         .then(function(res){
            $scope.showData = true     
            $scope.data = res.data.res
            $scope.originalData = res.data.res
            var users = alasql("SELECT COUNT(user_name), user_name FROM ? GROUP BY user_name", [$scope.originalData] );
            var computers = alasql("SELECT COUNT(computer_name), computer_name FROM ? GROUP BY computer_name", [$scope.originalData] );
            var jobs = alasql("SELECT COUNT(job_mode), job_mode FROM ? GROUP BY job_mode", [$scope.originalData] );
            $scope.info.users = users
            $scope.info.computers = computers
            $scope.info.jobs = jobs
            getContadores() 
            var contadores = alasql("SELECT TOP 1  model, n_serie, start_date FROM ?", [$scope.data] );    
            $scope.info.model = contadores[0].model
            $scope.info.n_serie = contadores[0].n_serie
            $scope.filtro.fechaIni = new Date(moment(contadores[0].start_date).format())
            $scope.showFile = false


            setChart()
            swal.fire({
               icon: 'success',
               title: 'Datos Cargados!',
               text: 'Modelo: ' + $scope.info.model + ' Serie: ' + $scope.info.n_serie,         
            })

            $('#spinner').attr('class', 'loaded');
         })   
      }else{
         HomeService.getClientes()
         .then(function(res){
            $scope.clientes = res.data.res
            console.log(res.data.res);
            $('#spinner').attr('class', 'loaded');
         })   
      }      
  }

  function btnCerrarSesion(){
      HomeService.cerrarSesion()
      .then(function(res){
         location.href = $scope.url
      })
  }

  function btnCargaArchivo() {
   $('#spinner').attr('class', 'loading'); 
      if($scope.file == null || $scope.filtro.cliente === "1"){
         swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Todos los campos son requeridos!',         
         })   
         $('#spinner').attr('class', 'loaded');
      }else{
         $scope.filtro.fechaFin = new Date(moment().format())
         HomeService.enviarArchivo($scope.file, $scope.filtro.cliente)
         .then(function(res){
            $scope.showData = true     
            $scope.data = res.data.res
            $scope.originalData = res.data.res
            var users = alasql("SELECT COUNT(user_name), user_name FROM ? GROUP BY user_name", [$scope.originalData] );
            var computers = alasql("SELECT COUNT(computer_name), computer_name FROM ? GROUP BY computer_name", [$scope.originalData] );
            var jobs = alasql("SELECT COUNT(job_mode), job_mode FROM ? GROUP BY job_mode", [$scope.originalData] );
            $scope.info.users = users
            $scope.info.computers = computers
            $scope.info.jobs = jobs
            getContadores() 
            var contadores = alasql("SELECT TOP 1  model, n_serie, start_date FROM ?", [$scope.data] );    
            $scope.info.model = contadores[0].model
            $scope.info.n_serie = contadores[0].n_serie
            $scope.filtro.fechaIni = new Date(moment(contadores[0].start_date).format())
            setChart()
            swal.fire({
               icon: 'success',
               title: 'Datos Cargados!',
               text: 'Modelo: ' + $scope.info.model + ' Serie: ' + $scope.info.n_serie,         
            })
            $('#spinner').attr('class', 'loaded');
         })
           
      }           

  }

  function btnFiltraRango(i) {
   $('#spinner').attr('class', 'loading'); 
   if(i === 1){
      $scope.data = $scope.originalData
      $scope.filtro.fechaIni = ''
      $scope.filtro.fechaFin = ''
      $scope.filtro.validaRango = false
      getContadores()
      $('#spinner').attr('class', 'loaded');
   }else{
      if($scope.filtro.fechaIni === '' || $scope.filtro.fechaFin === ''){
         swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Se requieren los campos de fecha!',         
          })
          $('#spinner').attr('class', 'loaded');
        }else{
         var data = alasql(`
            SELECT 
               *
            FROM 
               ? 
            WHERE 
               end_date BETWEEN '${moment($scope.filtro.fechaIni).format('YYYY-MM-DD 00:00')}' AND '${moment($scope.filtro.fechaFin).format('YYYY-MM-DD 23:59')}'
         `, [$scope.originalData] );      
         $scope.data = data   
         $scope.filtro.validaRango = true
         filtraFechaSelect()
         getContadores()
         setChart()
         $('#spinner').attr('class', 'loaded');
        }
   }        
  }

  function getContadores() {
   var contadores = alasql("SELECT SUM(bn_count) as bn, SUM(colour_count) as color, model FROM ? WHERE job_mode in ('Copy', 'Print', 'List Print', 'List Prints', 'Direct Print(USB Memory)', 'Impresi_n Directa (Memoria USB)', 'Imprimir lista', 'Imprimir', 'Impresi_n Directa (P_gina Web)', 'Copiar', 'Lista de Impres.') GROUP BY model", [$scope.data] );
   $scope.info.contadorBn = contadores[0].bn
   $scope.info.contadorColor = parseInt(contadores[0].color)
  }

  function btnFiltraSelect(i){
   $('#spinner').attr('class', 'loading'); 
   btnFiltraRango()
/*      if(i === 1){
      if($scope.filtro.user === "1"){         
         btnFiltraRango()
      }else{
            var data = alasql(`
               SELECT 
                  *
               FROM 
                  ? 
               WHERE
                  user_name = '${$scope.filtro.user}'
            `, [$scope.data] ); 
            $scope.data = data
            getContadores()
            $('#spinner').attr('class', 'loaded'); 
      }
     }else if(i === 2){
      if($scope.filtro.computer === "1"){
         btnFiltraRango()
      }else{
         var data = alasql(`
               SELECT 
                  *
               FROM 
                  ? 
               WHERE
                  computer_name = '${$scope.filtro.computer}'
            `, [$scope.data] ); 
            $scope.data = data
            getContadores()
            $('#spinner').attr('class', 'loaded'); 
      }
     }else if(i === 3){
      if($scope.filtro.job === "1"){
         btnFiltraRango()
      }else{
         var data = alasql(`
               SELECT 
                  *
               FROM 
                  ? 
               WHERE
                  job_mode = '${$scope.filtro.job}'
            `, [$scope.data] ); 
            $scope.data = data
            getContadores()
            $('#spinner').attr('class', 'loaded'); 
      }
     } */
  }

  function filtraFechaSelect() {
     console.log($scope.data, $scope.filtro, '<--------');
   if($scope.filtro.user != "1" && $scope.filtro.job != "1" && $scope.filtro.computer != "1"){
      var data = alasql(`
               SELECT 
                  *
               FROM 
                  ? 
               WHERE
                  user_name = '${$scope.filtro.user}'
               AND
                  computer_mode = '${$scope.filtro.computer}'
               AND
                  job_mode = '${$scope.filtro.job}'
            `, [$scope.data] ); 
            $scope.data = data
   }else if($scope.filtro.user === "1" && $scope.filtro.job != "1" && $scope.filtro.computer != "1"){
      var data = alasql(`
               SELECT 
                  *
               FROM 
                  ? 
               WHERE
                  computer_name = '${$scope.filtro.computer}'
               AND
                  job_mode = '${$scope.filtro.job}'
            `, [$scope.data] ); 
            $scope.data = data
   }else if($scope.filtro.user === "1" && $scope.filtro.job === "1" && $scope.filtro.computer != "1"){
      var data = alasql(`
               SELECT 
                  *
               FROM 
                  ? 
               WHERE
                  computer_name = '${$scope.filtro.computer}'
            `, [$scope.data] ); 
            $scope.data = data
   }else if($scope.filtro.user != "1" && $scope.filtro.job != "1" && $scope.filtro.computer === "1"){
      var data = alasql(`
               SELECT 
                  *
               FROM 
                  ? 
               WHERE
                  user_name = '${$scope.filtro.user}'
               AND
                  job_mode = '${$scope.filtro.job}'
            `, [$scope.data] ); 
            $scope.data = data
   }else if($scope.filtro.user === "1" && $scope.filtro.job != "1" && $scope.filtro.computer === "1"){
      var data = alasql(`
               SELECT 
                  *
               FROM 
                  ? 
               WHERE
                  job_mode = '${$scope.filtro.job}'
            `, [$scope.data] ); 
            $scope.data = data
   }else if($scope.filtro.user != "1" && $scope.filtro.job === "1" && $scope.filtro.computer != "1"){
      var data = alasql(`
               SELECT 
                  *
               FROM 
                  ? 
               WHERE
                  user_name = '${$scope.filtro.user}'
               AND
                  computer_name = '${$scope.filtro.computer}'
            `, [$scope.data] ); 
            $scope.data = data
   }else if($scope.filtro.user != "1" && $scope.filtro.job === "1" && $scope.filtro.computer === "1"){
      var data = alasql(`
               SELECT 
                  *
               FROM 
                  ? 
               WHERE
                  user_name = '${$scope.filtro.user}'
            `, [$scope.data] ); 
            $scope.data = data
   }
  }

  function setChart(){
   console.log($scope.myChart, 'estooooooo');
   var total = []
   var job = []
   var coloR = [];

   var dynamicColors = function() {
      var r = Math.floor(Math.random() * 255);
      var g = Math.floor(Math.random() * 255);
      var b = Math.floor(Math.random() * 255);
      return "rgb(" + r + "," + g + "," + b + ")";
   };
   var data = alasql("SELECT COUNT(job_mode) as total, job_mode FROM ? GROUP BY job_mode", [$scope.data] );    
   console.log(data, 'chart');
   for(var key in data){
      total.push(data[key].total)
      job.push(data[key].job_mode)  
      coloR.push(dynamicColors());
   }   
   if($scope.myChart != undefined){
      $scope.myChart.destroy();      
      var ctx = document.getElementById('myChart').getContext('2d');
      $scope.myChart = new Chart(ctx, {
         type: 'pie',
         data: {
            labels: job,
            datasets: [{
                  label: 'Tipo de trabajo',
                  data: total,
                  backgroundColor: coloR,
                  borderWidth: 1
            }]
         },
         options: {
         }
      });
   }else{
      var ctx = document.getElementById('myChart').getContext('2d');
      $scope.myChart = new Chart(ctx, {
         type: 'pie',
         data: {
            labels: job,
            datasets: [{
                  label: 'Tipo de trabajo',
                  data: total,
                  backgroundColor: coloR,
                  borderWidth: 1
            }]
         },
         options: {
         }
      });
   }
  }

  function btnGeneretePdf(){
   var data = $scope.data
   var dataTable = []
   var table = []   
   for(var key in data){
      table.push(data[key].user_name)
      table.push(data[key].computer_name)
      table.push(data[key].login_name)
      table.push(data[key].job_mode)
      table.push(data[key].result)
      table.push(data[key].start_date)
      table.push(data[key].bn_count)
      table.push(data[key].colour_count)
      dataTable.push(table)
      table = []
   }
   console.log(dataTable);
   var user = $scope.filtro.user === "1" ? 'Ninguno' : $scope.filtro.user
   var computer = $scope.filtro.computer === "1" ? 'Ninguno' : $scope.filtro.computer
   var job = $scope.filtro.job === "1" ? 'Ninguno' : $scope.filtro.job
   var doc = new jsPDF();
   doc.setFontSize(14);
   doc.text(20,20, 'Horus Network - Contadores, fecha de creacion: ' + moment().format('YYYY-MM-DD'))
   doc.text(20,30, 'Modelo: ' + $scope.info.model + ' Numero de serie: ' + $scope.info.n_serie)
   doc.text(20,40, 'Contador Total B/N: ' + $scope.info.contadorBn + ' Contador total Color: ' + $scope.info.contadorColor)
   doc.text(20,50, 'Desde: ' + moment($scope.filtro.fechaIni).format('YYYY-MM-DD') + ' Hasta: ' + moment($scope.filtro.fechaFin).format('YYYY-MM-DD'))
   doc.text(20,60, 'Usuario: ' +  user  + ' Computadora: ' + computer + ' Trabajo:' + job)
   var columns = ["Usuario", "Computadora", "Tarjeta", "Trabajo", "Resultado", "Fecha", "B/N", "Color"];;

   doc.autoTable(columns,dataTable,
   { margin:{ top: 70 }}
   );
   //doc.save('reporteContador-' + $scope.info.model + '-' + $scope.info.n_serie + '-' + moment().format('YYYY/MM/DD') + '.pdf')
   doc.save('reporteContador-' + computer + '-' + moment().format('YYYY/MM/DD') + '.pdf')
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
