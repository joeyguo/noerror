var koa = require('koa');
var staticServer = require('koa-static');
var cors = require('kcors');

// config
var config = {
    port: 8055
};

// ------ server  ----- //
var app = new koa();
app.use(cors());

app.use(staticServer('view'));

app.listen(config.port, function() {
  console.log('noerror server listening on port ' + config.port);
});
