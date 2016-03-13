/**
 * The angular-drupal module.
 */
angular.module('angular-drupal', [])

/**
 * The $drupal service for the angular-drupal module.
 * 
 * @param object drupalSettings
 *   Various settings.  Change these in app.js.
 */
.factory('$drupal', ['drupalSettings', '$q', function(drupalSettings, $q) {
  // jDrupal is initialized globally in jdrupal.js
  jDrupal.config('sitePath', drupalSettings.sitePath);
  
  // Swap promise functions with Angular versions
  jDrupal.Entity.prototype._load = jDrupal.Entity.prototype.load;
  jDrupal.Entity.prototype.load = function() {
    return $q.when(this._load());
  };
  
  jDrupal.Views.prototype._getView = jDrupal.Views.prototype.getView;
  jDrupal.Views.prototype.getView = function() {
    return $q.when(this._getView());
  }
  
  jDrupal._viewsLoad = jDrupal.viewsLoad;
  jDrupal.viewsLoad = function(path) {
    return $q.when(this._viewsLoad(path));
  }
  
  return jDrupal;
}]);
