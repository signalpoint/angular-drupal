# angular-drupal

An Angular JS module for Drupal 8 RESTful Web Services.

## Intro

This is a WIP in wrapping an Angular service around jDrupal.  See [Merge with jDrupal?](https://github.com/easystreet3/angular-drupal/issues/23#issue-137694978).

## Installation & Setup

1. Setup the Drupal 8 site as described in the DrupalGap / jDrupal docs.
2. Add the [`jDrupal 8.x-1.x javascript`](https://github.com/easystreet3/jDrupal/tree/8.x-1.x) to the project and the respective `<script>` tag in `index.html` as described in jDrupal docs.
3. Add `angular-drupal.js` to the project and the respective `<script>` tag in `index.html`.
4. Configure `angular-drupal.js` in your project's `app.js` (see the example [`app.js`](https://github.com/kentr/angular-drupal/blob/8.x-1.x/app/app.js).).
5. Use the `$drupal` service in Angular as with other services.
