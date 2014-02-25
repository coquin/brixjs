// Brix.DelegateManager
// -------

/**
 * @private
 * @this {Brix.DelegateManager}
 */
var _delegateManagerStopCurrentManager = function () {
    if (this.currentManager) {
        // stop current manager
        this.currentManager.stop();
        // Some developers could forgot to stopListening
        this.currentManager.stopListening();
        delete this.currentManager;
    }
};

/**
 * @private
 * @param {Brix.Place} newPlace
 * @this {Brix.DelegateManager}
 */
var _delegateManagerOnPlaceChange = function (newPlace) {
    if (!newPlace) {
        _delegateManagerStopCurrentManager.call(this);
        return;
    }
    // Create new manager
    var manager = this.mapper(newPlace);
    if (!manager) {
        // manager mapper returned null, so nothing to do
        return;
    }
    if (!(manager instanceof Brix.Module)) {
        throw new Error("Class should extend from Brix.Module");
    }
    _delegateManagerStopCurrentManager.call(this);
    this.currentManager = manager;
    manager.start(this, this.region, newPlace);
};

/**
 * Something like ActivityManager, but for managers. Could be used to define logical groups of activities
 *
 * @class {Brix.DelegateManager}
 * @extends {Backbone.Events}
 * @extends {Brix.Module}
 *
 */
Brix.DelegateManager = Brix.Module.extend(
    /**
     * @lends {Brix.DelegateManager.prototype}
     */
    {
        /**
         * @param {?function(Brix.Place):Brix.ActivityManager} managerMapper
         * @constructs
         */
        constructor: function DelegateManager(managerMapper) {
            if (Underscore.isFunction(managerMapper)) {
                this.mapper = managerMapper;
            }
            this.initialize.apply(this, arguments);
        },
        /**
         * Could be overridden by inheritors
         */
        initialize: function () {
        },
        /**
         * Empty function by default, could be rewritten
         * @param {Brix.Place} newPlace
         * @return {?Brix.ActivityManager}
         */
        mapper: function (newPlace) {
            return null;
        },
        /**
         * Subscribes for place change events
         * @param {Backbone.Events} placeChangeInitiator Observable object, that fires "place:change" events
         * @param {Marionette.Region} region
         * @param {?Brix.Place} place Place to initialize immediately
         */
        start: function (placeChangeInitiator, region, place) {
            this.stop();
            this.region = region;
            this.listenTo(placeChangeInitiator, PLACE_CHANGE_EVENT, _delegateManagerOnPlaceChange);
            if (place) {
                _delegateManagerOnPlaceChange.call(this, place);
            }
        },

        /**
         * Unsubscribes from place change events
         */
        stop: function () {
            this.stopListening();
            _delegateManagerStopCurrentManager.call(this);
            if (this.region) {
                this.region.close();
                delete this.region;
            }
        }
    }
);