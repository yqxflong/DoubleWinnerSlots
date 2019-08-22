/**
 * Created by alanmars on 15/4/15.
 */
var numeral = require('numeral');

var Util = {
    PI_IN_DEGREE: 180,
    PI_2_IN_DEGREE: 360,
    /**
     * Usage: sprintf("%d,%s,%f",11,"abc",11.2);
     * @returns {string} the formatted string
     */
    sprintf: function () {
        var i = 0, a, f = arguments[i++], o = [], m, p, c, x, s = '';
        while (f) {
            if (m = /^[^\x25]+/.exec(f)) {
                o.push(m[0]);
            }
            else if (m = /^\x25{2}/.exec(f)) {
                o.push('%');
            }
            else if (m = /^\x25(?:(\d+)\$)?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosuxX])/.exec(f)) {
                if (((a = arguments[m[1] || i++]) == null) || (a == undefined)) {
                    throw('Too few arguments.');
                }
                if (/[^s]/.test(m[7]) && (typeof(a) != 'number')) {
                    throw('Expecting number but found ' + typeof(a));
                }
                switch (m[7]) {
                    case 'b':
                        a = a.toString(2);
                        break;
                    case 'c':
                        a = String.fromCharCode(a);
                        break;
                    case 'd':
                        a = parseInt(a);
                        break;
                    case 'e':
                        a = m[6] ? a.toExponential(m[6]) : a.toExponential();
                        break;
                    case 'f':
                        a = m[6] ? parseFloat(a).toFixed(m[6]) : parseFloat(a);
                        break;
                    case 'o':
                        a = a.toString(8);
                        break;
                    case 's':
                        a = ((a = String(a)) && m[6] ? a.substring(0, m[6]) : a);
                        break;
                    case 'u':
                        a = Math.abs(a);
                        break;
                    case 'x':
                        a = a.toString(16);
                        break;
                    case 'X':
                        a = a.toString(16).toUpperCase();
                        break;
                }
                a = (/[def]/.test(m[7]) && m[2] && a >= 0 ? '+' + a : a);
                c = m[3] ? m[3] == '0' ? '0' : m[3].charAt(1) : ' ';
                x = m[5] - String(a).length - s.length;
                p = m[5] ? str_repeat(c, x) : '';
                o.push(s + (m[4] ? a + p : p + a));
            }
            else {
                throw('Huh ?!');
            }
            f = f.substring(m[0].length);
        }
        return o.join('');
    },

    /**
     * @param {string} filePath
     * @param {function} customClass - extends from cc.Node
     * @return {node | new customClass}
     */
    loadCCSFile: function (filePath, customClass) {
        var ccsJson = ccs.load(filePath);
        var rootNode = ccsJson.node;
        if (customClass) {
            var customNode = new customClass();
            /**
             * @param {cc.Node} destNode
             * @param {cc.Node} srcNode
             */
            var memberVariableAssigner = function (destNode, srcNode) {
                var children = srcNode.getChildren();
                for (var i = 0; i < children.length; ++i) {
                    var childNode = children[i];
                    if (childNode.getName() && destNode.hasOwnProperty(childNode.getName())) {
                        destNode[childNode.getName()] = childNode;
                    }

                    if (childNode.getCallbackName() && ((typeof destNode[childNode.getCallbackName()]) === "function")) {
                        console.log(childNode.getCallbackName());
                        switch (childNode.getCallbackType()) {
                            case "Click":
                                childNode.addClickEventListener(customNode[childNode.getCallbackName()]);
                                break;
                            case "Touch":
                                childNode.addTouchEventListener(customNode[childNode.getCallbackName()], customNode);
                                break;
                            case "Event":
                                childNode.addCCSEventListener(customNode[childNode.getCallbackName()]);
                                break;
                        }
                    }
                    memberVariableAssigner(destNode, childNode);
                }
            };
            memberVariableAssigner(customNode, rootNode);

            var arrayRootChildren = rootNode.getChildren().slice();
            for (var i = 0; i < arrayRootChildren.length; ++i) {
                var childNode = arrayRootChildren[i];
                childNode.retain();
                childNode.removeFromParent(false);
                customNode.addChild(childNode);
                childNode.release();
            }
            customNode["animationManager"] = ccsJson.action;
            if (typeof customNode["onNodeLoaded"] === "function") {
                customNode["onNodeLoaded"]();
            }

            return customNode;
        } else {
            return rootNode;
        }
    },

    /**
     * Generate a random integer value which meets [0, upperValue)
     * @param {number} upperValue
     * @returns {number}
     */
    randomNextInt: function (upperValue) {
        return Math.floor(Math.random() * upperValue);
    },

    /**
     * @param {object.<*, number>} dict
     * @returns {*}
     */
    randomSelect: function (dict) {
        var result;
        var sum = 0;
        for (var val in dict) {
            sum += dict[val];
        }
        var randVal = this.randomNextInt(sum);
        for (var key in dict) {
            var prob = dict[key];
            if (randVal < prob) {
                result = key;
                break;
            }
            randVal -= prob;
        }
        return result;
    },

    shuffle: function (vec) {
        if (!vec || vec.length === 0) return;
        vec.sort(function (a, b) {
            return Math.random() < 0.5 ? -1 : 1;
        });
    },

    fixShuffle: function (vec, fixIndex, fixValue) {
        if (!vec || vec.length === 0) return;
        for (var i = 0; i < vec.length; ++i) {
            vec[i] = i;
        }
        Util.shuffle(vec);
        for (var i = 0; i < vec.length; ++i) {
            if (vec[i] == fixValue) {
                vec[i] = vec[fixIndex];
                vec[fixIndex] = fixValue;
                break;
            }
        }
    },

    /**
     * @param {string} ccbFileName
     * @param {string} controllerName
     * @param {object | cc.Node} controllerNode
     * @returns {cc.Node | null}
     */
    loadNodeFromCCB: function (ccbFileName, containerNode, controllerName, controllerNode) {
        if (!cc.isUndefined(controllerName) && !cc.isUndefined(controllerNode)) {
            cc.BuilderReader.registerController(controllerName, controllerNode);
        }
        var node = cc.BuilderReader.load(ccbFileName, containerNode);
        return node;
    },

    loadSpineAnim: function (spineFileName, skinName, animName, isLoop) {
        if(cc.isUndefined(isLoop)) isLoop = true;
        var animNode = new sp.SkeletonAnimation(spineFileName + ".json", spineFileName + ".atlas");
        animNode.setSkin(skinName);
        animNode.setAnimation(0, animName, isLoop);
        return animNode;
    },

    useMaskLayer: function (controller) {
        if(controller.maskLayer != null && !cc.isUndefined(controller.maskLayer) && controller.clipLayer != null && !cc.isUndefined(controller.clipLayer)) {
            var clipParentNode = controller.clipLayer.getParent();
            controller.clipLayer.retain();
            controller.clipLayer.removeFromParent(false);

            controller.maskLayer.removeFromParent(false);
            controller.maskLayer.visible = true;

            var clippingNode = new cc.ClippingNode(this.maskLayer);
            clippingNode.alphaThreshold = 0.5;
            clippingNode.addChild(controller.clipLayer);
            controller.clipLayer.release();

            clipParentNode.addChild(clippingNode);
        }
    },

    /**
     * get current time by millisecond
     * @returns {number}
     */
    getCurrentTime: function () {
        return Date.now();
    },

    /**
     *
     * @param {function} subType
     * @param {function} superType
     */
    inherits: function (subType, superType) {
        var subPrototype = Object.create(superType.prototype);
        subPrototype.constructor = subType;
        subType.prototype = subPrototype;
    },

    scaleNode: function (node, maxWidth, maxHeight) {
        if (node.width > maxWidth) {
            var scaleFactor = maxWidth / node.height;
            node.scaleX = scaleFactor;
        } else {
            node.scaleX = 1.0;
        }
        if (node.height > maxHeight) {
            var scaleFactor = maxHeight / node.height;
            node.scaleY = scaleFactor;
        } else {
            node.scaleY = 1.0;
        }
    },

    scaleCCLabelBMFont: function (label, maxWidth) {
        if (label.width > maxWidth) {
            var scaleFactor = maxWidth / label.width;
            label.scaleX = label.scaleY = scaleFactor;
        } else {
            label.scaleX = label.scaleY = 1.0;
        }
    },

    scaleCCLabelBMFontWithMaxScale: function (label, maxWidth, maxScale) {
        if (label.width > maxWidth) {
            var scaleFactor = maxWidth / label.width;
            label.scaleX = label.scaleY = scaleFactor * maxScale;
        } else {
            label.scaleX = label.scaleY = maxScale;
        }
    },

    arrContain: function (arr, element) {
        if (!arr) {
            return false;
        }
        for (var i = 0; i < arr.length; ++i) {
            if (arr[i] === element) {
                return true;
            }
        }
        return false;
    },

    /**
     * @param {number} num
     * @returns {string}
     */
    getCommaNum : function(num){
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },

    /**
     * @param {string} str
     * @returns {number}
     */
    unformatCommaNum: function (str) {
        return numeral().unformat(str);
    },

    formatAbbrNum: function (num) {
        return numeral(num).format("0.[00]a").toUpperCase();
    },

    formatAbbrNumWithoutComma: function (num) {
        return numeral(num).format("0a").toUpperCase();
    },

    /**
     * @param {string} fbId
     * @param {number} width
     * @param {number} height
     */
    getFacebookAvatarUrl: function (fbId, width, height) {
        return Util.sprintf("https://graph.facebook.com/v2.3/%s/picture?width=%d&height=%d&type=normal", fbId, width, height);
    },

    /**
     * Load an image with the given url
     * @param {string} url
     * @param {function} callback - function(error, texture, extra)
     * @param {*} extra
     */
    loadRemoteImg: function (url, callback, extra) {
        try {
            if (!cc.sys.isNative) {
                cc.loader.loadImg(url, {isCrossOrigin: true}, function (error, img) {
                    var texture2d = new cc.Texture2D();
                    texture2d.initWithElement(img);
                    texture2d.handleLoadedTexture();
                    callback(error, texture2d, extra);
                });
            } else {
                cc.loader.loadImg(url, {isCrossOrigin: true}, function (error, texture2d) {
                    callback(error, texture2d, extra);
                });
            }
        } catch (e) {
            callback("error", null, extra);
        }
    },


    /**
     * get split string array by splitChar,every item length can no more than maxTipsLength
     * @param msg
     * @param maxTipsLength
     * @param splitChar
     * @returns {Array}
     */
    getSplitArr: function (msg, maxTipsLength, splitChar) {
        if (!msg || msg.length == 0) {
            return [];
        }
        var msgArr = msg.split(splitChar);
        if (msgArr.length == 0) {
            return [];
        }
        var resultMsgArr = [];
        var index = 1;
        var curMsg = msgArr[0] + splitChar;
        while (index < msgArr.length) {
            if ((curMsg + splitChar + msgArr[index]).length > maxTipsLength) {
                resultMsgArr.push(curMsg.trim());
                curMsg = msgArr[index] + splitChar;
            } else {
                curMsg += msgArr[index] + splitChar;
            }
            ++index;
        }
        resultMsgArr.push(curMsg.trim());
        return resultMsgArr;
    },

    /**
     * get text no more than maxTextLen
     * @param {string} text
     * @param {int} maxTextLen
     */
    omitText: function (text, maxTextLen) {
        if (text.length > maxTextLen) {
            return text.substr(0, maxTextLen) + "...";
        }
        return text;
    },

    /**
     *
     * @param {string} url
     * @returns {Object}
     */
    loadJson: function (url) {
        if (!cc.sys.isNative) {
            return cc.loader.getRes(url);
        } else {
            if (jsb.fileUtils.isFileExist(url)) {
                return JSON.parse(jsb.fileUtils.getStringFromFile(url));
            }
        }
        return null;
    },

    getURLParameter: function (paramName) {
        var paramListArray = window.location.search.split("?");
        if (paramListArray.length >= 2) {
            var pairArray = paramListArray[1].split("&");
            for (var i = 0; i < pairArray.length; ++i) {
                var kv = pairArray[i].split("=");
                if (kv.length == 2 && kv[0] == paramName) {
                    return decodeURIComponent(kv[1]);
                }
            }
        }
        return "";
    },

    isFileExist: function (fileName) {
        if (cc.sys.isNative) {
            if (jsb.fileUtils.isFileExist(fileName)) {
                return true;
            }
        } else {
            if (cc.loader.getRes(fileName)) {
                return true;
            }
        }
        return false;
    },

    validateEmail: function (email) {
        var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
        return re.test(email);
    },

    createShortKeyGenerator: function () {
        var seed = Date.now();

        var key = seed.toString(16);
        return key;
    },

    genRandomCode: function (len) {
        var str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
        var code = '';
        for (var i = 0; i < len; i++) {
            code += str.charAt(this.randomNextInt(str.length));
        }
        return code;
    },

    createUniqueId: function () {
        return this.createShortKeyGenerator() + this.genRandomCode(10);
    },
    getTwoDigit: function (num) {
        if (num >= 0 && num <= 9) {
            return "0" + num;
        }
        return "" + num;
    }

};

module.exports = Util;
