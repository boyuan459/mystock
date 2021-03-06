var mod = angular.module('mystock.controllers.search', []);

mod.controller('SearchCtrl', ['$scope', '$state', 'modalService', 'searchService', function($scope, $state, modalService, searchService) {
    
    $scope.closeModal = function() {
        modalService.closeModal();
    };
    
    $scope.search = function() {
        $scope.searchResults = '';
        startSearch($scope.searchQuery);
    };
    
    //delay the initialisation of the search function
    var startSearch = ionic.debounce(function(query) {
        searchService.search(query)
            .then(function(data) {
                $scope.searchResults = data;
            });
    }, 750);
    
    $scope.goToStock = function(ticker) {
        modalService.closeModal();
        $state.go('app.mystock', {stockTicker: ticker});
    };
}]);
