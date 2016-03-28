var mod = angular.module('mystock.services.news', []);

mod.factory('newsService', function($q, $http) {
    
    return {
        
        getNews: function(ticker) {
            var deferred = $q.defer(),
            
            x2js = new X2JS(),
            
            url = "http://finance.yahoo.com/rss/headline?s=" + ticker;
            
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
