define([
    'brix',
    'places/ProfilePlace',
    'module/profile/ProfileModule',
    'places/SettingsPlace',
    'module/settings/SettingsModule'
], function (Brix, ProfilePlace, ProfileModule, SettingsPlace, SettingsModule) {

    /**
     * This is delegate manager.
     * Is starts specific manager for new place.
     * In other words, different activity managers can be started inside one region.
     */
    return Brix.DelegateManager.extend({
        mapper: function (newPlace) {
            if (newPlace instanceof ProfilePlace) {
                return new ProfileModule()
            }
            if (newPlace instanceof SettingsPlace) {
                return new SettingsModule()
            }
            return null;
        }
    })

});