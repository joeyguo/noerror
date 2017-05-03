var koa = require('koa');
var staticServer = require('koa-static');
var cors = require('kcors');

// ------ app  ----- //
var app = new koa();

app.use(staticServer(__dirname));

app.listen(8066, function() {
  console.log('webserver: listening on port ' + 8066);
});


// ------ cdn  ----- //
var cdn = new koa();

cdn.use(function *(next){
    var requestOrigin = this.get('Origin');
    if (!requestOrigin) {
      return yield next;
    }
    this.set('Access-Control-Allow-Origin', requestOrigin);
    this.vary('Origin');
    return yield next;
});

cdn.use(staticServer(__dirname));

cdn.listen(8077, function() {
  console.log('cdn: listening on port ' + 8077);
});
