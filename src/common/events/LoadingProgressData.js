/**
 * Created by qinning on 15/4/24.
 */

var LoadingProgressData = cc.Class.extend({
    progress: 0,
    isLoadingResource: false,
    ctor: function(progress, isLoadingResource){
        this.progress = progress;
        this.isLoadingResource = isLoadingResource;
    }
});

module.exports = LoadingProgressData;