/**
 * Created by alanmars on 15/4/17.
 */
var EventPackage = cc.Class.extend({
    callback: null,
    target: null,
    listener: null,

    ctor: function (callback, target, listener) {
        this.callback = callback;
        this.target = target;
        this.listener = listener;
    }
});

var EventDispatcher = (function () {
    var instance;

    function createInstance() {
        var listenersMap = {};

        return {
            /**
             * @param {string} eventName
             * @param {function} callback
             * @param {object} target
             * @return {cc.EventListener} Return the listener. Needed in order to remove the event from the dispatcher.
             */
            addEventListener: function (eventName, callback, target) {
                var eventListener = cc.eventManager.addCustomListener(eventName, function (event) {
                    callback.call(target, event);
                });

                var shouldAdd = true;
                var eventPackages = listenersMap[eventName];
                if (cc.isUndefined(eventPackages)) {
                    eventPackages = [];
                    listenersMap[eventName] = eventPackages;
                }
                else {
                    for (var i = 0; i < eventPackages.length; ++i) {
                        var eventPackage = eventPackages[i];
                        if (eventPackage.callback === callback && eventPackage.target === target) {
                            shouldAdd = false;
                            break;
                        }
                    }
                }

                if (shouldAdd) {
                    eventPackages.push(new EventPackage(callback, target, eventListener));
                }
            },

            /**
             * @param {string} eventName
             * @param {function} callback
             * @param {object} target
             */
            removeEventListener: function (eventName, callback, target) {
                if (listenersMap[eventName]) {
                    /**
                     * @type {Array.<EventPackage>}
                     */
                    var eventPackages = listenersMap[eventName];
                    if (!cc.isUndefined(eventPackages) && eventPackages.length > 0) {
                        var newPackages = [];
                        for (var i = 0; i < eventPackages.length; ++i) {
                            /**
                             * @type {EventPackage}
                             */
                            var eventPackage = eventPackages[i];
                            if (eventPackage.callback === callback && eventPackage.target === target) {
                                cc.eventManager.removeListener(eventPackage.listener);
                            }
                            else {
                                newPackages.push(eventPackage);
                            }
                        }
                        listenersMap[eventName] = newPackages;
                    }
                }
            },

            /**
             * @param {string} eventName
             * @param {object} userData
             */
            dispatchEvent: function (eventName, userData) {
                cc.eventManager.dispatchCustomEvent(eventName, userData);
            }
        };
    }

    return {
        getInstance: function () {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };
})();

module.exports = EventDispatcher;