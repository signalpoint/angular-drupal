# angular-drupal

An Angular JS module for Drupal 8 RESTful Web Services.

## Intro

This Angular module makes it easy to `read/write` entity data `to/from` Drupal,
handles user authentication and registration, and makes it easy to retrieve
JSON data from Views.

Here's a very *simple* Angular app that loads `node # 123` from Drupal and then
displays the node's title (via an `alert`):

```
// My simple app.
angular.module('myApp', ['angular-drupal']).run(['drupal', function(drupal) {

  drupal.nodeLoad(123).then(function(node) {
    alert(node.label());
  });

}]);

// The angular-drupal configuration settings for my simple app.
angular.module('angular-drupal').config(function($provide) {

  $provide.value('drupalSettings', {
    sitePath: 'http://my-drupal-site.com'
  });

});
```

## Installation and Setup

There are two main parts to the installation and usage of this module. First,
on your Drupal site you need to install the *jDrupal* module, then
install the *REST UI* module and configure core Drupal REST services, and then include the *angular-drupal*
module and *jDrupal* in your Angular JS application.

### 0. jDrupal Module

https://www.drupal.org/project/jdrupal

```
drush dl jdrupal
drush en -y jdrupal
```

### 1. Drupal Setup

See [jDrupal docs](http://jdrupal.easystreet3.com/8/docs/Install) for details.

#### 1.1 Enable Drupal core's "RESTful Web Services" module

#### 1.2 Install the REST UI module

https://www.drupal.org/project/restui

Then go to `admin/config/services/rest` and enable your desired resources. We
recommend the following resources, http methods, authentications, and formats:

```
User - GET - json - cookie
User - POST - json - cookie
```

#### 1.3 Specify User Permissions

Go to admin/people/permissions and allow a user role(s) to access some of these
resources. We recommend the following (at minimum) for anonymous and
authenticated users:

```
Access GET on Content resource
Access GET on User resource
```

### 2. Angular JS Setup

install `jdrupal.js` and `angular-drupal.js`.  If using bower:

`bower install --save angular-drupal#8.x-1.x`

As usual, be sure to include the `jdrupal.js` and `angular-drupal.js` file in your app. This typically is included via the `index.html` file somewhere after you include the
`angular.js` file:

```
<script src="jdrupal.js"></script>
<script src="angular-drupal.js"></script>
```

The `angular-drupal` module comes with an Angular JS service called `drupal`. You can
include this service throughout your app using Angular's dependency injection
mechanism.

The simple app, listed above, injects the `drupal` service into the app's `run`
function. Then when the app runs it loads `node # 123` from Drupal and then
alerts the node's title.

Notice how we used a `config` function on the `angular-drupal` module in the
simple app to provide the URL to our Drupal site, as well as the machine name of
the Services endpoint. Without this, the module won't know how to connect to
our Drupal site, so this must be added to our app as in the example above.

## Usage

See the [jDrupal docs](http://jdrupal.easystreet3.com/) for more examples and the full documentation. To use in Angular, inject the `drupal` service into your code as usual and replace `jDrupal` with `drupal`.

### AUTHENTICATION

#### CONNECT
```
drupal.connect().then(function() {
  var user = jDrupal.currentUser();
  var msg = user.isAuthenticated() ?
    'Hello ' + user.getAccountName() : 'Hello Anonymous User';
  alert(msg);
});
```

### VIEWS

First, set up a standard REST export for your view in your Drupal 8 site.  Then, in your Angular code you can use something like this to query the view:

```
# angular-drupal

An Angular JS module for Drupal 8 RESTful Web Services.

## Intro

This Angular module makes it easy to `read/write` entity data `to/from` Drupal,
handles user authentication and registration, and makes it easy to retrieve
JSON data from Views.

Here's a very *simple* Angular app that loads `node # 123` from Drupal and then
displays the node's title (via an `alert`):

```
// My simple app.
angular.module('myApp', ['angular-drupal']).run(['drupal', function(drupal) {

  drupal.nodeLoad(123).then(function(node) {
    alert(node.label());
  });

}]);

// The angular-drupal configuration settings for my simple app.
angular.module('angular-drupal').config(function($provide) {

  $provide.value('drupalSettings', {
    sitePath: 'http://my-drupal-site.com'
  });

});
```

## Installation and Setup

There are two main parts to the installation and usage of this module. First,
on your Drupal site you need to install the *jDrupal* module, then
install the *REST UI* module and configure core Drupal REST services, and then include the *angular-drupal*
module and *jDrupal* in your Angular JS application.

### 0. jDrupal Module

https://www.drupal.org/project/jdrupal

```
drush dl jdrupal
drush en -y jdrupal
```

### 1. Drupal Setup

See [jDrupal docs](http://jdrupal.easystreet3.com/8/docs/Install) for details.

#### 1.1 Enable Drupal core's "RESTful Web Services" module

#### 1.2 Install the REST UI module

https://www.drupal.org/project/restui

Then go to `admin/config/services/rest` and enable your desired resources. We
recommend the following resources, http methods, authentications, and formats:

```
User - GET - json - cookie
User - POST - json - cookie
```

#### 1.3 Specify User Permissions

Go to admin/people/permissions and allow a user role(s) to access some of these
resources. We recommend the following (at minimum) for anonymous and
authenticated users:

```
Access GET on Content resource
Access GET on User resource
```

### 2. Angular JS Setup

install `jdrupal.js` and `angular-drupal.js`.  If using bower:

`bower install --save angular-drupal#8.x-1.x`

As usual, be sure to include the `jdrupal.js` and `angular-drupal.js` file in your app. This typically is included via the `index.html` file somewhere after you include the
`angular.js` file:

```
<script src="jdrupal.js"></script>
<script src="angular-drupal.js"></script>
```

The `angular-drupal` module comes with an Angular JS service called `drupal`. You can
include this service throughout your app using Angular's dependency injection
mechanism.

The simple app, listed above, injects the `drupal` service into the app's `run`
function. Then when the app runs it loads `node # 123` from Drupal and then
alerts the node's title.

Notice how we used a `config` function on the `angular-drupal` module in the
simple app to provide the URL to our Drupal site, as well as the machine name of
the Services endpoint. Without this, the module won't know how to connect to
our Drupal site, so this must be added to our app as in the example above.

## Usage

See the [jDrupal docs](http://jdrupal.easystreet3.com/) for more examples and the full documentation. To use in Angular, inject the `drupal` service into your code as usual and replace `jDrupal` with `drupal`.

### AUTHENTICATION

#### CONNECT
```
drupal.connect().then(function() {
  var user = jDrupal.currentUser();
  var msg = user.isAuthenticated() ?
    'Hello ' + user.getAccountName() : 'Hello Anonymous User';
  alert(msg);
});
```

### VIEWS

First, set up a standard REST export for your view in your Drupal 8 site.  Then, in your Angular code you can use something like this to query the view:

```
var path = '/api/routes?rating_yds=5.2'; // The Drupal path to the Views JSON page display.
drupal.viewsLoad(path).then(function(view) {
  var results = view.getResults();
  angular.forEach(results, function(row, i) {
    // Do something with with the result item
    console.log(row);
  });
});
```
