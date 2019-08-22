/**
 * Created by qinning on 15/4/24.
 */

var ExpChangedData = cc.Class.extend({
    levelUp: false,
    ctor: function(levelUp){
        this.levelUp = levelUp;
    }
});

module.exports = ExpChangedData;