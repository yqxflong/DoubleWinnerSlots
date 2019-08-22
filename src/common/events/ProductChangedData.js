/**
 * Created by qinning on 15/4/28.
 */

var ProductChangedData = cc.Class.extend({
    productType: 0,
    changes:0,
    ctor: function(productType,changes){
        this.productType = productType;
        this.changes = changes;
    }
});

module.exports = ProductChangedData;