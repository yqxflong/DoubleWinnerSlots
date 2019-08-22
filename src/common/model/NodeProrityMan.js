/**
 * Created by JianWang on 8/8/16.
 */
var NodeProrityMan = cc.Class.extend({

    FBLIKEUSNODEPRORITY:0,
    DISCOUNTNODEPORITY:2,

    currentPrority:-1,
    ctor: function () {
        this.currentPrority = -1;
    },
    askForVisible:function (prority) {

       if(this.currentPrority <= prority) {
           var oldPrority = this.currentPrority;
           this.currentPrority = prority;
           if(oldPrority < 0 || oldPrority == prority)
               return true;
           return false;
       }
        return false
    },
    resetPrority:function () {
        this.currentPrority = -1;
    }
});



NodeProrityMan._instance = null;
NodeProrityMan._firstUseInstance = true;

/**
 *
 * @returns {NodeProrityMan}
 */
NodeProrityMan.getInstance = function () {
    if (NodeProrityMan._firstUseInstance) {
        NodeProrityMan._firstUseInstance = false;
        NodeProrityMan._instance = new NodeProrityMan();
    }
    return NodeProrityMan._instance;
};

module.exports = NodeProrityMan;
