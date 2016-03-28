var mod = angular.module('mystock.services.mystocksarray', []);

mod.factory('myStocksArrayService', function(fillMyStocksCacheService, myStocksCacheService) {
    
    if (!myStocksCacheService.info('myStocks')) {
        fillMyStocksCacheService.fillMyStocksCache();
    }
    var myStocks = myStocksCacheService.get('myStocks');
    
    return myStocks;
});
