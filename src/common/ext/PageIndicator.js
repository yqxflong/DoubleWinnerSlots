/**
 * Created by qinning on 15/10/22.
 */

PageIndicator = cc.Node.extend({
    _normalIndicatorsArr: null,
    _highlightIndicatorsArr: null,
    _normalFile: null,
    _highlightFile: null,
    _cellWidth: null,
    _cellCount: 0,
    _curIndicatorIndex: 0,

    ctor: function (normalFile, highlightFile, cellWidth, cellCount) {
        this._super();
        this._normalIndicatorsArr = [];
        this._highlightIndicatorsArr = [];
        this._normalFile = normalFile;
        this._highlightFile = highlightFile;
        this._cellWidth = cellWidth;
        this._cellCount = cellCount;
        this._initIndicators();
    },

    _initIndicators: function () {
        for (var i = 0; i < this._cellCount; ++i) {
            var indicatorPos = this._getIndicatorPos(i);
            var normalIndicator = new cc.Sprite(this._normalFile);
            normalIndicator.setPosition(indicatorPos);
            this.addChild(normalIndicator);
            this._normalIndicatorsArr.push(normalIndicator);
            var highlightIndicator = new cc.Sprite(this._highlightFile);
            this._highlightIndicatorsArr.push(highlightIndicator);
            highlightIndicator.visible = false;
            highlightIndicator.setPosition(indicatorPos);
            this.addChild(highlightIndicator);
        }
        this._selectIndicator(this._curIndicatorIndex);
    },

    _getIndicatorPos: function (index) {
        return cc.p((index - this._cellCount / 2 + 0.5) * this._cellWidth, 0);
    },

    _selectIndicator: function (indicatorIndex, isAnim) {
        if (indicatorIndex < 0 || indicatorIndex >= this._cellCount) {
            return;
        }
        for(var i = 0; i < this._highlightIndicatorsArr.length; ++i) {
            var highlightIndicator = this._highlightIndicatorsArr[i];
            if (i == indicatorIndex) {
                highlightIndicator.visible = true;
                if (isAnim) {
                    highlightIndicator.scale = 0.6;
                    highlightIndicator.runAction(cc.scaleTo(0.3, 1.0));
                }
            } else {
                highlightIndicator.visible = false;
            }
        }
    },

    setIndicatorPercent: function (percent) {
        if (percent < 0 || percent > 1) {
            return;
        }
        var nowIndicatorIndex = Math.floor(percent * this._cellCount);
        if (nowIndicatorIndex == this._curIndicatorIndex) {
            return;
        }
        this._curIndicatorIndex = nowIndicatorIndex;
        this._selectIndicator(nowIndicatorIndex, true);
    },

    setCellCount: function (cellCount) {
        if (cellCount == this._cellCount) {
            return;
        }
        for (var i = 0; i < this._cellCount; ++i) {
            this._normalIndicatorsArr[i].removeFromParent();
            this._highlightIndicatorsArr[i].removeFromParent();
        }
        this._normalIndicatorsArr = [];
        this._highlightIndicatorsArr = [];
        this._cellCount = cellCount;
        this._initIndicators();
    }

});

module.exports = PageIndicator;