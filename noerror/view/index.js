(function(){
    function encodeHTML(str) {
        if(!str || str.length == 0) return "";
        return str.replace(/&/g, "&#38;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\'/g, "&#39;");
    }

    var $errlist = document.getElementById('errlist');
    var $errHeader = document.getElementById('errHeader');
    var $errCode = document.getElementById('errCode');

    $errlist.addEventListener('click', function(e){
        var target = e.target;
        var id = target.dataset.errid;

        var isshow = target.dataset.isshow;
        if (isshow !== undefined) {
            if (isshow > 0) {
                target.querySelector('.errdetail').style.display = "none";
            } else {
                target.querySelector('.errdetail').style.display = "block";
            }
            target.dataset.isshow = isshow > 0? 0: 1;
            return;
        }

        target.dataset.isshow = 1;

        var url = 'http://localhost:8055/errdetail?errid=' + id;

        fetch(url, {
            credentials: "same-origin"
        }).then((response) => {
            return response.json();
        }).then((data) => {
            console.log(data);

            $errCode.innerHTML = data.file;
            var lines = $errCode.innerText.split('\n');
            
            var row = data.row,
                len = lines.length - 1;

            var start = row - 3 >= 0? row - 3: 0,
                end = start + 5 >= len? len: start + 5; // 最多展示6行

            var newLines = [];
            for(var i = start; i <= end; i++) {
                newLines.push('<div class="code-line '+ (i + 1 == row? 'heightlight': '')+'" title="'+ (i + 1 == row? encodeHTML(data.msg): '')+'">' + (i+1) + '.    ' + encodeHTML(lines[i]) + '</div>');
            }
            target.innerHTML += '<div class="errdetail"><div class="errheader">' + data.source + ' at line ' + data.row + ':' + data.column + '</div>' + 
                '<pre class="errCode">' + newLines.join("") + '</pre></div>';
        }).catch((e) =>  {
            console.log(e);
        });

    });

    function renderItem(obj) {
        var msg = obj.msg;
        var url = obj.url;
        var id = obj.id;

        return '<li data-errid='+ id +'><p>' + encodeHTML(msg) + '</p><p>' + url + '</p></li>'
    }

    fetch('http://localhost:8055/errlist', {
        credentials: "same-origin"
    }).then((response) => {
        return response.json();
    }).then((data) => {
        console.log(data);
        $errlist.innerHTML = data && data.errlist.map(item => {
            return renderItem(item);
        }).join("");
    }).catch((e) =>  {
        console.log(e);
    });
})();