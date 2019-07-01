var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const {initGroups} = require('./Server/GroupMannager');
const {startSmokeSensorServer} = require('./Server/SmokeSensorClient/TCPConn');
const {runServer} = require('./Server/webthing/frameWorksServer');
const {startClient} = require('./Server/webthing/client');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
//https://www.jianshu.com/p/5d945f94f47c
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/icon', express.static('public/static/icon'));

app.use('/', indexRouter);
app.use('/users', usersRouter);

////////////////
app.use(function (req, res, next) {
  let accessOriginArray = new Array(10);
  accessOriginArray = [
    "http://localhost:8000",
    "http://localhost:8001",
    "http://15.200.19.110:8000",
    "http://121.43.151.237:8000",
    "http://localhost:3000",
    "http://15.200.19.110:3000",
    "http://121.43.151.237:3000"];
  let origin = req.headers.origin;
  if (accessOriginArray.indexOf(origin) !== -1) {
    // console.log(accessOriginArray.indexOf(origin));
    // console.log(origin);
    // console.log(res.getHeader("Access-Control-Allow-Origin"));
    res.header("Access-Control-Allow-Origin", origin);
  } else {
    accessOriginArray.push(origin);
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Credentials", 'true');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE");
  res.header("X-Powered-By", ' 3.2.1');
  // res.header("Content-Encoding", 'gzip, deflate');
  // res.header("Content-Language", 'zh-CN,zh;q=0.9');
  // res.header("Content-Type", "text/plain");

  /**
   * 跨域复杂请求时会先发送一个'OPTIONS'请求探路，当服务端回复200之后，前端才会发送正常的复杂请求
   */
  if (req.method === 'OPTIONS') {
    res.status(200);
    res.end();
  } else {
    next();
  }
});

//////////////

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


setTimeout(() => {
 // initGroups();
  // startAerialServer();
  // bpServer.startBPServer();
  // webServer.startWebServer(app);
  //startSmokeSensorServer();
  //console.log("startsmoke:Wq!");
  //  console.log("result");
//   startONOFFServer();
// // startWifiServer();
  runServer();
  //startClient();
//服务端开始向web前端进行数据推送
   //_WebMsgHandle.startMsgPush();
//  UECache.startSend();
}, 5 * 1000);
console.log("yes");
module.exports = app;
