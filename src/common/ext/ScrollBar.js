/**
 * Created by qinning on 15/10/20.
 */

cc.SCROLL_BAR_HORIZONTAL = 0;
cc.SCROLL_BAR_VERTICAL = 1;

cc.ScrollBar = cc.Node.extend({
    /**
     * @type {cc.Scale9Sprite}
     */
    _progress: null,
    /**
     * @type {cc.Sprite}
     */
    _thumb: null,
    _value: 0,
    _direction: 0,
    _minPos: 0,
    _len: 0,
    _isDown: true,
    _scrollCallback: null,

    ctor: function (progressTex, thumbTex, len ,direction) {
        this._super();
        this._value = 0;
        this._direction = direction;
        this.setAnchorPoint(cc.p(0.5, 0.5));
        if (direction == cc.SCROLL_BAR_VERTICAL) {
            this.setContentSize(cc.size(thumbTex.width, len));
            this._minPos = thumbTex.height * 0.5;
            this._len = len - thumbTex.height;
        } else {
            this.setContentSize(cc.size(len, thumbTex.height));
            this._minPos = thumbTex.width * 0.5;
            this._len = len - thumbTex.width;
        }
        this._progress = new cc.Scale9Sprite(progressTex);
        this._progress.x = this.width * 0.5;
        this._progress.y = this.height * 0.5;
        if (direction == cc.SCROLL_BAR_VERTICAL) {
            this._progress.setPreferredSize(cc.size(progressTex.width, len));
        } else {
            this._progress.setPreferredSize(cc.size(len, progressTex.height));
        }
        this.addChild(this._progress);
        this._thumb = new cc.Sprite(thumbTex);
        if (direction == cc.SCROLL_BAR_VERTICAL) {
            this._thumb.x = this.width * 0.5;
        } else {
            this._thumb.y = this.height * 0.5;
        }
        this.addChild(this._thumb);
        this.setValue(0, true);
    },

    onEnter: function () {
        this._super();
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: this.onTouchBegan.bind(this),
            onTouchMoved: this.onTouchMoved.bind(this),
            onTouchEnded: this.onTouchEnded.bind(this)
        }, this);
    },

    onTouchBegan:function (touch, event) {
        if (this._isDown) {
            return true;
        }
        this._isDown = true;
        return true;
    },

    onTouchMoved:function (touch, event) {
        if (!this._isDown) {
            return;
        }
        var touchPos = this.getParent().convertToNodeSpace(touch.getLocation());
        if (this._direction == cc.SCROLL_BAR_HORIZONTAL) {
            this.setValue((touchPos.x - this._minPos) / this._len, true);
        } else {
            this.setValue((touchPos.y - this._minPos) / this._len, true);
        }
    },

    onTouchEnded:function (touch, event) {
        if (!this._isDown) {
            return false;
        }
        this._isDown = false;
        var endPos = this.getParent().convertToNodeSpace(touch.getLocation());
        if (this._direction == cc.SCROLL_BAR_HORIZONTAL) {
            this.setValue((endPos.x - this._minPos) / this._len, true);
        } else {
            this.setValue((endPos.y - this._minPos) / this._len, true);
        }
    },

    setValue: function (value, isUpdateOutSide) {
        if (value < 0) {
            value = 0;
        } else if (value > 1) {
            value = 1;
        }
        cc.log("value:" + value);
        this._value = value;
        this.updateProgress();
        if (isUpdateOutSide) {
            if (this._scrollCallback) {
                this._scrollCallback(this._value);
            }
        }
    },

    updateProgress: function () {
        if (this._direction == cc.SCROLL_BAR_VERTICAL) {
            this._thumb.y = this.height - (this._minPos + this._len * this._value);
        } else {
            this._thumb.x = this._minPos + this._len * this._value;
        }
    },

    setScrollCallback: function (scrollCallback) {
        this._scrollCallback = scrollCallback;
    }
});

module.exports = cc.ScrollBar;