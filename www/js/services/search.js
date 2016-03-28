var mod = angular.module('mystock.services.search', []);

mod.factory('searchService', function($q, $http) {
    
    return {
        
        search: function(query) {
            
            var deferred = $q.defer(),
            
            url = 'https://s.yimg.com/aq/autoc?query=' + query + '&region=CA&lang=en-CA&callback=YAHOO.util.ScriptNodeDataSource.callbacks';
            
            YAHOO = window.YAHOO = {
                util: {
                    ScriptNodeDataSource: {}
                }
            };
            
            YAHOO.util.ScriptNodeDataSource.callbacks = function(data) {
                // console.log(data);
                var jsonData = data.ResultSet.Result;
                deferred.resolve(jsonData);
            };
            
            $http.jsonp(url)
            .then(YAHOO.util.ScriptNodeDataSource.callbacks);
            
            return deferred.promise;
        }
    };
});
