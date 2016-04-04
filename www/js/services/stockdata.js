var mod = angular.module('mystock.services.stockdata', []);

mod.factory('stockDataService', function($q, $http, encodeURIService, stockDetailsCacheService, stockPriceCacheService) {
    
    var getDetailsData = function(ticker) {
        //http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20IN%20(%22YHOO%22)&format=json&env=http://datatables.org/alltables.env 
        /*
        {
            "query": {
                "count": 1,
                "created": "2016-03-28T11:23:33Z",
                "lang": "en-US",
                "results": {
                    "quote": {
                        "symbol": "YHOO",
                        "Ask": "34.96",
                        "AverageDailyVolume": "16970400",
                        "Bid": "34.81",
                        "AskRealtime": null,
                        "BidRealtime": null,
                        "BookValue": "30.78",
                        "Change_PercentChange": "+0.06 - +0.17%",
                        "Change": "+0.06",
                        "Commission": null,
                        "Currency": "USD",
                        "ChangeRealtime": null,
                        "AfterHoursChangeRealtime": null,
                        "DividendShare": null,
                        "LastTradeDate": "3/24/2016",
                        "TradeDate": null,
                        "EarningsShare": "-4.64",
                        "ErrorIndicationreturnedforsymbolchangedinvalid": null,
                        "EPSEstimateCurrentYear": "0.53",
                        "EPSEstimateNextYear": "0.60",
                        "EPSEstimateNextQuarter": "0.12",
                        "DaysLow": "33.93",
                        "DaysHigh": "34.87",
                        "YearLow": "26.15",
                        "YearHigh": "46.17",
                        "HoldingsGainPercent": null,
                        "AnnualizedGain": null,
                        "HoldingsGain": null,
                        "HoldingsGainPercentRealtime": null,
                        "HoldingsGainRealtime": null,
                        "MoreInfo": null,
                        "OrderBookRealtime": null,
                        "MarketCapitalization": "32.89B",
                        "MarketCapRealtime": null,
                        "EBITDA": "474.68M",
                        "ChangeFromYearLow": "8.71",
                        "PercentChangeFromYearLow": "+33.31%",
                        "LastTradeRealtimeWithTime": null,
                        "ChangePercentRealtime": null,
                        "ChangeFromYearHigh": "-11.31",
                        "PercebtChangeFromYearHigh": "-24.50%",
                        "LastTradeWithTime": "4:00pm - <b>34.86</b>",
                        "LastTradePriceOnly": "34.86",
                        "HighLimit": null,
                        "LowLimit": null,
                        "DaysRange": "33.93 - 34.87",
                        "DaysRangeRealtime": null,
                        "FiftydayMovingAverage": "31.65",
                        "TwoHundreddayMovingAverage": "31.99",
                        "ChangeFromTwoHundreddayMovingAverage": "2.87",
                        "PercentChangeFromTwoHundreddayMovingAverage": "+8.96%",
                        "ChangeFromFiftydayMovingAverage": "3.21",
                        "PercentChangeFromFiftydayMovingAverage": "+10.15%",
                        "Name": "Yahoo! Inc.",
                        "Notes": null,
                        "Open": "34.45",
                        "PreviousClose": "34.80",
                        "PricePaid": null,
                        "ChangeinPercent": "+0.17%",
                        "PriceSales": "6.61",
                        "PriceBook": "1.13",
                        "ExDividendDate": null,
                        "PERatio": null,
                        "DividendPayDate": null,
                        "PERatioRealtime": null,
                        "PEGRatio": "-14.17",
                        "PriceEPSEstimateCurrentYear": "65.77",
                        "PriceEPSEstimateNextYear": "58.10",
                        "Symbol": "YHOO",
                        "SharesOwned": null,
                        "ShortRatio": "3.20",
                        "LastTradeTime": "4:00pm",
                        "TickerTrend": null,
                        "OneyrTargetPrice": "37.88",
                        "Volume": "14118615",
                        "HoldingsValue": null,
                        "HoldingsValueRealtime": null,
                        "YearRange": "26.15 - 46.17",
                        "DaysValueChange": null,
                        "DaysValueChangeRealtime": null,
                        "StockExchange": "NMS",
                        "DividendYield": null,
                        "PercentChange": "+0.17%"
                    }
                }
            }
        }
        */
        var deferred = $q.defer(),
        cacheKey = ticker,
        stockDetailsCache = stockDetailsCacheService.get(cacheKey),
        
        query = 'select * from yahoo.finance.quotes where symbol IN ("' + ticker + '")',
        url = 'https://query.yahooapis.com/v1/public/yql?q=' + encodeURIService.encode(query) + '&format=json&env=http://datatables.org/alltables.env';
        // console.log(url);
        if (stockDetailsCache) {
            deferred.resolve(stockDetailsCache);
        } else {
            $http.get(url)
            .success(function(json) {
                // console.log(json);
                var jsonData = json.query.results.quote;
                deferred.resolve(jsonData);
                stockDetailsCacheService.put(cacheKey, jsonData);
            })
            .error(function(err) {
                console.log("Details data error: " + err);
                deferred.reject();
            });
        }
        
        return deferred.promise;
    };
    
    var getPriceData = function(ticker) {
        /*
        * https://finance.yahoo.com/webservice/v1/symbols/FB/quote?format=json&view=detail
        * Using https is more secure as the url and data being encrypted
        * Json result
        {
            "list": {
                "meta": {
                    "type": "resource-list",
                    "start": 0,
                    "count": 1
                },
                "resources": [
                    {
                        "resource": {
                            "classname": "Quote",
                            "fields": {
                                "change": "0.510002",
                                "chg_percent": "0.453174",
                                "day_high": "113.089996",
                                "day_low": "111.680000",
                                "issuer_name": "Facebook, Inc.",
                                "issuer_name_lang": "Facebook, Inc.",
                                "name": "Facebook, Inc.",
                                "price": "113.050003",
                                "symbol": "FB",
                                "ts": "1458849600",
                                "type": "equity",
                                "utctime": "2016-03-24T20:00:00+0000",
                                "volume": "17839719",
                                "year_high": "117.590000",
                                "year_low": "72.000000"
                            }
                        }
                    }
                ]
            }
        }
        */
        var deferred = $q.defer(),  
        cacheKey = ticker,
        priceDataCache = stockPriceCacheService.get(cacheKey),
        url = "https://finance.yahoo.com/webservice/v1/symbols/" + ticker + "/quote?format=json&view=detail";
        
        if (priceDataCache) {
            deferred.resolve(priceDataCache);
        } else {
            $http.get(url)
            .success(function(json) {
                // console.log(json);
                var jsonData = json.list.resources[0].resource.fields;
                
                deferred.resolve(jsonData);
                stockPriceCacheService.put(cacheKey, jsonData);
            })
            .error(function(err) {
                console.log("Price data error: " + err);
                deferred.reject();
            });
        }
        return deferred.promise;
    };
    
    
    return {
        getDetailsData: getDetailsData,
        getPriceData: getPriceData
    };
});
