var mod = angular.module('mystock.services.cache', []);

mod.factory('chartDataCacheService', function(CacheFactory) {
    
    var chartDataCache;
    
    if (!CacheFactory.get('chartDataCache')) {
        chartDataCache = CacheFactory('chartDataCache', {
            maxAge: 60 * 60 * 8 * 1000,
            deleteOnExpire: 'aggressive',
            storageMode: 'localStorage'
        });
    } else {
        chartDataCache = CacheFactory.get('chartDataCache');
    }
    
    return chartDataCache;
})

.factory('stockDetailsCacheService', function(CacheFactory) {
    
    var stockDetailsCache;
    
    if (!CacheFactory.get('stockDetailsCache')) {
        stockDetailsCache = CacheFactory('stockDetailsCache', {
            maxAge: 60 * 60 * 8 * 1000,
            deleteOnExpire: 'aggressive',
            storageMode: 'localStorage'
        });
    } else {
        stockDetailsCache = CacheFactory.get('stockDetailsCache');
    }
    
    return stockDetailsCache;
})

.factory('stockPriceCacheService', function(CacheFactory) {
    
    var stockPriceCache;
    
    if (!CacheFactory.get('stockPriceCache')) {
        stockPriceCache = CacheFactory('stockPriceCache', {
            maxAge: 5 * 1000,   //5 seconds
            deleteOnExpire: 'aggressive',
            storageMode: 'localStorage'
        });
    } else {
        stockPriceCache = CacheFactory.get('stockPriceCache');
    }
    
    return stockPriceCache;
})

.factory('notesCacheService', function(CacheFactory) {
    
    var notesCache;
    
    if (!CacheFactory.get('notesCache')) {
        notesCache = CacheFactory('notesCache', {
            storageMode: 'localStorage'
        });
    } else {
        notesCache = CacheFactory.get('notesCache');
    }
    
    return notesCache;
})

.factory('fillMyStocksCacheService', function(CacheFactory) {
    var myStocksCache;
    
    if (!CacheFactory.get('myStocksCache')) {
        myStocksCache = CacheFactory('myStocksCache', {
            storageMode: 'localStorage'
        });
    } else {
        myStocksCache = CacheFactory.get('myStocksCache');
    }
    
    var fillMyStocksCache = function() {
        var myStocksArray = [
            {ticker: "AAPL"},
            {ticker: "FB"},
            {ticker: "NFLX"},
            {ticker: "TSLA"},
            {ticker: "BRK-A"},
            {ticker: "INTC"},
            {ticker: "MSFT"},
            {ticker: "GE"},
            {ticker: "BAC"}
        ];
        
        myStocksCache.put('myStocks', myStocksArray);
    };
    
    return {
        fillMyStocksCache: fillMyStocksCache
    };
})

.factory('myStocksCacheService', function(CacheFactory) {
    
    var myStocksCache = CacheFactory.get('myStocksCache');
    
    return myStocksCache;
})

;
