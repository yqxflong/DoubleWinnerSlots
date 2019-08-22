/**
 * Created by qinning on 15/10/27.
 */

var Util = require("./Util");

var UIHelper = {
    showCoinsFlyAnim: function (beginPos, endPos, coinsCount, parentNode) {
        var animCount = coinsCount;
        if(animCount > 20) {
            animCount = 20;
        }

        var moveToAnimTime1 = 0.3;
        var moveToAnimTime2 = 0.2;
        var delayTime = 0.3;
        var radius = 100;

        var batchNode = new cc.SpriteBatchNode("common/particle/coin_4.png", 1);
        parentNode.addChild(batchNode);

        for(var i = 0; i < animCount; ++i) {
            var spr = new cc.Sprite(batchNode.texture,cc.rect(0, 0, batchNode.texture.width, batchNode.texture.height));
            batchNode.addChild(spr);
            var offsetPos = UIHelper._getRandomPos(radius);
            var sprBeginPos = beginPos;
            spr.setPosition(sprBeginPos);
            spr.setVisible(false);

            var sprMidPos = cc.pMult(cc.pAdd(beginPos, endPos), 0.5);
            var sprMidStopPos = cc.pAdd(sprMidPos, cc.p(20, -150));
            sprMidStopPos = cc.pAdd(sprMidStopPos, offsetPos);

            var moveToAnim1 = cc.moveTo(moveToAnimTime1, sprMidStopPos).easing(cc.easeSineOut());
            var moveToAnim2 = cc.moveTo(moveToAnimTime2, endPos).easing(cc.easeSineIn());

            var moveSeq = cc.sequence(moveToAnim1, moveToAnim2);//.easing(cc.easeExponentialInOut());

            spr.runAction(cc.sequence(cc.delayTime(i / animCount * delayTime), cc.show(), moveSeq, cc.removeSelf()));
        }
    },

    /**
     * show coins fly animation.
     * @param {number} coinCount
     * @param {cc.p} worldBeginPos
     * @param {cc.p} worldEndPos
     * @param {cc.Node} parentNode
     */
    showCoinsFlyAnimBezier: function(coinCount, worldBeginPos, worldEndPos, parentNode) {
        var animCount = coinCount;
        if(animCount > 10) {
            animCount = 10;
        }

        var posOffset = [cc.p(-15, -10), cc.p(0, 0)];
        var bezierMoveTime = 0.5;
        var delayTime = 0.1;

        var batchNode = new cc.SpriteBatchNode("common/particle/coin_4.png", 1);
        parentNode.addChild(batchNode);

        for(var i = 0; i < animCount * posOffset.length; ++i) {
            var spr = new cc.Sprite(batchNode.texture,cc.rect(0, 0, batchNode.texture.width, batchNode.texture.height));
            batchNode.addChild(spr);
            var sprBeginPos = cc.pAdd(worldBeginPos, posOffset[i % posOffset.length]);
            var sprEndPos = cc.pAdd(worldEndPos, posOffset[i % posOffset.length]);
            spr.setPosition(sprBeginPos);
            spr.setVisible(false);
            var dt = cc.pSub(sprEndPos, sprBeginPos);

            var length = cc.pLength(dt);
            var nor = cc.pNormalize(dt);
            var nor2 = cc.p(-nor.y, nor.x);
            var cp1 = cc.pMult(dt, 0.15);
            var cp2 = cc.pMult(dt, 0.85);

            var controlP1 = cc.pAdd(cp1, cc.pMult(nor2, 0.4 * length));
            var controlP2 = cc.pSub(cp2, cc.pMult(nor2, 0.4 * length));

            var bezierConfig = [controlP1, controlP2, dt];

            var bezierTo = cc.bezierBy(bezierMoveTime, bezierConfig);

            spr.runAction(cc.sequence(cc.delayTime(i / posOffset.length * delayTime), cc.show(), bezierTo, cc.removeSelf()));
        }
    },

    /**
     *
     * @param {cc.Node} flyNode
     * @param {cc.Point} nodeEndPos
     * @param {number} flyTime
     * @param {cc.Node} parentNode
     */
    showFlyNodeAnim: function(flyNode, nodeEndPos, flyTime, parentNode) {
        parentNode.addChild(flyNode);
        flyNode.runAction(cc.sequence(cc.moveBy(flyTime * 0.3, cc.p(0, 60)), cc.moveTo(flyTime * 0.7, nodeEndPos).easing(cc.easeExponentialIn()), cc.removeSelf()));
    },

    _getRandomPos: function (radius) {
        var x = Util.randomNextInt(radius * 2) - radius;
        var y = Util.randomNextInt(radius * 2) - radius;
        return cc.p(x, y);
    }
};

module.exports = UIHelper;