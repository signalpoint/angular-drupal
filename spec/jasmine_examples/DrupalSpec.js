'use strict';

describe('drupal services', function () {
    
    var drupal, $httpBackend;

    beforeEach(module('angular-drupal', function($provide) {
        $provide.value('drupalSettings', {
            site_path: 'http://localhost/drupal-7',
            endpoint: 'drupalgap'
        });
    }));

    beforeEach(inject(function (_$httpBackend_, _drupal_) {
      $httpBackend = _$httpBackend_;
      drupal = _drupal_;
    }));

    it('drupal.token()', function () {
        $httpBackend.expectGET(
          drupal.sitePath + '/?q=services/session/token'
        ).respond('S2PwGqWxzuTQzhFeHfAIzq7AMVmnHM7W4gkaeziumvA');
        drupal.token().then(function(token) {
            expect(token).toEqual(['S2PwGqWxzuTQzhFeHfAIzq7AMVmnHM7W4gkaeziumvA']);
        });
        $httpBackend.flush();
    });

});

