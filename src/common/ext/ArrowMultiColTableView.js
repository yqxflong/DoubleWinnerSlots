/**
 * Created by qinning on 16/1/5.
 */

var MultiColTableView = require("./MultiColTableView");
var ArrowTableView = require("./ArrowTableView");

var ArrowMultiColTableView = ArrowTableView.extend({
    /**
     * ctor
     * @param {cc.MultiColTableViewDataSource} dataSource
     * @param {cc.size} size
     * @param {cc.Node} container
     */
    ctor: function (dataSource, size, container) {
        cc.LayerColor.prototype.ctor.call(this);

        this._tableView = new MultiColTableView(dataSource, size, container);
        this._tableView.setMultiTableViewDataSource(dataSource);
        this._tableView.setMultiTableViewDelegate(this);
        this.addChild(this._tableView);
        this._contentSize = size;
        this.setOpacity(0);
    },

    gridTouched:function(table,grid){
        if (this._delegate && this._delegate.gridTouched) {
            this._delegate.gridTouched(table, grid);
        }
    }
});

module.exports = ArrowMultiColTableView;