# angular-drupal

An Angular module for Drupal RESTful Services.

# Setup and Configuration

As usual, be sure to include the `angular-drupal.js` file in your app. This
typically is included via the index.html file somewhere after you include the
`angular.js` file:

```
<script src="angular-drupal.js"></script>
```

The `angular-drupal` module comes with a Service called `drupal`. You can
include this service throughout your app using Angular's dependency injection
mechanism.

Here's a simple app that injects the `drupal` service into the app's `run`
function. Then when the app runs it makes a call to the Drupal server and
logs the user in with the provided credentials:

```
angular.module('myApp', ['angular-drupal']).run(['drupal', function(drupal) {

  drupal.user_login('bob', 'secret').then(function(data) {
    if (data.user.uid) {
      alert('Hello ' + data.user.name + '!');
    }
  });

}]);

angular.module('angular-drupal').config(function($provide) {

  $provide.value('drupalSettings', {
    sitePath: 'http://my-drupal-site.com',
    endpoint: 'my-services-endpoint'
  });

});
```

Notice how we use the `config` function on the `angular-drupal` module to
provide the URL to our Drupal site, as well as the machine name of the Services
endpoint. Without this, the module won't know how to connect to our Drupal site.

# Usage

## CONNECT
```
drupal.connect().then(function(data) {
  if (data.user.uid) { alert('Hello ' + data.user.name + '!'); }
  else { alert('Please login.');  }
});
```

## USER LOGIN
```
drupal.user_login('bob', 'secret').then(function(data) {
  if (data.user.uid) {
    alert('Hello ' + data.user.name + '!');
  }
});
```

## USER LOGOUT
```
drupal.user_logout().then(function(data) {
  if (!data.user.uid) {
    alert('Logged out!');
  }
});
```

## X-CSRF-Token
The `angular-drupal` module automatically takes care of the `X-CSRF-Token` when
it is needed during REST calls. If you need to manually retrieve the token it
can easily be retrieved:
```
drupal.token().then(function(token) {
  console.log('Got the token: ' + token);
});
```

