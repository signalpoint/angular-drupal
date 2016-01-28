# angular-drupal

An Angular JS module for Drupal 7 Services.

# Intro

This Angular module makes it easy to `read/write` entity data `to/from` Drupal,
handles user authentication and registration, and makes it easy to retrieve
JSON data from Views.

Here's a very *simple* Angular app that loads `node # 123` from Drupal and then
displays the node's title (via an `alert`):

```javascript
// My simple app.
angular.module('myApp', ['angular-drupal']).run(['drupal', function(drupal) {

  drupal.node_load(123).then(function(node) {
    alert(node.title);
  });

}]);

// The angular-drupal configuration settings for my simple app.
angular.module('angular-drupal').config(function($provide) {

  $provide.value('drupalSettings', {
    sitePath: 'http://my-drupal-site.com',
    endpoint: 'api'
  });

});
```

# Installation and Setup

There are two main parts to the installation and usage of this module. First,
on your Drupal site you need to install the *Angular Drupal* module, then
install and configure the *Services* module. Finally, include the
*angular-drupal* module in your Angular JS application.

## 0. Angular Drupal Module

https://www.drupal.org/project/angular_drupal

```
drush dl angular_drupal
drush en -y angular_drupal
```

## 1. Drupal Services Module Setup

By enabling the `angular_drupal` module, that will enable the `services` module by default:

- https://www.drupal.org/project/services

Then just enable the `rest_server` sub module that comes with `services`:

```
drush en -y rest_server
```

Then create a new endpoint by going to `admin/structure/services/add` with the following info:

```
machine name: api
server: REST
path: api
debug: unchecked
session authentication: checked
```

Save it, then click the edit resources link and check the box next to each resource that should be available to your app:

```
comment
file
node
system
taxonomy_term
taxonomy_vocabulary
user
```

Then click *Save*. After that, click the *Server* tab and make sure the following boxes are checked:

```
json
application/json
application/x-www-form-urlencoded
multipart/form-data
```

Then click *Save*. After that flush all of Drupal's caches.

```
drush cc all
```

## 2. Angular JS Setup

As usual, be sure to include the `angular-drupal.js` file in your app. This
typically is included via the `index.html` file somewhere after you include the
`angular.js` file:

```html
<script src="angular-drupal.js"></script>
```

The `angular-drupal` module comes with a Service called `drupal`. You can
include this service throughout your app using Angular's dependency injection
mechanism.

The simple app, listed above, injects the `drupal` service into the app's `run`
function. Then when the app runs it loads `node # 123` from Drupal and then
alerts the node's title.

Notice how we used a `config` function on the `angular-drupal` module in the
simple app to provide the URL to our Drupal site, as well as the machine name of
the Services endpoint. Without this, the module won't know how to connect to
our Drupal site, so this must be added to our app as in the example above.

# Usage

## AUTHENTICATION

### CONNECT
```javascript
drupal.connect().then(function(data) {
  if (data.user.uid) { alert('Hello ' + data.user.name + '!'); }
  else { alert('Please login.');  }
});
```

### USER REGISTRATION
```javascript
var account = {
  name: 'bob',
  mail: 'bob@example.com',
  pass: 'secret'
};
drupal.user_register(account).then(function(data) {
    alert('Registered user # ' + data.uid);
});
```

### USER LOGIN
```javascript
drupal.user_login('bob', 'secret').then(function(data) {
  if (data.user.uid) {
    alert('Hello ' + data.user.name + '!');
  }
});
```

### USER LOGOUT
```javascript
drupal.user_logout().then(function(data) {
  if (!data.user.uid) {
    alert('Logged out!');
  }
});
```

### USER REQUEST NEW PASSWORD
```
drupal.user_request_new_password('username_or_email').then(successFn, errorFn);
```

## NODES

### CREATE
```javascript
var node = {
  type: 'article',
  title: 'Hello world',
  language: 'und',
  body: { und: [ { value: 'How are you?' }] }
};
drupal.node_save(node).then(function(data) {
    alert('Created node: ' + data.nid);
});
```

### RETRIEVE
```javascript
drupal.node_load(123).then(function(node) {
    alert('Loaded node: ' + node.title);
});
```

### UPDATE
```javascript
var node = {
  nid: 123,
  title: 'Goodbye world',
  language: 'und',
  body: {
    und: [ { value: 'I am fine, thank you.' }]
  }
};
drupal.node_save(node).then(function(data) {
    alert('Updated node: ' + data.nid);
});
```

### DELETE
```javascript
drupal.node_delete(123).then(function(data) {
    if (data[0]) {
      alert('Deleted node.');
    }
});
```

### INDEX
```javascript
var query = {
  parameters: {
    'type': 'article'
  }
};
drupal.node_index(query).then(function(nodes) {
    var msg = '';
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      msg += 'Loaded node: ' + node.title + '\n';
    }
    alert(msg);
});
```

## USERS

### CREATE
To create a new user account, the user must have the `Administer users`
permission enabled in Drupal.
```javascript
var account = {
  name: 'jane',
  mail: 'jane@example.com',
  pass: 'secret-sauce'
};
drupal.user_save(account).then(function(data) {
  alert('Created new user #' + data.uid);
});
```

### RETRIEVE
```javascript
drupal.user_load(1).then(function(account) {
    alert('Loaded user: ' + account.name);
});
```

### UPDATE
To update an existing user account, the user must have the `Change own username`
or `Administer users` permission enabled in Drupal.
```javascript
var account = {
  uid: 123,
  name: 'john'
};
drupal.user_save(account).then(function(data) {
  alert('Name changed to: ' + data.name);
});
```

### DELETE
The user must have the `Administer users` permission to delete a user account.
```javascript
drupal.user_delete(123).then(function(data) {
    if (data[0]) {
      alert('Deleted user.');
    }
});
```

### INDEX
```javascript
var query = {
  parameters: {
    'name': 'bob'
  }
};
drupal.user_index(query).then(function(users) {
    var msg = '';
    for (var i = 0; i < users.length; i++) {
      var user = users[i];
      msg += 'Loaded user: ' + user.name + '\n';
    }
    alert(msg);
});
```

## COMMENTS

### CREATE
```javascript
var comment = {
  nid: 123,
  subject: 'Hello world',
  comment_body: { und: [ { value: 'How are you?' } ] }
};
drupal.comment_save(comment).then(function(data) {
    alert('Created comment: ' + data.cid);
});
```

### RETRIEVE
```javascript
drupal.comment_load(123).then(function(comment) {        
    alert('Loaded comment: ' + comment.subject);  
});
```

### UPDATE
```javascript
var comment = {
  cid: 456,
  subject: 'Goodbye world',
  comment_body: { und: [ { value: 'I am fine, thank you.' }] }
};
drupal.comment_save(comment).then(function(data) {
    alert('Updated comment: ' + data.cid);
});
```

### DELETE
```javascript
drupal.comment_delete(123).then(function(data) {
    if (data[0]) {
      alert('Deleted comment.');
    }
});
```

### INDEX
```javascript
var query = {
  parameters: {
    'nid': 123
  }
};
drupal.comment_index(query).then(function(comments) {
    var msg = '';
    for (var i = 0; i < comments.length; i++) {
      var comment = comments[i];
      msg += 'Loaded comment: ' + comment.subject + '\n';
    }
    alert(msg);
});
```

## FILES

### CREATE
```javascript
var base_64_encoded_image = 'abc...xyz';
var file = {
  file: base_64_encoded_image,
  filename: 'my_image.jpg',
  filepath: 'public://my_image.jpg'
};
drupal.file_save(file).then(function(data) {
    alert('Saved file # ' + data.fid);
});
```

### RETRIEVE
To load a file the user must have the `Get any binary files ` permission in
Drupal.
```javascript
drupal.file_load(123).then(function(file) {
    alert('Loaded file: ' + file.filename);
});
```

## TAXONOMY TERMS

### CREATE
```javascript
// @see https://api.drupal.org/api/drupal/includes!common.inc/constant/SAVED_NEW/7
var taxonomy_term = {
  vid: 1,
  name: 'Hello world'
};
drupal.taxonomy_term_save(taxonomy_term).then(function(data) {
    if (data[0] == 1) { // SAVED_NEW
      alert('Created taxonomy term.');
    }
});
```

### RETRIEVE
```javascript
drupal.taxonomy_term_load(123).then(function(term) {
    alert('Loaded term: ' + term.name);
});
```

### UPDATE
```javascript
// @see https://api.drupal.org/api/drupal/includes!common.inc/constant/SAVED_UPDATED/7
var taxonomy_term = {
  vid: 1,
  tid: 123,
  name: 'Goodbye world'
};
drupal.taxonomy_term_save(taxonomy_term).then(function(data) {
    if (data[0] == 2) { // SAVED_UPDATED
      alert('Updated taxonomy term.');
    }
});
```

### DELETE
```javascript
// @see https://api.drupal.org/api/drupal/includes!common.inc/constant/SAVED_DELETED/7
drupal.taxonomy_term_delete(123).then(function(data) {
    if (data[0] == 3) { // SAVED_DELETED
      alert('Deleted taxonomy term.');
    }
});
```

### INDEX
```javascript
var query = {
  parameters: {
    'vid': 1
  }
};
drupal.taxonomy_term_index(query).then(function(taxonomy_terms) {
    var msg = '';
    for (var i = 0; i < taxonomy_terms.length; i++) {
      var taxonomy_term = taxonomy_terms[i];
      msg += 'Loaded taxonomy term: ' + taxonomy_term.name + '\n';
    }
    alert(msg);
});
```

## TAXONOMY VOCABULARIES

### CREATE
```javascript
// @see https://api.drupal.org/api/drupal/includes!common.inc/constant/SAVED_NEW/7
var taxonomy_vocabulary = {
  name: 'Fruits',
  machine_name: 'fruits',
  description: 'Fruit is delicious.'
};
drupal.taxonomy_vocabulary_save(taxonomy_vocabulary).then(function(data) {
    if (data[0] == 1) { // SAVED_NEW
      alert('Created taxonomy vocabulary.');
    }
});
```

### RETRIEVE
```javascript
drupal.taxonomy_vocabulary_load(1).then(function(vocabulary) {
    alert('Loaded vocabulary: ' + vocabulary.name); 
});
```

### UPDATE
```javascript
// @see https://api.drupal.org/api/drupal/includes!common.inc/constant/SAVED_UPDATED/7
var taxonomy_vocabulary = {
  vid: 2,
  name: 'Colorful Fruits',
  machine_name: 'fruits',
  description: 'Colorful fruit is even more delicious.'
};
drupal.taxonomy_vocabulary_save(taxonomy_vocabulary).then(function(data) {
    if (data[0] == 2) { // SAVED_UPDATED
      alert('Updated taxonomy vocabulary.');
    }
});
```

### DELETE
```javascript
// @see https://api.drupal.org/api/drupal/includes!common.inc/constant/SAVED_DELETED/7
drupal.taxonomy_vocabulary_delete(123).then(function(data) {
    if (data[0] == 3) { // SAVED_DELETED
      alert('Deleted taxonomy vocabulary.');
    }
});
```

### INDEX
```javascript
var query = {
  parameters: {
    'name': 'tags'
  }
};
drupal.taxonomy_vocabulary_index(query).then(function(taxonomy_vocabularys) {
    var msg = '';
    for (var i = 0; i < taxonomy_vocabularys.length; i++) {
      var taxonomy_vocabulary = taxonomy_vocabularys[i];
      msg += 'Loaded taxonomy vocabulary: ' + taxonomy_vocabulary.name + '\n';
    }
    alert(msg);
});
```

## ENTITY TARGETED ACTIONS

### ATTACH FILE(S) TO NODE

Since this targeted action requires multipart/form-data Content-Type POSTs, it requires some setup in your controller. One way of approaching it is to create a FormData() object that gets passed into the function as the parameter 'data'. For example:

```javascript

$scope.sendFile = function(nid) {
  var data = {
    'files[anything1]': $scope.myFile,
    'field_values[anything1][alt]': $scope.imageAlt, // optional
    'field_values[anything1][title]': $scope.imageAlt, // optional
    field_name: 'field_images',
  };

  var fd = new FormData();
  angular.forEach(data, function(value, key) {
    fd.append(key, value);
  });

  drupal.file_attach(nid, fd)
  .catch(function(response) {
    // Some error handling.
  })
  .then(function(data) {
    console.log(data);
    // Or some other action
  });
}

```

According to comments in Services code: 'The name="files[anything]" format is required to use file_save_upload().' 

In the example above, $scope.myFile is the ng-model set on the file input element. Ng-model doesn’t natively work on inputs with type=“file”, so you must use a custom directive for the model. For example:

```javascript

.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;

            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);

```

and

```html
<input type="file" file-model="myFile"/>
```

## Views

If you install the Views JSON module, which is available as a sub module of the
Views Datasource module (https://www.drupal.org/project/views_datasource), you
can easily set up a View page display to return JSON to your app:

```javascript
var path = 'articles'; // The Drupal path to the Views JSON page display.
drupal.views_json(path).then(function(rows) {
  angular.forEach(rows, function(row, i) {
    console.log(row.title);
  });
});
```

For more information on creating Views JSON page displays, read this:

http://drupalgap.org/node/220

## X-CSRF-Token
The `angular-drupal` module automatically takes care of the `X-CSRF-Token` when
it is needed. If you need to manually get the token it can easily be retrieved:
```javascript
drupal.token().then(function(token) {
  console.log('Got the token: ' + token);
});
```

# DISCLAIMER
This module has unit test coverage to maintain quality, and welcomes comments,
criticisms and pull requests.

Thank you!
