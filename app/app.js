'use strict';

angular.module('angularDrupalApp', ['angular-drupal']).
  run(['$drupal', function($drupal) {

    // Use drupal here...
    $drupal.nodeLoad(1).then(function(node) {
      console.log(node.getTitle());
    });
  }]);

// Angular Drupal Configuration Settings
angular.module('angular-drupal').config(function($provide) {

  $provide.value('drupalSettings', {
    sitePath: 'http://example.com',
  });

});
