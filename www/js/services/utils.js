var mod = angular.module('mystock.services.utils', []);

mod.constant('FIREBASE_URL', 'https://istocks.firebaseio.com/')

.factory('encodeURIService', function() {
    
    return {
        encode: function(string) {
            // console.log(string);
            return encodeURIComponent(string).replace(/\"/g, "%22").replace(/\ /g, "%20").replace(/['()]/g, escape);
        }
    };
})

.factory('$localstorage', ['$window', function($window) {
  return {
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
      return JSON.parse($window.localStorage[key] || '{}');
    }
  }
}])

.factory('dateService', function($filter) {
    
    var currentDate = function() {
        var d = new Date();
        var date = $filter('date')(d, 'yyyy-MM-dd');
        return date;
    };
    
    var oneYearAgoDate = function() {
        var d = new Date(new Date().setDate(new Date().getDate() - 365));
        var date = $filter('date')(d, 'yyyy-MM-dd');
        
        return date;
    };
    
    var threeMonthAgoDate = function() {
        var d = new Date(new Date().setDate(new Date().getDate() - 91));
        var date = $filter('date')(d, 'yyyy-MM-dd');  
        
        return date; 
    };
    
    return {
        currentDate: currentDate,
        oneYearAgoDate: oneYearAgoDate,
        threeMonthAgoDate: threeMonthAgoDate
    };
})

.factory('firebaseRef', function($firebase, FIREBASE_URL) {
    
    var firebaseRef = new Firebase(FIREBASE_URL);
    
    return firebaseRef;
})

.factory('firebaseUserRef', function(firebaseRef) {
    
    var userRef = firebaseRef.child('users');
    
    return userRef;
});

