/**
 * Created by qinning on 15/12/18.
 */

var AudioHelper = require("../util/AudioHelper");

var ArrowTableView = cc.LayerColor.extend({
    _isRunningAnim: false,
    _tableView: null,
    _leftArrowItem: null,
    _rightArrowItem: null,
    _contentSize: null,
    _delegate: null,
    /**
     * The
     * @param dataSource
     * @param size
     * @param container
     */
    ctor: function (dataSource, size, container) {
        this._super();
        this._tableView = new cc.TableView(dataSource, size, container);
        this.addChild(this._tableView);
        this._tableView.setDelegate(this);
        this._tableView.setDataSource(dataSource);
        this._contentSize = size;
        this.setOpacity(0);
    },

    /**
     * left and right MenuItem use different sprite frame.
     * @param leftNormalSpriteFrame
     * @param leftSelectedSpriteFrame
     * @param rightNormalSpriteFrame
     * @param rightSelectedSpriteFrame
     */
    setArrowItemSpriteFrame: function (leftNormalSpriteFrame, leftSelectedSpriteFrame, rightNormalSpriteFrame, rightSelectedSpriteFrame) {
        this._leftArrowItem = new cc.MenuItemSprite(
            new cc.Sprite(leftNormalSpriteFrame),
            new cc.Sprite(leftSelectedSpriteFrame),
            null, this.horizontalPrev, this);
        this._leftArrowItem.setAnchorPoint(cc.p(0.0, 0.5));
        this._leftArrowItem.x = 5;
        this._leftArrowItem.y = this._contentSize.height * 0.5;
        this._rightArrowItem = new cc.MenuItemSprite(
            new cc.Sprite(rightNormalSpriteFrame),
            new cc.Sprite(rightSelectedSpriteFrame),
            null, this.horizontalNext, this);
        this._rightArrowItem.setAnchorPoint(cc.p(1.0, 0.5));
        this._rightArrowItem.x = this._contentSize.width - 5;
        this._rightArrowItem.y = this._contentSize.height * 0.5;

        var arrowMenu = new cc.Menu(this._leftArrowItem, this._rightArrowItem);
        arrowMenu.x = arrowMenu.y = 0;
        this.addChild(arrowMenu, 10);
    },

    /**
     * left and right MenuItem will use the same sprite frame, right item will reverse the left item.
     * @param leftNormalSpriteFrame
     * @param leftSelectedSpriteFrame
     */
    setArrowItemLeftSpriteFrame: function (leftNormalSpriteFrame, leftSelectedSpriteFrame) {
        this._leftArrowItem = new cc.MenuItemSprite(
            new cc.Sprite(leftNormalSpriteFrame),
            new cc.Sprite(leftSelectedSpriteFrame),
            null, this.horizontalPrev, this);
        this._leftArrowItem.setAnchorPoint(cc.p(0.0, 0.5));
        this._leftArrowItem.x = 5;
        this._leftArrowItem.y = this._contentSize.height * 0.5;
        this._rightArrowItem = new cc.MenuItemSprite(
            new cc.Sprite(leftNormalSpriteFrame),
            new cc.Sprite(leftSelectedSpriteFrame),
            null, this.horizontalNext, this);
        this._rightArrowItem.setScaleX(-1);
        this._rightArrowItem.setAnchorPoint(cc.p(1.0, 0.5));
        this._rightArrowItem.x = this._contentSize.width - 5;
        this._rightArrowItem.y = this._contentSize.height * 0.5;

        var arrowMenu = new cc.Menu(this._leftArrowItem, this._rightArrowItem);
        arrowMenu.x = arrowMenu.y = 0;
        this.addChild(arrowMenu, 10);
    },

    /**
     * use the ccb MenuItem
     * @param leftArrowItem
     * @param rightArrowItem
     */
    setArrowItem: function (leftArrowItem, rightArrowItem) {
        this._leftArrowItem = leftArrowItem;
        this._rightArrowItem = rightArrowItem;
    },

    scrollViewDidScroll: function (view) {
        if (this._leftArrowItem) {
            this._onTableViewOffsetChanged();
        }
        if (this._delegate && this._delegate.scrollViewDidScroll) {
            this._delegate.scrollViewDidScroll(view);
        }
    },

    scrollViewDidZoom: function (view) {
        if (this._delegate && this._delegate.scrollViewDidZoom) {
            this._delegate.scrollViewDidZoom(view);
        }
    },

    leftArrowClicked: function (sender) {
        AudioHelper.playBtnClickSound();
        if (this._leftArrowItem) {
            this._leftArrowItem.visible = false;
        }
        if (this._rightArrowItem) {
            this._rightArrowItem.visible = false;
        }

        var offsetX = this._tableView.getContentOffset().x;
        var maxOffsetX = this._tableView.maxContainerOffset().x;
        var moveOffset = Math.min(maxOffsetX - offsetX, 768) + offsetX;
        this._tableView.setContentOffsetInDuration(cc.p(moveOffset, 0), 0.4);
        this._isRunningAnim = true;

        this.runAction(cc.sequence(cc.delayTime(0.45), cc.callFunc(this.onTableViewOffsetChanged, this)));
    },

    rightArrowClicked: function (sender) {
        AudioHelper.playBtnClickSound();
        if (this._leftArrowItem) {
            this._leftArrowItem.visible = false;
        }
        if (this._rightArrowItem) {
            this._rightArrowItem.visible = false;
        }

        var offsetX = this._tableView.getContentOffset().x;
        var minOffsetX = this._tableView.minContainerOffset().x;
        var moveOffset = Math.max(minOffsetX - offsetX, -768) + offsetX;
        this._tableView.setContentOffsetInDuration(cc.p(moveOffset, 0), 0.4);
        this._isRunningAnim = true;

        this.runAction(cc.sequence(cc.delayTime(0.45), cc.callFunc(this.onTableViewOffsetChanged, this)));
    },

    onTableViewOffsetChanged: function () {
        this._isRunningAnim = false;
        this._onTableViewOffsetChanged();
    },

    _onTableViewOffsetChanged: function () {
        if (this._isRunningAnim) {
            return;
        }
        var offsetX = Math.round(this._tableView.getContentOffset().x);
        var minOffsetX = Math.round(this._tableView.minContainerOffset().x);
        var maxOffsetX = Math.round(this._tableView.maxContainerOffset().x);

        if (this._tableView.getViewSize().width >= this._tableView.getContentSize().width) {
            this._leftArrowItem.visible = false;
            this._rightArrowItem.visible = false;
        } else {
            if (offsetX <= minOffsetX) {
                this._leftArrowItem.visible = true;
                this._rightArrowItem.visible = false;
            } else if (offsetX >= maxOffsetX) {
                this._leftArrowItem.visible = false;
                this._rightArrowItem.visible = true;
            } else {
                this._leftArrowItem.visible = true;
                this._rightArrowItem.visible = true;
            }
        }
    },

    tableCellTouched:function (table, cell) {
        if (this._delegate && this._delegate.tableCellTouched) {
            this._delegate.tableCellTouched(table, cell);
        }
    },

    tableCellHighlight:function(table, cell){
        if (this._delegate && this._delegate.tableCellHighlight) {
            this._delegate.tableCellHighlight(table, cell);
        }
    },

    tableCellUnhighlight:function(table, cell){
        if (this._delegate && this._delegate.tableCellUnhighlight) {
            this._delegate.tableCellUnhighlight(table, cell);
        }
    },

    tableCellWillRecycle:function(table, cell){
        if (this._delegate && this._delegate.tableCellWillRecycle) {
            this._delegate.tableCellWillRecycle(table, cell);
        }
    },

    setDelegate: function (delegate) {
        this._delegate = delegate;
    },

    getTableView: function () {
        return this._tableView;
    },

    setHorizontalOrder: function (order) {
        this._horizontalOrder = order;
    },

    getHorizontalOrder: function () {
        return this._horizontalOrder;
    },

    reloadData: function () {
        this._tableView.reloadData();
    },

    setContentOffset: function (offset, animated) {
        return this._tableView.setContentOffset(offset, animated);
    },

    getContentOffset:function () {
        return this._tableView.getContentOffset();
    },

    minContainerOffset:function () {
        return this._tableView.minContainerOffset();
    },

    maxContainerOffset:function () {
        return this._tableView.maxContainerOffset();
    },

    setDirection:function (direction) {
        this._tableView.setDirection(direction);
    },

    /**
     * determines how cell is ordered and filled in the view.
     */
    setVerticalFillOrder: function (fillOrder) {
        this._tableView.setVerticalFillOrder(fillOrder);
    },

    setContentOffsetInDuration: function (offset, dt) {
        this._tableView.setContentOffsetInDuration(offset, dt);
    },

    getLeftArrowItem: function () {
        return this._leftArrowItem;
    },

    getRightArrowItem: function () {
        return this._rightArrowItem;
    }
});

module.exports = ArrowTableView;