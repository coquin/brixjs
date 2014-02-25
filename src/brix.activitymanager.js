// Brix.ActivityManager
// -------

/**
 * @private
 * @this {Brix.ActivityManager}
 */
var _activityManagerStopCurrentActivity = function () {
    if (this.currentActivity) {
        // stop current activity
        this.currentActivity.stop(null);
        // Some developers could forgot to stopListening
        this.currentActivity.stopListening();
        delete this.currentActivity;
    }
};

/**
 * @private
 * @param {Brix.Place} newPlace
 * @this {Brix.ActivityManager}
 */
var _activityManagerOnPlaceChange = function (newPlace) {
    if (!newPlace) {
        _activityManagerStopCurrentActivity.call(this);
        return;
    }
    // Create new activity
    var activity = this.mapper(newPlace);
    if (!activity) {
        // activity mapper returned null, so nothing to do
        return;
    }
    if (Underscore.isBoolean(activity)) {
        // Mapper returned true - so we have to stop current activity
        _activityManagerStopCurrentActivity.call(this);
        return;
    }
    if (this.currentActivity) {
        if (this.currentActivity.stop(newPlace) === false) {
            // current activity does not want stop, let's keep it
            return;
        }
        // Some developers could forgot to stopListening
        this.currentActivity.stopListening();
    }
    this.currentActivity = activity;
    activity.start(this.region, newPlace);
};

/**
 * Manages Activity objects that should be started in response to
 * place change events ("place:change").
 *
 * @class {Brix.ActivityManager}
 * @extends {Backbone.Events}
 * @extends {Brix.Module}
 */
Brix.ActivityManager = Brix.Module.extend(
    /**
     * @lends {Brix.ActivityManager.prototype}
     */
    {
        /**
         * @param {?function(Brix.Place):Brix.Activity} activityMapper
         * @constructs
         */
        constructor: function ActivityManager(activityMapper) {
            if (Underscore.isFunction(activityMapper)) {
                this.mapper = activityMapper;
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
         * @return {?Brix.Activity}
         */
        mapper: function (newPlace) {
            return null;
        },
        /**
         * Starts manager and subscribes for place change events
         * @param {Backbone.Events} placeChangeInitiator Observable object, that fires "place:change" events
         * @param {Marionette.Region} region
         * @param {?Brix.Place} place Place to initialize immediately
         */
        start: function (placeChangeInitiator, region, place) {
            this.stop();
            this.region = region;
            this.listenTo(placeChangeInitiator, PLACE_CHANGE_EVENT, _activityManagerOnPlaceChange);
            if (place) {
                _activityManagerOnPlaceChange.call(this, place);
            }
        },

        /**
         * Unsubscribes from place change events
         */
        stop: function () {
            this.stopListening();
            _activityManagerStopCurrentActivity.call(this);
            if (this.region) {
                this.region.close();
                delete this.region;
            }
        }
    }
);
