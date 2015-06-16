/**
 * The angular-drupal module.
 */
angular.module('angular-drupal', []).
  service('drupal', ['$http', 'drupalSettings', drupal]).
  value('drupalSettings', null).
  value('drupalToken', null).
  value('drupalUser', null);

/**
 * The drupal service for the angular-drupal module.
 */
function drupal($http, drupalSettings, drupalToken) {

  // GLOBALS
  var sitePath = drupalSettings.sitePath;
  var restPath = sitePath + '/?q=' + drupalSettings.endpoint;
  this.sitePath = sitePath;
  this.restPath = restPath;

  // TOKEN (X-CSRF-Token)
  this.token = function() {
    if (drupalToken) {
      //console.log('grabbed token from memory: ' + drupalToken);
      return drupalToken;
    }
    return $http.get(sitePath + '/?q=services/session/token').then(function(result) {
        if (result.status == 200) {
          drupalToken = result.data;
          //console.log('grabbed token from server: ' + drupalToken);
          return drupalToken;
        }
    });
  };

  // SYSTEM CONNECT
  this.connect = function() {
    return this.token().then(function(token) {
        return $http({
          method: 'POST',
          url: restPath + '/system/connect.json',
          headers: { 'X-CSRF-Token': token } 
        }).then(function(result) {
          if (result.status == 200) { return result.data; }
        });
    });
  };
  
  // USER LOGIN

  this.user_login = function(username, password) {

    // @TODO logging in takes 3 calls to the server (logging in, grabbing a new
    // token, then system connecting), this should be a single service resource
    // (like it used to be in the early DrupalGap days).

    // Set aside this as drupal so we can use it later.
    var drupal = this;

    return $http({
        method: 'POST',
        url: restPath + '/user/login.json',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        transformRequest: function(obj) {
          var str = [];
          for(var p in obj)
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
          return str.join("&");
        },
        data: {
          username: username,
          password: password
        }
    }).then(function(result) {
      drupal.drupalUser = result.user;
      drupal.drupalToken = null;
      return drupal.connect();
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

