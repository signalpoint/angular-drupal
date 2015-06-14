'use strict';

angular.module('angularDrupalApp', ['angular-drupal']).
  run(['drupal', function(drupal) {
        drupal.token().then(function(token) {
            console.log(token);
        });
  }]);

// Angular Drupal Configuration Settings
angular.module('angular-drupal').config(function($provide) {
    
    $provide.value('drupalSettings', {
        site_path: 'http://localhost/drupal-7',
        endpoint: 'drupalgap'
    });

});

