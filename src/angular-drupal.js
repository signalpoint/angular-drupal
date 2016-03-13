/**
 * The angular-drupal module.
 */
angular.module('angular-drupal', [])

/**
 * The drupal service for the angular-drupal module.
 * 
 * @param object drupalSettings
 *   Various settings.  Change these in app.js.
 */
.factory('drupal', ['drupalSettings', '$q', function(drupalSettings, $q) {
  // jDrupal is initialized globally in jdrupal.js
  jDrupal.config('sitePath', drupalSettings.sitePath);
  return jDrupal;
}]);
