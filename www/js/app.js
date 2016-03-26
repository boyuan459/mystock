angular.module('mystock', [
    'ionic',
    'ionic.service.core', 
    'ionic.service.analytics',
    'ngCordova',
    'firebase',
    'angular-cache',
    'angularMoment',
    'nvd3',
    'nvChart',
    'cb.x2js',
    'mystock.controllers',
    'mystock.services',
    'mystock.filters',
    'mystock.directives'])

.run(function($ionicPlatform, $ionicAnalytics) {
// .run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
        
    //ionic deploy https://github.com/ace68723/ionic-plugin-deploy fix build error
    //comment out in dev
    var deploy = new Ionic.Deploy();
    deploy.watch().then(function noop() {
        
    }, function noop() {
        
    }, function hasUpdate(hasUpdate) {
        console.log("Has Update ", hasUpdate);
        if (hasUpdate) {
            console.log("Calling ionicDeploy.update()");
            deploy.update().then(function(deployResult) {
                //deployResult will be true when successful and false otherwise
            }, function(deployUpdateError) {
                //fired if we're unable to check for updates of
                //if any errors have occured
                console.log("Ionic Deploy: Update error! ", deployUpdateError);
            }, function(deployProgress) {
                //this is a progress callback, so it will be called a lot
                //deployProgress will be an Integer representing the current
                //completion percentage.
                console.log('Ionic Deploy: Progress... ', deployProgress);
            });
        }
    });
   
    $ionicAnalytics.register();
    
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
    //   StatusBar.styleDefault();
        StatusBar.styleHex('#ffffff');
    }
  });
})

.constant('FACEBOOK_APP_ID', '456655851198096')

.config(function ($stateProvider, $urlRouterProvider, FACEBOOK_APP_ID) {
	openFB.init({appId: FACEBOOK_APP_ID});
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
      })
      
      .state('app.chatroom', {
          url: '/chatroom/:stockTicker',
          cache: false,
          views: {
              'menuContent': {
                  templateUrl: 'templates/chatroom.html',
                  controller: 'ChatroomCtrl'
              }
          }
      });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/mystocks');
});

//adb shell screencap -p | perl -pe 's/\x0D\x0A/\x0A/g' > screen1.png
