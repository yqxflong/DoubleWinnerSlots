/**
 * Created by qinning on 15/4/28.
 */

var CCComboBox = cc.Layer.extend({
    BORDER_LEN: 5.0,
    ITEM_GAP: 3.0,

    _texts: null,
    //_bgSpr : null,
    //_itemSpr : null,
    //_itemDownSpr : null,
    //_bg : null,
    _bgSprFile: null,
    _itemSprFile: null,
    _itemSelectSprFile: null,
    _items: null,
    _hovering: false,

    itemGap: 0,
    itemColor: null,

    /**
     * function (bet, index) {}
     */
    activatedHandler: null,
    /**
     * @type {object}
     */
    activatedTarget: null,

    /**
     * @param {Array.<string>} strList
     * @param {string} bgFileName - texture file name of combobox background
     * @param {string} itemFileName - normal state texture file name of every item
     * @param {string} itemSelectFileName - selected state texture file name of every item
     * @param {number} itemGap - gap between every two items
     */
    ctor: function (strList, bgFileName, itemFileName, itemSelectFileName, itemGap) {
        this._super();
        this._texts = strList;
        this._bgSprFile = bgFileName;
        this._itemSprFile = itemFileName;
        this._itemSelectSprFile = itemSelectFileName;
        this.itemGap = itemGap || this.ITEM_GAP;
        this.itemColor = cc.color.WHITE;
        this._hovering = false;
        this.init();
    },

    init: function () {
        var itemSpr = new cc.Scale9Sprite(this._itemSprFile);
        var w = itemSpr.width + 2 * this.BORDER_LEN;
        var h = itemSpr.height * this._texts.length + 2 * this.BORDER_LEN + (this._texts.length - 1) * this.itemGap;
        this.ignoreAnchorPointForPosition(false);
        this.width = w;
        this.height = h;
        var bgSpr = new cc.Scale9Sprite(this._bgSprFile);
        bgSpr.setPreferredSize(cc.size(w, h));
        bgSpr.x = w * 0.5;
        bgSpr.y = h * 0.5;
        this.addChild(bgSpr);

        this._items = [];
        for (var i = 0; i < this._texts.length; ++i) {
            var item = new cc.ControlButton(new cc.LabelTTF(this._texts[i], "Arial", 20), new cc.Scale9Sprite(this._itemSprFile));
            item.setPreferredSize(cc.size(itemSpr.width, itemSpr.height));
            item.zoomOnTouchDown = false;
            item.fontColor = this.itemColor;
            item.fontName = "Verdana";
            this._items.push(item);
            item.setAnchorPoint(cc.p(0.5, 0));
            item.x = w * 0.5;
            item.y = this.BORDER_LEN + i * itemSpr.height + i * this.itemGap;
            item.tag = i;
            //item.setBackgroundSpriteForState(this._itemDownSpr, cc.CONTROL_STATE_HIGHLIGHTED);
            item.setBackgroundSpriteForState(new cc.Scale9Sprite(this._itemSprFile), cc.CONTROL_STATE_NORMAL);
            item.setBackgroundSpriteForState(new cc.Scale9Sprite(this._itemSelectSprFile), cc.CONTROL_STATE_HIGHLIGHTED);
            this.addChild(item);
            item.addTargetWithActionForControlEvents(this, function(sender) {
                if (this.activatedHandler != null && this.activatedTarget != null) {
                    this.activatedHandler.call(this.activatedTarget, this._texts[sender.tag], sender.tag);
                }
            }, cc.CONTROL_EVENT_TOUCH_UP_INSIDE);
        }
    }
});

module.exports = CCComboBox;