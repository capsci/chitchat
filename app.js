var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

var server = require('http').createServer(app);
var port = 3000;
server.listen(port);
console.log("Socket.io server listening at http://127.0.0.1:" + port);

var sio = require('socket.io').listen(server);

sio.sockets.on('connection', function(socket){
  console.log('Web client connected');
  socket.on('disconnect', function() {
  console.log('Web client disconnected');
  });
});
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

//bind server to a host and port
var server = require('http').createServer(app);
var port = 3001;
server.listen(port);
console.log("users can connect to chatroom server listening on port http://localhost:" + port + "/chatroom");

var usersocs = [];
var usernames = [];

//setting up redis
var redis = require('redis');
var client = redis.createClient();

//redis.debug_mode = true;

client.on('connect', function() {
  console.log('Redis connected!!');
})

client.on('error', function() {
  console.log("Error in setting up Redis");
});


var id = 0;
//create a socket
var sio = require('socket.io').listen(server);
sio.sockets.on('connection', function(socket) {
  console.log('User Connected');
  socket.emit('ss-confirmation', {text: 'Success'});
  socket.on('nickname', function(data) {
    if (usernames.indexOf(data.text) == -1) {
      console.log("User " + data.text + " connected!!");
      usernames.push(data.text);
      usersocs.push(socket);
      socket.emit('connect-request', {text: 'Accepted'});
      for(var i = 0; i < id; i++) {
        client.get(i, function(error, value) {
          socket.emit('message', JSON.parse(value));
        });
        
      }
    }
    else {
      console.log("Connection for duplicate User " + data.text + " was rejected!!");
      socket.emit('connect-request', {text: 'Rejected'});
    }
    console.log("Connected Users: " + usernames);
  });
  socket.on('message', function(data) {
    client.set(id, JSON.stringify(data));
    id = id + 1;
    for(var i = 0; i < usersocs.length; i++) {
      usersocs[i].emit('message', data);
    }
  });
  socket.on('disconnect',function() {
    var i = usersocs.indexOf(socket);
    if( i != -1 ) {
      console.log('User ' + usernames[i] + ' disconnected');
      usersocs.splice(i,1);
      usernames.splice(i,1);
    }
  });
})

module.exports = app;
