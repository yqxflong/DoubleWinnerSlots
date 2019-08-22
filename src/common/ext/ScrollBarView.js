/**
 * Created by qinning on 15/10/20.
 */

var ScrollBar = require("./ScrollBar");

var BOUNCE_DURATION = 0.15;

cc.ScrollBarView = cc.Node.extend({
    _scrollView: null,
    /**
     * @type {ScrollBar}
     */
    _scrollBar: null,
    /**
     * @contructor
     * @param size
     * @param container
     * @returns {ScrollView}
     */
    ctor:function (size, container, sliderProgressTex, sliderThumbTex) {
        this._super();
        this._scrollView = new cc.ScrollView(size, container);
        this._scrollView.setDelegate(this);
        this._scrollView.setContentOffset(this._scrollView.minContainerOffset());
        this.addChild(this._scrollView);
        this._scrollBar = new ScrollBar(sliderProgressTex, sliderThumbTex, size.height, cc.SCROLL_BAR_VERTICAL);
        this._scrollBar.x = this._scrollView.width + sliderProgressTex.width * 0.5;
        this._scrollBar.y = this._scrollView.height * 0.5;
        //this._scrollBar.visible = false;
        this.addChild(this._scrollBar);

        this._scrollBar.setScrollCallback(function (progress) {
            this.onScrollChanged(progress);
        }.bind(this));
    },

    onScrollChanged: function (progress) {
        var minOffset = this._scrollView.minContainerOffset();
        var maxOffset = this._scrollView.maxContainerOffset();
        if (this._scrollView.getDirection() == cc.SCROLLVIEW_DIRECTION_VERTICAL) {
            var minY = minOffset.y;
            var maxY = maxOffset.y;
            var nowY = (maxY - minY) * progress + minY;
            this._scrollView.setContentOffset(cc.p(minOffset.x, nowY));
        } else if (this._scrollView.getDirection() == cc.SCROLLVIEW_DIRECTION_HORIZONTAL){
            var minX = minOffset.x;
            var maxX = maxOffset.x;
            var nowX = (maxX - minX) * progress + minX;
            this._scrollView.setContentOffset(cc.p(nowX, minOffset.y));
        }
    },

    _updateScrollBar: function () {
        var minOffset = this._scrollView.minContainerOffset();
        var maxOffset = this._scrollView.maxContainerOffset();
        var containerPos = this._scrollView.getContainer().getPosition();

        if (this._scrollView.getDirection() == cc.SCROLLVIEW_DIRECTION_VERTICAL) {
            var value = (containerPos.y - minOffset.y) / (maxOffset.y - minOffset.y);
            this._scrollBar.setValue(value,false);
        } else if (this._scrollView.getDirection() == cc.SCROLLVIEW_DIRECTION_HORIZONTAL){
            var value = (containerPos.x - minOffset.x) / (maxOffset.x - minOffset.x);
            this._scrollBar.setValue(value,false);
        }
    },

    scrollViewDidScroll: function () {
        this._updateScrollBar();
    },

    scrollViewDidZoom:function (view) {
    },

    setDirection:function (direction) {
        this._scrollView.setDirection(direction);
    }
});

module.exports = cc.ScrollBarView;