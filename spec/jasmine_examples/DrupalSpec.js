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
    // @TODO add a separate test that retrieves the token locally, if possible.
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

    // USER LOGOUT
    it('drupal.user_logout()', function () {
        $httpBackend.expectGET(drupal_spec_token_url(drupal)).respond(drupal_spec_token());
        $httpBackend.expectPOST(drupal.restPath + '/user/logout.json').respond(drupal_spec_connect_anonymous());
        $httpBackend.expectGET(drupal_spec_token_url(drupal)).respond(drupal_spec_token());
        $httpBackend.expectPOST(drupal.restPath + '/system/connect.json').respond(drupal_spec_connect_anonymous());
        drupal.user_logout().then(function(data) {
            expect(data.user.uid).toEqual(drupal_spec_connect_anonymous().user.uid);
        });
        $httpBackend.flush();
    });
    
    // ENTITY LOAD FUNCTIONS
    
    // COMMENT LOAD
    it('drupal.comment_load()', function () {
        $httpBackend.expectGET(drupal.restPath + '/comment/123.json').respond(drupal_spec_entity_load_response('comment'));
        drupal.comment_load(123).then(function(entity) {
            var key = drupal_entity_primary_key('comment');
            var title = drupal_entity_primary_key_title('comment');
            expect(entity[key]).toEqual(drupal_spec_entity_load_response('comment')[key]);
            expect(entity[title]).toEqual(drupal_spec_entity_load_response('comment')[title]);
        });
        $httpBackend.flush();
    });
    
    // FILE LOAD
    it('drupal.file_load()', function () {
        $httpBackend.expectGET(drupal.restPath + '/file/123.json').respond(drupal_spec_entity_load_response('file'));
        drupal.file_load(123).then(function(entity) {
            var key = drupal_entity_primary_key('file');
            var title = drupal_entity_primary_key_title('file');
            expect(entity[key]).toEqual(drupal_spec_entity_load_response('file')[key]);
            expect(entity[title]).toEqual(drupal_spec_entity_load_response('file')[title]);
        });
        $httpBackend.flush();
    });
    
    // NODE LOAD
    it('drupal.node_load()', function () {
        $httpBackend.expectGET(drupal.restPath + '/node/123.json').respond(drupal_spec_entity_load_response('node'));
        drupal.node_load(123).then(function(entity) {
            var key = drupal_entity_primary_key('node');
            var title = drupal_entity_primary_key_title('node');
            expect(entity[key]).toEqual(drupal_spec_entity_load_response('node')[key]);
            expect(entity[title]).toEqual(drupal_spec_entity_load_response('node')[title]);
        });
        $httpBackend.flush();
    });
    
    // TAXONOMY TERM LOAD
    it('drupal.taxonomy_term_load()', function () {
        $httpBackend.expectGET(drupal.restPath + '/taxonomy_term/123.json').respond(drupal_spec_entity_load_response('taxonomy_term'));
        drupal.taxonomy_term_load(123).then(function(entity) {
            var key = drupal_entity_primary_key('taxonomy_term');
            var title = drupal_entity_primary_key_title('taxonomy_term');
            expect(entity[key]).toEqual(drupal_spec_entity_load_response('taxonomy_term')[key]);
            expect(entity[title]).toEqual(drupal_spec_entity_load_response('taxonomy_term')[title]);
        });
        $httpBackend.flush();
    });
    
    // TAXONOMY VOCABULARY LOAD
    it('drupal.taxonomy_vocabulary_load()', function () {
        $httpBackend.expectGET(drupal.restPath + '/taxonomy_vocabulary/123.json').respond(drupal_spec_entity_load_response('taxonomy_vocabulary'));
        drupal.taxonomy_vocabulary_load(123).then(function(entity) {
            var key = drupal_entity_primary_key('taxonomy_vocabulary');
            var title = drupal_entity_primary_key_title('taxonomy_vocabulary');
            expect(entity[key]).toEqual(drupal_spec_entity_load_response('taxonomy_vocabulary')[key]);
            expect(entity[title]).toEqual(drupal_spec_entity_load_response('taxonomy_vocabulary')[title]);
        });
        $httpBackend.flush();
    });
    
    // USER LOAD
    it('drupal.user_load()', function () {
        $httpBackend.expectGET(drupal.restPath + '/user/123.json').respond(drupal_spec_entity_load_response('user'));
        drupal.user_load(123).then(function(entity) {
            var key = drupal_entity_primary_key('user');
            var title = drupal_entity_primary_key_title('user');
            expect(entity[key]).toEqual(drupal_spec_entity_load_response('user')[key]);
            expect(entity[title]).toEqual(drupal_spec_entity_load_response('user')[title]);
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


/**
 *
 */
function drupal_spec_entity_load_response(entity_type) {
  try {
    var entity = {};
    entity[drupal_entity_primary_key(entity_type)] = 123;
    entity[drupal_entity_primary_key_title(entity_type)] = 'Hello world';
    return entity;
  }
  catch (error) { console.log('drupal_spec_entity_load_response - ' + error); }
}

