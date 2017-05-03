var fs = require('fs');
var path = require('path');
var koa = require('koa');
var staticServer = require('koa-static');
var cors = require('kcors');
var sourceMap = require('source-map');

// config
var config = {
    port: 8055
};

var viewPath = path.join(__filename, '..', 'view');
var smDir = path.join(__filename, '..', 'sm');

var app = new koa();
app.use(cors());
app.use(staticServer(viewPath));

var errlist = [];
var sourcesPathMap = {};
var id = 0;

function getItemFromList(list, obj) {
    var key = Object.keys(obj)[0];
    var val = obj[key];

    var res = null;
    list.map(item => {
        if (item[key] == val) {
            res = item;
        }
    });

    return res;
}

function fixPath(filepath) {
    return filepath.replace(/\.[\.\/]+/g, "");
}

// 查找sourcemap
function lookupSourceMap(mapFile, line, column, callback) {
    fs.readFile(mapFile, function(err, data) {
        if(err) {
            console.error(err);
            return;
        }

        var fileContent = data.toString(),
            fileObj = JSON.parse(fileContent),
            sources = fileObj.sources;

        sources.map(item => {
            sourcesPathMap[fixPath(item)] = item;
        });

        var consumer = new sourceMap.SourceMapConsumer(fileContent);
        var lookup = {
            line: parseInt(line),
            column: parseInt(column)
        };
        var result = consumer.originalPositionFor(lookup);

        var originSource = sourcesPathMap[result.source],
            sourcesContent = fileObj.sourcesContent[sources.indexOf(originSource)];

        result.sourcesContent = sourcesContent;

        callback && callback(result);
    });
}

app.use(function *(next){
    if(this.path==='/report'){
        console.log(this.query);

        var paramObj = this.query;
        var msg = paramObj.msg,
            url = paramObj.url,
            row = paramObj.row,
            col = paramObj.col;

        if (url) {
            paramObj.id = ++id;
            errlist.push(paramObj);
        }
    }

    return yield next;
});

app.use(function *(next){
    if(this.path==='/errlist'){
        console.log(errlist)
        this.body = {
            errlist: errlist,
        };
    }
    return yield next;
});

app.use(function *(next){
    if(this.path==='/errdetail'){
        var errid = this.query.errid;

        var obj = getItemFromList(errlist, {id: errid});
        
        var url = obj.url,
            row = obj.row,
            col = obj.col;

        var filename = path.basename(url);
       
        var detailInfo = yield new Promise(function(resolve, reject) {
            lookupSourceMap(path.join(smDir, (filename + ".map")), row, col, function(res){
                var source = res.source;
                var filename = path.basename(source);
                var filepath = path.join(smDir, filename);
                resolve({
                    file: res.sourcesContent,
                    msg: obj.msg,
                    source: res.source,
                    row: res.line,
                    column: res.column,
                });
            });
        });

        console.log(detailInfo)

        this.body = detailInfo;
    }
    return yield next;
});

app.listen(config.port, function() {
  console.log('noerror server: listening on port ' + config.port);
});
