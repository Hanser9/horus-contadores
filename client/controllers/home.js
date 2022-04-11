require('../services/home');
var swal = require('sweetalert2')
var alasql = require('alasql')
var moment = require('moment')
var Chart = require('chart.js');
var base64 = require('base-64');
var JSZip = require('jszip');

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
         console.log($scope.file.name)
         var zip = new JSZip()
         zip.file($scope.file.name, $scope.file)

         zip.generateAsync({type:"blob",compression: "DEFLATE",
             compressionOptions: {                  
                 level: 9
             }})
         .then(function(blobdata) {             
              console.log(blobdata, $scope.filtro.cliente)
              var data = {
               user: $scope.filtro.cliente,
               filename: $scope.file.name
              }
              console.log(data)
              HomeService.enviarArchivo(blobdata, JSON.stringify(data))
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
         });                             
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
   $('#spinner').attr('class', 'loading');  
   var data = $scope.data
   var info = $scope.info
   console.log(data, info, '<<<<<<<<')
   var dataTable = []
   var dataTableUser = []
   var dataTableComputer = []
   var table = []   
   var img = new Image();
   img.src = '../../img/makicop.png'; // bn_count  colour_count
   var job_mode = alasql("SELECT job_mode, SUM(case when bn_count > 0 then bn_count else 0 end) as total_bn, SUM(case when colour_count > 0 then colour_count else 0 end) as total_color FROM ? GROUP BY job_mode", [data] );
   var usuario = alasql("SELECT user_name, SUM(case when bn_count > 0 then bn_count else 0 end) as total_bn, SUM(case when colour_count > 0 then colour_count else 0 end) as total_color FROM ? GROUP BY user_name", [data] );
   var computadora = alasql("SELECT computer_name, SUM(case when bn_count > 0 then bn_count else 0 end) as total_bn, SUM(case when colour_count > 0 then colour_count else 0 end) as total_color FROM ? GROUP BY computer_name", [data] );
   console.log(job_mode, 'job_mode')
   for(var key in job_mode){
      table.push(job_mode[key].job_mode)
      table.push(job_mode[key].total_bn)
      table.push(job_mode[key].total_color)
      dataTable.push(table)
      table = []
   }
   for(var key in usuario){
      table.push(usuario[key].user_name)
      table.push(usuario[key].total_bn)
      table.push(usuario[key].total_color)
      dataTableUser.push(table)
      table = []
   }
   for(var key in computadora){
      table.push(computadora[key].computer_name)
      table.push(computadora[key].total_bn)
      table.push(computadora[key].total_color)
      dataTableComputer.push(table)
      table = []
   }
   console.log(dataTable);
   var user = $scope.filtro.user === "1" ? 'Ninguno' : $scope.filtro.user
   var computer = $scope.filtro.computer === "1" ? 'Ninguno' : $scope.filtro.computer
   var job = $scope.filtro.job === "1" ? 'Ninguno' : $scope.filtro.job

   var doc = new jsPDF();
   img.onload = function(){
      doc.setFontSize(14);   
      doc.addImage(img, 'PNG', 10, 2);
      var imgSharp = new Image();
      imgSharp.src = '../../img/sharp.png'
      imgSharp.onload = function() {
         doc.addImage(imgSharp, 'PNG', 170, 2);
         doc.text(85,20, 'Distribuidor autorizado')
         doc.line(2, 25, 205, 25);
         doc.text(20,40, 'Makicop - Reporte de contadores, fecha de creacion: ' + moment().format('YYYY-MM-DD'))
         doc.text(20,50, 'Modelo: ' + $scope.info.model + ', Numero de serie: ' + $scope.info.n_serie)
         doc.text(20,60, 'Contador Total B/N: ' + $scope.info.contadorBn + ', Contador total Color: ' + $scope.info.contadorColor)
         doc.text(20,70, 'Filtro de fecha Desde: ' + moment($scope.filtro.fechaIni).format('YYYY-MM-DD') + ', Hasta: ' + moment($scope.filtro.fechaFin).format('YYYY-MM-DD'))
         doc.text(20,80, 'Filtros aplicados (Usuario: ' +  user  + ' Computadora: ' + computer + ' Trabajo:' + job + ')')
         doc.line(20,85, 200, 85);
         doc.text(40,100, 'Detalles por modo de trabajo, por usuario y por computadora')
         var columns = ["Modo de trabajo", "Contador B/N", "Contador Color"];

         doc.autoTable(columns,dataTable,
         { margin:{ top: 110 }}
         );
         let finalY = doc.lastAutoTable.finalY + 50;
         console.log(finalY)
         var columns = ["Usuario", "Contador B/N", "Contador Color"];
         doc.autoTable(columns,dataTableUser);
         let finalY2 = doc.lastAutoTable.finalY + 50;
         console.log(finalY2)
         var columns = ["Computadora", "Contador B/N", "Contador Color"];
         doc.autoTable(columns,dataTableComputer);
         //doc.save('reporteContador-' + $scope.info.model + '-' + $scope.info.n_serie + '-' + moment().format('YYYY/MM/DD') + '.pdf')
         doc.save('reporteContador-' + computer + '-' + moment().format('YYYY/MM/DD') + '.pdf')
         $('#spinner').attr('class', 'loaded');
      };            
   };   
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
