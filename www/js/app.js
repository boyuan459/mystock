angular.module('mystock', [
    'ionic', 
    'mystock.controllers',
    'mystock.services',
    'mystock.filters',
    'mystock.directives'])

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

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

      .state('app', {
          url: '/app',
          abstract: true,
          templateUrl: 'templates/menu.html',
          controller: 'AppCtrl'
      })
      
      .state('app.mystocks', {
          url: '/mystocks',
          views: {
              'menuContent': {
                  templateUrl: 'templates/mystocks.html',
                  controller: 'MyStocksCtrl'
              }
          }
      })

      .state('app.mystock', {
          url: '/:stockTicker',
          views: {
              'menuContent': {
                  templateUrl: 'templates/mystock.html',
                  controller: 'MyStockCtrl'
              }
          }
      });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/mystocks');
});
