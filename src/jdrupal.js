/**
 * The jdrupal-ng Angular module.
 */
angular.module('jdrupal-ng', []).
  service('jdrupal', ['$http', 'jdrupalSettings', jdrupal]).
  value('jdrupalSettings', null).factory('alert', function($window) {
    return function(text) {
      $window.alert(text);
    }
  }).
  
  value('salutation', 'Hello').
  
  factory('greet', function(alert, salutation) {
    return function(name) {
      alert(salutation + ' ' + name + '!');
    }
  });

/**
 * The "jdrupal" Angular Service.
 */
function jdrupal($http, jdrupalSettings) {
  this.sitePath = jdrupalSettings.site_path
  this.restPath = this.sitePath + '/?q=' + jdrupalSettings.endpoint;
  
  // TOKEN (X-CSRF-Token)
  
  this.token = function(result) {
    return $http.get(this.sitePath + '/?q=services/session/token').success(function(token) {
        Drupal.sessid = token;
    });
  };
  
  // SYSTEM CONNECT
  
  this.system_connect = function() {
    var options = {
      method: 'POST',
      url: this.restPath + '/system/connect.json',
      headers: { }
    };
    if (!Drupal.sessid) {
      return this.token().success(function(token) {
          options.headers['X-CSRF-Token'] = token;
          return $http(options);
      });
    }
    options.headers['X-CSRF-Token'] = Drupal.sessid;
    return $http(options);
  };
  
  // USER LOGIN

  this.user_login = function(username, password) {
    
    // @TODO logging in takes 3 calls to the server (logging in, grabbing a new
    // token, then system connecting), this should be a single service resource
    // (like it used to be in the early DrupalGap days). Make it available in
    // the jDrupal Drupal module.
    
    // Hang onto the rest path, so it will be available later in the scope.
    var restPath = this.restPath;
    
    // Make the login attempt via POST without a token...
    return $http({
        method: 'POST',
        url: restPath + '/user/login.json',
        data: $.param({
            username: username,
            password: password
        }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
    }).success(function(result) {
      
      // We're logged in...
      
      // Set the user account, clear out the session id, retrieve a new CSRF
      // token and then make a system connect call.
      Drupal.user = result.user;
      Drupal.sessid = null;
      return $http.get(this.sitePath + '/?q=services/session/token').success(function(token) {
          Drupal.sessid = token;
          var options = {
            method: 'POST',
            url: restPath + '/system/connect.json',
            headers: {
              'X-CSRF-Token': Drupal.sessid
            }
          };
          return $http(options);
      });
    });
  };
  
  // USER LOGOUT

  this.user_logout = function() {
    
    var restPath = this.restPath;
    return this.token().success(function(token) {
        $http({
            method: 'POST',
            url: restPath + '/user/logout.json',
            headers: {
              'X-CSRF-Token': token
            }
        }).success(function(result) {
          // Now that we logged out, clear the sessid and call system connect.
          Drupal.user = drupal_user_defaults();
          Drupal.sessid = null;
        });
    });

  };
  
  // USER REGISTER
  
  this.user_register = function(account) {
    
    var options = {
      method: 'POST',
      url: this.restPath + '/user/register.json',
      headers: {
        'Content-Type': 'application/json'
      },
      data: { account: account }
    };
    if (!Drupal.sessid) {
      // @TODO this is returning the token instead of the user registration
      // result, learn how to use promises...?
      return $http.get(this.sitePath + '/?q=services/session/token').success(function(token) {
          Drupal.sessid = token;
          options.headers['X-CSRF-Token'] = token;
          return $http(options);
      });
    }
    options.headers['X-CSRF-Token'] = Drupal.sessid;
    return $http(options);
    
  };
  
  // USER LOAD
  
  this.user_load = function(uid) {
    return $http.get(this.restPath + '/user/' + uid + '.json');
  };
  
  // NODE LOAD
  
  this.node_load = function(nid) {
    return $http.get(this.restPath + '/node/' + nid + '.json');
  };
  
  // NODE SAVE
  
  this.node_save = function(node) {
    var method = null;
    var url = null;
    if (!node.nid) {
      method = 'POST';
      url = this.restPath + '/node.json';
    }
    else {
      method = 'PUT';
      url = this.restPath + '/node/' + node.nid + '.json';
    }
    var options = {
      method: method,
      url: url,
      headers: {
        'Content-Type': 'application/json'
      },
      data: { node: node }
    };
    if (!Drupal.sessid) {
      // @TODO this is returning the token instead of the user registration
      // result, learn how to use promises...?
      return $http.get(this.sitePath + '/?q=services/session/token').then(function(response) {
          dpm('thenning!');
          dpm(response);
          Drupal.sessid = response.data;
          options.headers['X-CSRF-Token'] = response.data;
          return $http(options);
      }).then(function(response) {
        return response.data
      });
    }
    options.headers['X-CSRF-Token'] = Drupal.sessid;
    return $http(options);
  };

}

