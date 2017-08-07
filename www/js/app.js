// Ionic Starter App - UberClone by IonicDevs
// Make sure to register a new apiKey from mapbox.com for the map tiles!!!

angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'starter.directives' ,'starter.filters', 'ion-affix', 'nemLogging','ui-leaflet'])
// *IMPORTANT* Change this to your own apiKey once you register on www.mapbox.com
.constant("myConfig", {
    "apiKey": 'pk.eyJ1IjoiY3B0NTAyMyIsImEiOiJjaXJ0Y3UxNGYwaXVidDFua29yd2s1Y3l1In0.slXmFwjaCjXqNhG5Bk0j1Q',
})
.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {

      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }

    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

  });
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

  $ionicConfigProvider.backButton.icon('ion-android-arrow-back');
  $ionicConfigProvider.backButton.text('');
  $ionicConfigProvider.spinner.icon('dots');
  $ionicConfigProvider.navBar.alignTitle('center');

  $stateProvider
    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })
    .state('app.map', {
      url: '/map',
      views: {
        'menuContent': {
          templateUrl: 'templates/map.html',
          controller: 'MapController'
        }
      }
    })
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/map');
});
