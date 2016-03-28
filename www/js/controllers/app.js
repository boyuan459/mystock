var mod = angular.module('mystock.controllers.app', []);

mod.controller('AppCtrl', ['$scope', '$ionicSideMenuDelegate', 'modalService', 'userService', function($scope, $ionicSideMenuDelegate, modalService, userService) {

  $scope.user = userService;
  
  $scope.toggleLeftSideMenu = function() {
      $scope.user.getCurrentNode();
      $ionicSideMenuDelegate.toggleLeft();
  };

  $scope.modalService = modalService;
  
  $scope.logout = function() {
      userService.logout();
  };
}]);