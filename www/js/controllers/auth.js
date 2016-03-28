var mod = angular.module('mystock.controllers.auth', []);

mod.controller('LoginSignupCtrl', ['$scope', '$timeout', '$window', 'modalService', 'userService', function($scope, $timeout, $window, modalService, userService) {
    $scope.loggingIn = false;
    
    $scope.user = {email: '', password: ''};
    
    $scope.closeModal = function() {
        modalService.closeModal();
    };
    
    $scope.signup = function(user) {
        userService.signup(user);
    };
    
    $scope.login = function(user) {
        userService.login(user);
    };
    
    $scope.loginWithFacebook = function() {
        if (!$scope.loggingIn) {
            $scope.loggingIn = true;
            userService.loginWithFacebook().then(function(data) {
                $scope.loggingIn = false;
                // modalService.closeModal();
                console.log(data);
                $timeout(function() {
                    $window.location.reload(true);
                }, 400);
                                                
            });
        }
    };
}]);
