var express         = require('express')
var app             = express()
var bodyParser      = require('body-parser');
var path            = require('path');
var exphbs          = require('express-handlebars');
var redis           = require('redis')
var expressSession  = require('express-session');
var RedisStore      = require('connect-redis')(expressSession)
var redisClient     = redis.createClient();
var cookieParser    = require('cookie-parser');
var path            = require('path');
var multer          = require('multer');
var server          = null
var path            = require('path');
var helpers         = require('./server/modules/helpers')
var fs              = require('fs')
var http            = helpers.isProduccion() ? require('http') : require('https')

// CONFIGURAR HTTPSpruebaipad
// if (!helpers.isProduccion()) {
//     console.log('Ambiente de pruebas')
//     server = http.createServer({
//         key: fs.readFileSync(path.join('server', 'assets', 'key.pem')),
//         cert: fs.readFileSync(path.join('server', 'assets', 'cert.pem'))
//     }, app)
// } else {
//     console.log('Ambiente de producción')
//     server = require('http').createServer(app)
// }

console.log('Ambiente de producción')
server = require('http').createServer(app)

// CONFIGURAR SOCKET IO
io = require('socket.io').listen(server)
nsp = io.of('/' + global.sistema + '/')

// client.hmset('frameworks', {
//     'javascript': 'AngularJS',
//     'css': 'Bootstrap',
//     'node': 'Express'
// });

// client.del('frameworks')

// client.hgetall('frameworks', function(err, object) {
//     console.log(object);
// });


// LEER FORMATOS JSON
app.use(bodyParser.json());
app.use(bodyParser());
app.use(cookieParser());

// ACTIVAR CORS
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
})

app.use(
    expressSession({
      store: new RedisStore({ client: redisClient }),
      secret: 'cochis',
      saveUninitialized: false,
      resave: false
    })
  )

// PUERTO DONDE ESCUCHARA LA APP
PUERTO = 3004;

// CARPETA PUBLICA
app.use(express.static(__dirname + '/public'));

app.engine('.hbs', exphbs({
  layoutsDir: path.join(__dirname, "./client/views/layouts"),
  partialsDir: path.join(__dirname, "./client/views/partial"),
  defaultLayout: 'main',
  extname: 'hbs'
}));

app.set('view engine', '.hbs');
app.set('views', __dirname + '/client/views');

// DEFINE ROUTES
var navRoute = require("./server/routes/nav");
app.use('/', navRoute);

var homeRoute = require("./server/routes/home");
app.use('/home', homeRoute);

var sesionRoute = require("./server/routes/sesion");
app.use('/sesion', sesionRoute);


app.set('port', process.env.PORT || PUERTO)

app.start = app.listen = function() {
    console.log('Escuchando desde el puerto ' + PUERTO)
    return server.listen.apply(server, arguments)
}

app.start(app.get('port'))
