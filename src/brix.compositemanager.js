// Brix.CompositeManager
// -------

/**
 * @class {Brix.CompositeManager}
 * @extends {Backbone.Events}
 * @extends {Brix.Module}
 */
Brix.CompositeManager = Brix.Module.extend(
    /**
     * @lends {Brix.CompositeManager.prototype}
     */
    {
        /**
         * @constructs
         * @param {?Object} options Configuration object, that could override layoutView and regions mapping
         */
        constructor: function CompositeManager(options) {
            if (options) {
                this.layoutView = options.layoutView || this.layoutView;
                this.regions = options.regions || this.regions;
            }
            if (Underscore.isFunction(this.regions)) {
                this.regions = this.regions();
            }
            this.initialize.apply(this, arguments);
        },

        /**
         * Could be overridden by inheritors
         */
        initialize: function () {
        },


        layoutView: null,

        regions: null,

        /**
         * @param {Backbone.Events} placeChangeInitiator Observable object, that fires "place:change" events
         * @param {Marionette.Region} region
         * @param {?Brix.Place} place Place to initialize immediately
         */
        start: function (placeChangeInitiator, region, place) {
            this.stop();

            // Just to remove annoying intention from WebStorm
            var LayoutClass = this.layoutView;

            // create layout
            var layout = new LayoutClass();
            region.show(layout);
            this.layout = layout;

            // create managers
            var managers = [];
            Underscore.each(this.regions, function (ManagerClass, regionKey) {
                var manager;
                if (Underscore.isFunction(ManagerClass)) {
                    manager = new ManagerClass();
                } else {
                    manager = ManagerClass;
                }
                if (manager instanceof Brix.Activity) {
                    var activity = manager;
                    manager = new Brix.ActivityManager(function() {
                        return activity;
                    });
                } else if (!(manager instanceof Brix.Module)) {
                    throw new Error("Class should extend from Brix.Module or Brix.Activity");
                }
                manager.start(placeChangeInitiator, layout[regionKey], place);
                managers.push(manager);
            });
            this.managers = managers;
        },

        stop: function () {
            if (this.managers) {
                Underscore.each(this.managers, function (manager) {
                    manager.stop();
                });
                delete this.managers;
            }
            if (this.layout) {
                this.layout.close();
                delete this.layout;
            }
        }
    }
);