/**
 * Created by qinning on 15/4/22.
 */
var HttpClient = {

    /**
     * get request,jsb ok,html5 shows  No 'Access-Control-Allow-Origin' header is present on the requested resource
     * @param {string} url
     * @param {function} callback
     */
    doGet: function (url, callback) {
        var xhr = cc.loader.getXMLHttpRequest();
        xhr.open("GET", url, true);

        xhr.onreadystatechange = function () {
            //cc.log("readyState:"+xhr.readyState+",status:"+xhr.status+",statuText:"+xhr.statusText+",,,responseText:"+xhr.responseText);
            if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status <= 207)){
                var response = xhr.responseText;
                callback(null,response);
            }else{
                callback(xhr.status, xhr.statusText);
            }
        };
        xhr.send();
    },

    /**
     * post request.
     * @param {string} url
     * @param {string} param
     * @param {Object.<string,string>} headers
     * @param {Function} callback
     */
    doPost: function (url, params, headers, callback) {
        var xhr = cc.loader.getXMLHttpRequest();
        xhr.open("POST", url);
        for (var key in headers) {
            xhr.setRequestHeader(key, headers[key]);
        }
        xhr.onreadystatechange = function () {
            //cc.log("readyState:"+xhr.readyState+",status:"+xhr.status+",statusText:"+xhr.statusText+",,,responseText:"+xhr.responseText);
            if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status <= 207)){
                var response = xhr.responseText;
                callback(null, response);
            }else{
                callback(xhr.status, xhr.statusText);
            }
        };
        xhr.send(params);
    }
};

module.exports = HttpClient;