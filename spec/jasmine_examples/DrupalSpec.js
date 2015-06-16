'use strict';

describe('drupal services', function () {

    var drupal, $httpBackend;

    beforeEach(module('angular-drupal', function($provide) {
        $provide.value('drupalSettings', {
            site_path: 'http://localhost/drupal-7',
            endpoint: 'drupalgap'
        });
    }));

    beforeEach(inject(function (_$httpBackend_, _drupal_, _drupalSettings_) {
      $httpBackend = _$httpBackend_;
      drupal = _drupal_;
    }));

    // TOKEN
    it('drupal.token()', function () {
        $httpBackend.expectGET(drupal_spec_token_url(drupal)).respond(drupal_spec_token());
        drupal.token().then(function(token) {
            expect(token).toEqual(drupal_spec_token());
        });
        $httpBackend.flush();
    });

    // SYSTEM CONNECT
    it('drupal.connect() - anonymous', function () {
        $httpBackend.expectGET(drupal_spec_token_url(drupal)).respond(drupal_spec_token());
        $httpBackend.expectPOST(drupal.restPath + '/system/connect.json').respond(drupal_spec_connect_anonymous());
        drupal.connect().then(function(data) {
            expect(data.user.uid).toEqual(drupal_spec_connect_anonymous().user.uid);
        });
        $httpBackend.flush();
    });
    it('drupal.connect() - authenticated', function () {
        $httpBackend.expectGET(drupal_spec_token_url(drupal)).respond(drupal_spec_token());
        $httpBackend.expectPOST(drupal.restPath + '/system/connect.json').respond(drupal_spec_connect_authenticated());
        drupal.connect().then(function(data) {
            expect(data.user.uid).toEqual(drupal_spec_connect_authenticated().user.uid);
            expect(data.user.name).toEqual(drupal_spec_connect_authenticated().user.name);
        });
        $httpBackend.flush();
    });

    // USER LOGIN
    it('drupal.user_login()', function () {
        $httpBackend.expectPOST(drupal.restPath + '/user/login.json').respond(drupal_spec_connect_authenticated());
        $httpBackend.expectGET(drupal_spec_token_url(drupal)).respond(drupal_spec_token());
        $httpBackend.expectPOST(drupal.restPath + '/system/connect.json').respond(drupal_spec_connect_authenticated());
        drupal.user_login('bob', 'secret').then(function(data) {
            expect(data.user.uid).toEqual(drupal_spec_connect_authenticated().user.uid);
            expect(data.user.name).toEqual(drupal_spec_connect_authenticated().user.name);
        });
        $httpBackend.flush();
    });

});

/**
 *
 */
function drupal_spec_token() {
  try {
    return 'S2PwGqWxzuTQzhFeHfAIzq7AMVmnHM7W4gkaeziumvA';
  }
  catch (error) { console.log('drupal_spec_token - ' + error); }
}

/**
 *
 */
function drupal_spec_token_url(drupal) {
  try {
    return drupal.sitePath + '/?q=services/session/token';
  }
  catch (error) { console.log('drupal_spec_token_url - ' + error); }
}

/**
 *
 */
function drupal_spec_connect_anonymous() {
  try {
    return {
      user: {
        uid: 0
      }
    };
  }
  catch (error) { console.log('drupal_spec_connect_anonymous - ' + error); }
}

/**
 *
 */
function drupal_spec_connect_authenticated() {
  try {
    return {
      user: {
        uid: 1,
        name: 'dries'
      }
    };
  }
  catch (error) { console.log('drupal_spec_connect_authenticated - ' + error); }
}

