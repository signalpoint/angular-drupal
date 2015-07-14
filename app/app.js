'use strict';

angular.module('angularDrupalApp', ['angular-drupal']).
  run(['drupal', function(drupal) {

    // Use drupal here...

  }]);

// Angular Drupal Configuration Settings
angular.module('angular-drupal').config(function($provide) {

  $provide.value('drupalSettings', {
    sitePath: 'http://localhost/drupal-7',
    endpoint: 'drupalgap'
  });

});

