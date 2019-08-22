/**
 * Created by qinning on 15/4/28.
 */
var ModalLayer = cc.LayerColor.extend({
    _touchListener: null,

    onEnter: function () {
        this._super();
        this._touchListener = cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: this.onTouchBegan.bind(this)
        }, this);
    },

    onExit: function () {
        this._super();
        if (this._touchListener) {
            cc.eventManager.removeListener(this._touchListener);
            this._touchListener = null;
        }
    },

    onTouchBegan: function (touch, event) {
        return this.isVisible() && this.isTouchInside(this, touch);
    },

    isTouchInside: function (owner, touch) {
        if (!owner || !owner.getParent()) {
            return false;
        }
        var touchLocation = touch.getLocation(); // Get the touch position
        touchLocation = owner.getParent().convertToNodeSpace(touchLocation);
        return cc.rectContainsPoint(owner.getBoundingBox(), touchLocation);
    }
});

module.exports = ModalLayer;