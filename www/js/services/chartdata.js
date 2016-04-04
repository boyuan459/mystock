var mod = angular.module('mystock.services.chartdata', []);

/**
 * Day data object
 * Adj_Close:"105.699997"
   Close:"105.699997"
   Date:"2016-04-01"
   High:"105.790001"
   Low:"102.470001"
   Open:"102.93"
   Symbol:"NFLX"
   Volume:"14169500"
 */
mod.factory('chartDataService', function($q, $http, encodeURIService, chartDataCacheService) {
    
    var getHistoricalData = function(ticker, fromDate, toDate) {
        
        var deferred = $q.defer(),
        // cacheKey = ticker + fromDate,
        cacheKey = ticker,
        
        chartDataCache = chartDataCacheService.get(cacheKey),
        
        query = 'select * from yahoo.finance.historicaldata where symbol = "' + ticker + '" and startDate = "' + fromDate + '" and endDate = "'+ toDate + '"',
        url = 'http://query.yahooapis.com/v1/public/yql?q=' + encodeURIService.encode(query) + '&format=json&env=http://datatables.org/alltables.env';
        
        if (chartDataCache) {
            deferred.resolve(chartDataCache);
        } else {
            $http.get(url)
            .success(function(json) {
                // console.log(json);
                var jsonData = json.query.results.quote;
                
                var priceData = [],
                volumeData = [];
                
                jsonData.forEach(function(dayDataObject) {
                    var dateToMillis = dayDataObject.Date,
                    date = Date.parse(dateToMillis),
                    price = parseFloat(Math.round(dayDataObject.Close * 100) / 100).toFixed(3),
                    volume = dayDataObject.Volume,
                    
                    volumeDatum = '[' + date + ',' + volume + ']',
                    priceDatum = '[' + date + ',' + price + ']';
                    
                    // console.log(volumeDatum, priceDatum);
                    
                    volumeData.unshift(volumeDatum);
                    priceData.unshift(priceDatum);
                });
                
                var formattedChartData = 
                '[{' + 
                    '"key":' + '"volume",' +
                    '"bar":' + 'true,' +
                    '"values":' + '[' + volumeData + ']' +
                 '},' + 
                 '{' + 
                    '"key":' + '"' + ticker + '",' +
                    '"values":' + '[' + priceData + ']' +
                  '}]';
                
                deferred.resolve(formattedChartData);
                chartDataCacheService.put(cacheKey, formattedChartData);
            })
            .error(function(error) {
                console.log("Chart data error: " + error);
                deferred.reject();
            });
        }
            
        return deferred.promise;
    };
    
    return {
        getHistoricalData: getHistoricalData
    };
});
