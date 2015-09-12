/**
 * The angular-drupal module.
 */
angular.module('angular-drupal', []).
  service('drupal', ['$http', '$q', 'drupalSettings', drupal]).
  value('drupalSettings', null).
  value('drupalToken', null).
  value('drupalUser', null);

/**
 * The drupal service for the angular-drupal module.
 */
function drupal($http, $q, drupalSettings, drupalToken) {

  // GLOBALS
  var sitePath = drupalSettings.sitePath;
  var restPath = sitePath + '/?q=' + drupalSettings.endpoint;
  this.sitePath = sitePath;
  this.restPath = restPath;

  // @TODO provide a generic ENTITY CRUD layer to support non core entities.

  // TOKEN (X-CSRF-Token)
  this.token = function() {

    // @TODO depending on how deeply nested we are in "then" promises, we're
    // losing track of the drupal and drupal.Token object as each scope
    // progresses.
    if (typeof this.drupal !== 'undefined') {
      if (this.drupal.drupalToken) {
        console.log('grabbed token from "this" memory: ' + drupalToken);
        return $q(function(resolve, reject) {
          setTimeout(function() {
              resolve(this.drupal.drupalToken);
          }, 100);
        });
      }
    }
    else if (drupalToken) {
      console.log('grabbed token from memory: ' + drupalToken);
      return $q(function(resolve, reject) {
        setTimeout(function() {
            resolve(drupalToken);
        }, 100);
      });
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
  // Send dummy body, otherwise Content-Type header wont be set
  // https://goo.gl/OgAuBF
  this.connect = function() {
    var _token_fn = typeof this.token !== 'undefined' ?
      this.token : this.drupal.token;
    return _token_fn().then(function(token) {
        return $http({
          method: 'POST',
          url: restPath + '/system/connect.json',
          headers: { 'X-CSRF-Token': token },
          data: { dummy: null }
        }).then(function(result) {
          if (result.status == 200) { return result.data; }
        });
    });
  };

  // USER LOGIN
  this.user_login = function(username, password) {

    // @TODO logging in takes 3 calls to the server (logging in, grabbing a new
    // token, then system connecting), this should be a single service resource
    // (like it used to be in the early DrupalGap days). This should be
    // included with the angular_drupal drupal module (yet to be created).

    var drupal = this;
    return $http({
        method: 'POST',
        url: restPath + '/user/login.json',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        transformRequest: function(obj) {
          var str = [];
          for (var p in obj)
            str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
          return str.join('&');
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
  // Send dummy body, otherwise Content-Type header wont be set
  // https://goo.gl/OgAuBF
  this.user_logout = function() {
    var drupal = this;
    return this.token().then(function(token) {
        return $http({
            method: 'POST',
            url: restPath + '/user/logout.json',
            headers: { 'X-CSRF-Token': token },
            data: { dummy: null }
        }).then(function(result) {
          /*if (typeof drupalToken !== 'undefined') {
            drupalToken = null;
          }*/
          this.drupal.drupalUser = drupal_user_defaults();
          this.drupal.drupalToken = null;
          return drupal.connect();
        });
    });
  };

  // USER REGISTER
  this.user_register = function(account) {
    var drupal = this;
    return this.token().then(function(token) {
        return $http({
            method: 'POST',
            url: restPath + '/user/register.json',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRF-Token': token
            },
            data: { account: account }
        }).then(function(result) {
          return result.data;
          //this.drupal.drupalUser = drupal_user_defaults();
          //this.drupal.drupalToken = null;
          //return drupal.connect();
        });
    });
  };

  // ENTITY LOAD FUNCTIONS

  this.comment_load = function(cid) {
    return $http.get(this.restPath + '/comment/' + cid + '.json').then(function(result) {
        if (result.status == 200) { return result.data; }
    });
  };

  this.file_load = function(fid) {
    return $http.get(this.restPath + '/file/' + fid + '.json').then(function(result) {
        if (result.status == 200) { return result.data; }
    });
  };

  this.node_load = function(nid) {
    return $http.get(this.restPath + '/node/' + nid + '.json').then(function(result) {
        if (result.status == 200) { return result.data; }
    });
  };

  this.taxonomy_term_load = function(tid) {
    return $http.get(this.restPath + '/taxonomy_term/' + tid + '.json').then(function(result) {
        if (result.status == 200) { return result.data; }
    });
  };

  this.taxonomy_vocabulary_load = function(vid) {
    return $http.get(this.restPath + '/taxonomy_vocabulary/' + vid + '.json').then(function(result) {
        if (result.status == 200) { return result.data; }
    });
  };

  this.user_load = function(uid) {
    return $http.get(this.restPath + '/user/' + uid + '.json').then(function(result) {
        if (result.status == 200) { return result.data; }
    });
  };

  // ENTITY SAVE FUNCTIONS

  // COMMENT SAVE
  this.comment_save = function(comment) {
    var method = null;
    var url = null;
    if (!comment.cid) {
      method = 'POST';
      url = this.restPath + '/comment.json';
    }
    else {
      method = 'PUT';
      url = this.restPath + '/comment/' + comment.cid + '.json';
    }
    var options = {
      method: method,
      url: url,
      headers: { 'Content-Type': 'application/json' },
      data: comment // don't wrap comments
    };
    return this.token().then(function(token) {
        options.headers['X-CSRF-Token'] = token;
        return $http(options).then(function(result) {
            if (result.status == 200) { return result.data; }
        });
    });
  };

  // FILE SAVE
  this.file_save = function(file) {
    var options = {
      method: 'POST',
      url: this.restPath + '/file.json',
      headers: { 'Content-Type': 'application/json' },
      data: { file: file } // wrap files
    };
    return this.token().then(function(token) {
        options.headers['X-CSRF-Token'] = token;
        return $http(options).then(function(result) {
            if (result.status == 200) { return result.data; }
        });
    });
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
      headers: { 'Content-Type': 'application/json' },
      data: { node: node } // wrap nodes
    };
    return this.token().then(function(token) {
        options.headers['X-CSRF-Token'] = token;
        return $http(options).then(function(result) {
            if (result.status == 200) { return result.data; }
        });
    });
  };

  // TAXONOMY TERM SAVE
  this.taxonomy_term_save = function(taxonomy_term) {
    var method = null;
    var url = null;
    if (!taxonomy_term.tid) {
      method = 'POST';
      url = this.restPath + '/taxonomy_term.json';
    }
    else {
      method = 'PUT';
      url = this.restPath + '/taxonomy_term/' + taxonomy_term.tid + '.json';
    }
    var options = {
      method: method,
      url: url,
      headers: { 'Content-Type': 'application/json' },
      data: taxonomy_term // don't wrap taxonomy terms
    };
    return this.token().then(function(token) {
        options.headers['X-CSRF-Token'] = token;
        return $http(options).then(function(result) {
            if (result.status == 200) { return result.data; }
        });
    });
  };

  // TAXONOMY VOCABULARY SAVE
  this.taxonomy_vocabulary_save = function(taxonomy_vocabulary) {
    var method = null;
    var url = null;
    if (!taxonomy_vocabulary.vid) {
      method = 'POST';
      url = this.restPath + '/taxonomy_vocabulary.json';
    }
    else {
      method = 'PUT';
      url = this.restPath + '/taxonomy_vocabulary/' + taxonomy_vocabulary.vid + '.json';
    }
    var options = {
      method: method,
      url: url,
      headers: { 'Content-Type': 'application/json' },
      data: taxonomy_vocabulary // don't wrap taxonomy vocabularys
    };
    return this.token().then(function(token) {
        options.headers['X-CSRF-Token'] = token;
        return $http(options).then(function(result) {
            if (result.status == 200) { return result.data; }
        });
    });
  };

  // USER SAVE
  this.user_save = function(account) {
    var method = null;
    var url = null;
    if (!account.uid) {
      method = 'POST';
      url = this.restPath + '/user.json';
    }
    else {
      method = 'PUT';
      url = this.restPath + '/user/' + account.uid + '.json';
    }
    var options = {
      method: method,
      url: url,
      headers: { 'Content-Type': 'application/json' },
      data: account // don't wrap users
    };
    return this.token().then(function(token) {
        options.headers['X-CSRF-Token'] = token;
        return $http(options).then(function(result) {
            if (result.status == 200) { return result.data; }
        });
    });
  };

  // ENTITY DELETE FUNCTIONS

  // COMMENT DELETE
  this.comment_delete = function(cid) {
    var drupal = this;
    return this.token().then(function(token) {
        return $http({
            method: 'DELETE',
            url: drupal.restPath + '/comment/' + cid + '.json',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRF-Token': token
            }
        }).then(function(result) {
            if (result.status == 200) { return result.data; }
        });
    });
  };

  // NODE DELETE
  this.node_delete = function(nid) {
    var drupal = this;
    return this.token().then(function(token) {
        return $http({
            method: 'DELETE',
            url: drupal.restPath + '/node/' + nid + '.json',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRF-Token': token
            }
        }).then(function(result) {
            if (result.status == 200) { return result.data; }
        });
    });
  };

  // TAXONOMY TERM DELETE
  this.taxonomy_term_delete = function(tid) {
    var drupal = this;
    return this.token().then(function(token) {
        return $http({
            method: 'DELETE',
            url: drupal.restPath + '/taxonomy_term/' + tid + '.json',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRF-Token': token
            }
        }).then(function(result) {
            if (result.status == 200) { return result.data; }
        });
    });
  };

  // TAXONOMY VOCABULARY DELETE
  this.taxonomy_vocabulary_delete = function(vid) {
    var drupal = this;
    return this.token().then(function(token) {
        return $http({
            method: 'DELETE',
            url: drupal.restPath + '/taxonomy_vocabulary/' + vid + '.json',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRF-Token': token
            }
        }).then(function(result) {
            if (result.status == 200) { return result.data; }
        });
    });
  };

  // USER DELETE
  this.user_delete = function(uid) {
    var drupal = this;
    return this.token().then(function(token) {
        return $http({
            method: 'DELETE',
            url: drupal.restPath + '/user/' + uid + '.json',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRF-Token': token
            }
        }).then(function(result) {
            if (result.status == 200) { return result.data; }
        });
    });
  };

  // ENTITY INDEX FUNCTIONS

  // COMMENT INDEX
  this.comment_index = function(query) {
    var path = this.restPath + '/comment.json&' + drupal_entity_index_build_query_string(query);
    return $http.get(path).then(function(result) {
        if (result.status == 200) { return result.data; }
    });
  };

  // NODE INDEX
  this.node_index = function(query) {
    var path = this.restPath + '/node.json&' + drupal_entity_index_build_query_string(query);
    return $http.get(path).then(function(result) {
        if (result.status == 200) { return result.data; }
    });
  };

  // TAXONOMY TERM INDEX
  this.taxonomy_term_index = function(query) {
    var path = this.restPath + '/taxonomy_term.json&' + drupal_entity_index_build_query_string(query);
    return $http.get(path).then(function(result) {
        if (result.status == 200) { return result.data; }
    });
  };

  // TAXONOMY VOCABULARY INDEX
  this.taxonomy_vocabulary_index = function(query) {
    var path = this.restPath + '/taxonomy_vocabulary.json&' + drupal_entity_index_build_query_string(query);
    return $http.get(path).then(function(result) {
        if (result.status == 200) { return result.data; }
    });
  };

  // USER INDEX
  this.user_index = function(query) {
    var path = this.restPath + '/user.json&' + drupal_entity_index_build_query_string(query);
    return $http.get(path).then(function(result) {
        if (result.status == 200) { return result.data; }
    });
  };

  // VIEWS
  this.views_json = function(path) {
    var views_json_path = this.sitePath + '/' + path;
    return $http.get(views_json_path).then(function(result) {
      if (result.status == 200) {

        // If the "view" object is attached to the result data, then we can
        // intelligently parse the results and return an easy to use array of
        // row results to the caller.
        if (result.data.view) {
          var view = result.data.view;
          var results = [];
          angular.forEach(result.data[view.root], function(row) {
            var result = row[view.child];
            results.push(result);
          });
          return results;
        }
        // Otherwise, just return the raw data.
        return result.data;

      }
    });
  }

}

// ENTITY HELPERS

/**
 * Returns an array of entity type names.
 * @return {Array}
 */
function drupal_entity_types() {
  try {
    // @TODO we should optionally utilize entity_get_info() here (similar to
    // DrupalGap 2's connect and drupalgap.json file) and a drupal.json file
    // here. If the developer hasn't provided one, we can fall back to the
    // core entity types listed here.
    return [
      'comment',
      'file',
      'node',
      'taxonomy_term',
      'taxonomy_vocabulary',
      'user'
    ];
  }
  catch (error) { console.log('drupal_entity_types - ' + error); }
}

/**
 * Returns an entity type's primary key.
 * @param {String} entity_type
 * @return {String}
 */
function drupal_entity_primary_key(entity_type) {
  try {
    // @TODO support all entity types dynamically.
    var key = null;
    switch (entity_type) {
      case 'comment': key = 'cid'; break;
      case 'file': key = 'fid'; break;
      case 'node': key = 'nid'; break;
      case 'taxonomy_term': key = 'tid'; break;
      case 'taxonomy_vocabulary': key = 'vid'; break;
      case 'user': key = 'uid'; break;
      default:
        // Is anyone declaring the primary key for this entity type?
        var function_name = entity_type + '_primary_key';
        if (drupal_function_exists(function_name)) {
          var fn = window[function_name];
          key = fn(entity_type);
        }
        else {
          var msg = 'drupal_entity_primary_key - unsupported entity type (' +
            entity_type + ') - to add support, declare ' + function_name +
            '() and have it return the primary key column name as a string';
          console.log(msg);
        }
        break;
    }
    return key;
  }
  catch (error) { console.log('drupal_entity_primary_key - ' + error); }
}

/**
 * Returns an entity type's primary title key.
 * @param {String} entity_type
 * @return {String}
 */
function drupal_entity_primary_key_title(entity_type) {
  try {
    // @TODO support all entity types dynamically.
    var key = null;
    switch (entity_type) {
      case 'comment': key = 'subject'; break;
      case 'file': key = 'filename'; break;
      case 'node': key = 'title'; break;
      case 'taxonomy_term': key = 'name'; break;
      case 'taxonomy_vocabulary': key = 'name'; break;
      case 'user': key = 'name'; break;
      default:
        console.log(
          'drupal_entity_primary_key_title - unsupported entity type (' +
            entity_type +
          ')'
        );
        break;
    }
    return key;
  }
  catch (error) { console.log('drupal_entity_primary_key_title - ' + error); }
}

/**
 * Given a JS function name, this returns true if the function exists in the
 * scope, false otherwise.
 * @param {String} name
 * @return {Boolean}
 */
function drupal_function_exists(name) {
  try {
    return (eval('typeof ' + name) == 'function');
  }
  catch (error) {
    alert('drupal_function_exists - ' + error);
  }
}

/**
 * Builds a query string from a query object for an entity index resource.
 * @param {Object} query
 * @return {String}
 */
function drupal_entity_index_build_query_string(query) {
  try {
    var result = '';
    if (!query) { return result; }
    if (query.fields) { // array
      var fields = '';
      for (var i = 0; i < query.fields.length; i++) {
        fields += encodeURIComponent(query.fields[i]) + ',';
      }
      if (fields != '') {
        fields = 'fields=' + fields.substring(0, fields.length - 1);
        result += fields + '&';
      }
    }
    if (query.parameters) { // object
      var parameters = '';
      for (var parameter in query.parameters) {
          if (query.parameters.hasOwnProperty(parameter)) {
            var key = encodeURIComponent(parameter);
            var value = encodeURIComponent(query.parameters[parameter]);
            parameters += 'parameters[' + key + ']=' + value + '&';
          }
      }
      if (parameters != '') {
        parameters = parameters.substring(0, parameters.length - 1);
        result += parameters + '&';
      }
    }
    if (query.parameters_op) { // object
      var parameters_op = '';
      for (var parameter_op in query.parameters_op) {
          if (query.parameters_op.hasOwnProperty(parameter_op)) {
            var key = encodeURIComponent(parameter_op);
            var value = encodeURIComponent(query.parameters_op[parameter_op]);
            parameters_op += 'parameters_op[' + key + ']=' + value + '&';
          }
      }
      if (parameters_op != '') {
        parameters_op = parameters_op.substring(0, parameters_op.length - 1);
        result += parameters_op + '&';
      }
    }
    if (typeof query.page !== 'undefined') { // int
      result += 'page=' + encodeURIComponent(query.page) + '&';
    }
    if (typeof query.page_size !== 'undefined') { // int
      result += 'pagesize=' + encodeURIComponent(query.page_size) + '&';
    }
    return result.substring(0, result.length - 1);
  }
  catch (error) { console.log('entity_index_build_query_string - ' + error); }
}

/**
 * Returns a default JSON object representing an anonymous Drupal user account.
 * @return {Object}
 */
function drupal_user_defaults() {
  try {
    return {
      "uid": 0,
      "hostname": null,
      "roles": {
          "1": "anonymous user"
      },
      "cache": 0,
      "timestamp": Date.now() / 1000 | 0
    };
  }
  catch (error) { console.log('drupal_user_defaults - ' + error); }
}

