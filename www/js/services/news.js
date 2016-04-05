var mod = angular.module('mystock.services.news', []);

/**
description:""
link:"http://us.rd.yahoo.com/finance/external/cnbc/rss/SIG=112d946ke/*http://www.cnbc.com/id/103521171?__source=yahoo%7cfinance%7cheadline%7cheadline%7cstory&par=yahoo&doc=103521171"
pubDate:"Tue, 05 Apr 2016 11:53:42 GMT"
title:"Early movers: DRI, WBA, TWTR, DIS, T, AGN & more"
 */
mod.factory('newsService', function($q, $http) {
    
    return {
        
        getNews: function(ticker) {
            var deferred = $q.defer(),
            
            x2js = new X2JS(),
            
            url = "https://finance.yahoo.com/rss/headline?s=" + ticker;
            
            $http.get(url)
            .success(function(xml) {
                var xmlDoc = x2js.parseXmlString(xml),
                json = x2js.xml2json(xmlDoc),
                jsonData = json.rss.channel.item;
                
                deferred.resolve(jsonData);
            })
            .error(function(error) {
                deferred.reject();
                console.log("News error: " + error);
            });
            
            return deferred.promise;
        }
    };
});
