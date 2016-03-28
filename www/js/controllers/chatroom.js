var mod = angular.module('mystock.controllers.chatroom', []);

mod.controller('ChatroomCtrl', ['$scope', '$rootScope', '$stateParams', '$firebaseArray', '$ionicScrollDelegate', 'firebaseRef', 'userService', function($scope, $rootScope, $stateParams, $firebaseArray, $ionicScrollDelegate, firebaseRef, userService) {
    
    $scope.user = userService;
    console.log($rootScope.currentUser);
    $scope.user.getCurrentNode();
    // $scope.user.getCurrentNode().then(function(data) {
    //     console.log(data);
    //     $scope.user.currentNode = data;
    // });
    
    
    $scope.user.current = $rootScope.currentUser.facebook || $rootScope.currentUser.password;
    $scope.user.current.userId = $rootScope.currentUser.uid;
    console.log($scope.user.current);
    
	$scope.show = {};
    $scope.ticker = $stateParams.stockTicker;
    
	$scope.data = {
		messages: [],
		message: '',
		loading: true,
		showInfo: false
	};

	$scope.loadMessages = function () {
        console.log("Loading messages for stock: ", $scope.ticker);
        
        var query = firebaseRef.child("messages")
                        .orderByChild("ticker")
                        .equalTo($scope.ticker)
                        .limitToLast(200);
        $scope.data.messages = $firebaseArray(query);
        $scope.data.messages.$loaded().then(function(data) {
            console.log("AngularFire $loaded");
            $scope.data.loading = false;
            $ionicScrollDelegate.$getByHandle('chat-page').scrollBottom(true);
        });
	};

	$scope.sendMessage = function () {
        if ($scope.data.message) {
            $scope.data.messages.$add({
                ticker: $scope.ticker,
                text: $scope.data.message,
                username: $scope.user.current.email,
                userId: $rootScope.currentUser.uid,
                profilePic: $scope.user.current.profileImageURL,
                timestamp: new Date().getTime()
            });
            $scope.data.message = '';
            $ionicScrollDelegate.$getByHandle('chat-page').scrollBottom(true);
        }
	};

	$scope.$on("$ionicView.enter", function () {
		console.log("ChatroomCtrl-Enter");
        $scope.loadMessages();
	});

	$scope.$on("$ionicView.beforeLeave", function () {
		console.log("ChatroomCtrl-Leave");
	});

}]);
