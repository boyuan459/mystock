var mod = angular.module('mystock.controllers.mystocks', []);

mod.controller('MyStocksCtrl', ['$scope', '$ionicLoading', '$q', 'myStocksArrayService', 'stockDataService', 'stockPriceCacheService', 'followStockService', function($scope, $ionicLoading, $q, myStocksArrayService, stockDataService, stockPriceCacheService, followStockService) {
  
    // $scope.myStocks = [
    //     {ticker: "AAPL"},
    //     {ticker: "FB"},
    //     {ticker: "NFLX"},
    //     {ticker: "TSLA"},
    //     {ticker: "BRK-A"},
    //     {ticker: "INTC"},
    //     {ticker: "MSFT"},
    //     {ticker: "GE"},
    //     {ticker: "BAC"}
    // ];
    
    $ionicLoading.show();
    
    $scope.$on("$ionicView.afterEnter", function() {      
        $scope.getMyStocksData().then(function() {
            $ionicLoading.hide();
        });
    });
    
    $scope.getMyStocksData = function() {
        var d = $q.defer();
        myStocksArrayService.forEach(function(stock) {
            
            var promise = stockDataService.getPriceData(stock.ticker);
            
            $scope.myStocksData = [];
            
            promise.then(function(data) {
                // console.log(data);
                $scope.myStocksData.push(stockPriceCacheService.get(data.symbol));
            });
        });
        d.resolve();
        // $scope.$broadcast('scroll.refreshComplete');
        return d.promise;
    };
    
    $scope.unfollowStock = function(ticker) {
        followStockService.unfollow(ticker);
        $scope.getMyStocksData();
    };
    
    $scope.refresh = function() {
        $scope.getMyStocksData().then(function() {
            $scope.$broadcast('scroll.refreshComplete');
        });
    };
    
}]);
