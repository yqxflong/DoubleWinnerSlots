/**
 * Created by qinning on 15/4/24.
 */

var HttpProtocolIOErrorData = cc.Class.extend({
    errorType: 0,
    ctor: function(errorType){
        this.errorType = errorType;
    }
});

module.exports = HttpProtocolIOErrorData;