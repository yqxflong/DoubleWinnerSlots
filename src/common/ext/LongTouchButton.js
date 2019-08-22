/**
 * Created by qinning on 15/5/7.
 */
var Util = require("../util/Util");

var LongTouchButton = cc.Node.extend({
    _duration: 0,
    _touchBeginTime: 0,
    _normalClickCallback: null,
    _longTouchUpTimeCallback: null,
    _longTouchBeginCallback: null,
    _backgroundSpriteFileName: null,
    _backgroundSelectSpriteFileName: null,
    /**
     *
     * @param {string} backgroundSpriteFileName
     * @param {string} backgroundSelectSpriteFileName
     * @param {Function} oneClickCallback
     * @param {Function} longTouchUpTimeCallback
     * @param {Function} longTouchBeginCallback
     * @param {Number} duration
     */
    ctor: function (backgroundSpriteFileName, backgroundSelectSpriteFileName,
                    oneClickCallback, longTouchUpTimeCallback, longTouchBeginCallback, duration) {
        this._super();
        this._normalClickCallback = oneClickCallback;
        this._longTouchBeginCallback = longTouchBeginCallback;
        this._longTouchUpTimeCallback = longTouchUpTimeCallback;
        this._backgroundSpriteFileName = backgroundSpriteFileName;
        this._backgroundSelectSpriteFileName = backgroundSelectSpriteFileName;
        this._duration = duration * 1000;
        this._touchBeginTime = 0;

        this.initNormalButton();
    },

    initNormalButton: function () {
        var scale9Sprite = new cc.Scale9Sprite(this._backgroundSpriteFileName);
        var size = scale9Sprite.getContentSize();
        var item = new cc.ControlButton(new cc.LabelTTF("", "Arial", 20), scale9Sprite);
        item.setPreferredSize(size);
        item.zoomOnTouchDown = false;
        item.fontColor = cc.color.WHITE;
        item.fontName = "Verdana";
        item.setBackgroundSpriteForState(new cc.Scale9Sprite(this._backgroundSpriteFileName), cc.CONTROL_STATE_NORMAL);
        item.setBackgroundSpriteForState(new cc.Scale9Sprite(this._backgroundSelectSpriteFileName), cc.CONTROL_STATE_HIGHLIGHTED);
        this.addChild(item);
        item.addTargetWithActionForControlEvents(this, this.normalButtonClicked, cc.CONTROL_EVENT_TOUCH_UP_INSIDE);
        item.addTargetWithActionForControlEvents(this, this.normalButtonClicked, cc.CONTROL_EVENT_TOUCH_DOWN);

        this.setContentSize(size);
        item.x = size.width / 2;
        item.y = size.height / 2;
    },

    normalButtonClicked: function (sender, controlEvent) {
        if(controlEvent == cc.CONTROL_EVENT_TOUCH_DOWN) {
            this._touchBeginTime = Util.getCurrentTime();
            if(this._longTouchBeginCallback) {
                this._longTouchBeginCallback(this);
            }
            this.scheduleOnce(this.timeUpCallback, this._duration/1000);
        } else if(controlEvent == cc.CONTROL_EVENT_TOUCH_UP_INSIDE) {
            this.unschedule(this.timeUpCallback);
            if((Util.getCurrentTime() - this._touchBeginTime) >= this._duration) {
                //begin long touch
            } else {
                if(this._normalClickCallback) {
                    this._normalClickCallback(this);
                }
            }
        }
    },

    timeUpCallback: function () {
        if (this._longTouchUpTimeCallback) {
            this._longTouchUpTimeCallback(this);
        }
    }
});

module.exports = LongTouchButton;