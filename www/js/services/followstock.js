var mod = angular.module('mystock.services.followstock', []);

mod.factory('followStockService', function(myStocksArrayService, myStocksCacheService, userService) {
    
    return {
        
        follow: function(ticker) {
            
            var stockToAdd = {"ticker": ticker};
            
            myStocksArrayService.push(stockToAdd);
            
            myStocksCacheService.put('myStocks', myStocksArrayService);
            
            if (userService.getUser()) {
                userService.updateStocks(myStocksArrayService);
            }
        },
        
        unfollow: function(ticker) {
            
            for(var i=0;i<myStocksArrayService.length;i++) {
                if (myStocksArrayService[i].ticker == ticker) {
                    myStocksArrayService.splice(i, 1);
                    myStocksCacheService.remove('myStocks');
                    myStocksCacheService.put('myStocks', myStocksArrayService);
                    
                    if (userService.getUser()) {
                        userService.updateStocks(myStocksArrayService);
                    }
            
                    break;
                }
            }
            
        }, 
        
        checkFollowing: function(ticker) {
            
            for(var i=0;i<myStocksArrayService.length;i++) {
                if (myStocksArrayService[i].ticker == ticker) {
                    return true;
                }
            }
            
            return false;
        }
    }
});
