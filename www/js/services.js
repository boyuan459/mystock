angular.module('mystock.services', [])

.constant('FIREBASE_URL', 'https://istocks.firebaseio.com/')

.factory('encodeURIService', function() {
    
    return {
        encode: function(string) {
            // console.log(string);
            return encodeURIComponent(string).replace(/\"/g, "%22").replace(/\ /g, "%20").replace(/['()]/g, escape);
        }
    };
})

.factory('$localstorage', ['$window', function($window) {
  return {
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
      return JSON.parse($window.localStorage[key] || '{}');
    }
  }
}])

.factory('dateService', function($filter) {
    
    var currentDate = function() {
        var d = new Date();
        var date = $filter('date')(d, 'yyyy-MM-dd');
        return date;
    };
    
    var oneYearAgoDate = function() {
        var d = new Date(new Date().setDate(new Date().getDate() - 365));
        var date = $filter('date')(d, 'yyyy-MM-dd');
        
        return date;
    };
    
    var threeMonthAgoDate = function() {
        var d = new Date(new Date().setDate(new Date().getDate() - 91));
        var date = $filter('date')(d, 'yyyy-MM-dd');  
        
        return date; 
    };
    
    return {
        currentDate: currentDate,
        oneYearAgoDate: oneYearAgoDate,
        threeMonthAgoDate: threeMonthAgoDate
    };
})

.factory('firebaseRef', function($firebase, FIREBASE_URL) {
    
    var firebaseRef = new Firebase(FIREBASE_URL);
    
    return firebaseRef;
})

.factory('firebaseUserRef', function(firebaseRef) {
    
    var userRef = firebaseRef.child('users');
    
    return userRef;
})

.factory('userService', function($rootScope, $window, $timeout, $q, $ionicPopup, $firebaseAuth, $firebaseObject, $state, firebaseRef, firebaseUserRef, modalService, myStocksArrayService, notesCacheService, myStocksCacheService) {
    
    var self = {
    current: {},
    currentNode: {},
    toggleFavorite: function(ticker) {
        if (!self.currentNode.favorites) {
            self.currentNode.favorites = {};
        }
        if (self.currentNode.favorites[ticker]) {
            self.currentNode.favorites[ticker] = null;
        } else {
            self.currentNode.favorites[ticker] = ticker;
        }
        self.currentNode.$save();
    },
    
    loginWithFacebook: function() {
        console.log('Facebook login');
        var d = $q.defer();
        openFB.login(
            function (response) {
                console.log(response);
                if (response.status === 'connected') {
                    console.log('Facebook login succeeded');
                    //
                    // Facebook login was a success, get details about the current
                    // user
                    // for dev use http://localhost:8100/oauthcallback.html
                    // for prod use https://www.facebook.com/connect/login_success.html
                    // UNCOMMENT WHEN GOING THROUGH LECTURES
								
                    var token = response.authResponse.accessToken;
                    console.log('Token: ' + token);
                    
                    openFB.api({
                        path: '/me',
                        params: {},
                        success: function (userData) {
                            console.log('Got data from facebook about current user');
                            console.log(userData);
                            console.log(userData.name);
                            
                            //
                            // We got details of the current user now authenticate via firebase
                            //
                                       
                            console.log('Authenticating with firebase');


                            var auth = $firebaseAuth(firebaseRef);
                            auth.$authWithOAuthToken("facebook", token)
                                .then(function (authData) {
                                    console.log("Authentication success, logged in as:", authData.uid);
                                    console.log(authData);
                                    
                                    //
                                    // We've authenticated, now it's time to either get an existing user
                                    // object or create a new one.
                                    
                                    firebaseUserRef.child(authData.uid)
                                        .transaction(function (currentUserData) {
                                            if (currentUserData === null) {
                                                //
                                                // If the transaction is a success and the current user data is
                                                // null then this is the first time firebase has seen this user id
                                                // so this user is NEW.
                                                //
                                                // Any object we return from here will be used as the user data
                                                // in firebase
                                                //
                                                return {
                                                    'name': userData.name,
                                                    'profilePic': 'http://graph.facebook.com/' + userData.id + '/picture',
                                                    'userId': userData.id
                                                };
                                            }
                                        },
                                            function (error, committed) {
                                                //
                                                // This second function in the transaction clause is always called
                                                // whether the user was created or is being retrieved.
                                                //
                                                // We want to store the userid in localstorage as well as load the user
                                                // and store it in the self.current property.
                                                //
                                                // $localstorage.set('mystock-user', authData.uid);
                                                $rootScope.currentUser = authData;
                                                // registerUser(); //for ionic user register
                                                
                                                myStocksCacheService.removeAll();
                                                notesCacheService.removeAll();
                                                    
                                                self.loadUserData(authData);
                                                modalService.closeModal();
                                                                                      
                                                // self.currentNode = $firebaseObject(firebaseUserRef.child(authData.uid));
                                                // self.currentNode.$loaded(function () {
                                                    // When we are sure the object has been completely
                                                    // loaded from firebase then resolve the promise.
                                                //     console.log(self.currentNode);
                                                //     d.resolve(self.currentNode);
                                                // });
                                            });
                                            
                                })
                                .catch(function (error) {
                                    console.error("Authentication failed:", error);
                                    //
                                    // We've failed to authenticate, show the user an error message.
                                    //
                                    $ionicPopup.alert({
                                        title: "Error",
                                        template: 'There was an error logging you in with facebook, please try later.'
                                    });
                                    d.reject(error);
                                });
                                
                        },
                        error: function (error) {
                            console.error('Facebook error: ' + error.error_description);
                            //
                            // There was an error calling the facebook api to get details about the
                            // current user. Show the user an error message
                            //
                            $ionicPopup.alert({
                                title: "Facebook Error",
                                template: error.error_description
                            });
                            d.reject(error);
                        }
                    });
             
                } else {
                    console.error('Facebook login failed');
                    //
                    // There was an error authenticating with facebook
                    // Show the user an error message
                    //
                    $ionicPopup.alert({
                        title: "Facebook Error",
                        template: 'Failed to login with facebook'
                    });
                    d.reject();
                }
            },
            {
                scope: 'email' // Comma separated list of permissions to request from facebook
            });
            
            return d.promise;
    },
    
    login: function (user, signup) {
        firebaseRef.authWithPassword({
            email: user.email,
            password: user.password
        }, function (error, authData) {
            if (error) {
                console.log("Login Failed!", error);
            } else {
                $rootScope.currentUser = authData;
                self.registerUser(); //for ionic user register
                // self.currentNode = $firebaseObject(firebaseUserRef.child(authData.uid));
                // self.currentNode.$loaded();
                // console.log(self.currentNode);
                
                if (signup) {
                    modalService.closeModal();
                } else {
                    myStocksCacheService.removeAll();
                    notesCacheService.removeAll();
                    
                    self.loadUserData(authData);
                    modalService.closeModal();
                    
                    $timeout(function() {
                        $window.location.reload(true);
                    }, 400);
                }
                // console.log("Authenticated successfully with payload:", authData);
            }
        });
    },
    
    signup: function(user) {
        
        firebaseRef.createUser({
            email: user.email,
            password: user.password
        }, function(error, userData) {
            if (error) {
                console.log("Error creating user:", error);
            } else {
                self.login(user, true);
                firebaseRef.child('emails').push(user.email);
                firebaseUserRef.child(userData.uid).child('stocks').set(myStocksArrayService);
                // console.log("Successfully created user account with uid: ", userData.uid);
                
                var stocksWithNotes = notesCacheService.keys();
                stocksWithNotes.forEach(function(stockWithNotes) {
                    var notes = notesCacheService.get(stockWithNotes);
                    
                    notes.forEach(function(note) {
                        firebaseUserRef.child(userData.uid).child('notes').child(note.ticker).push(note);
                    });
                });
            }
        });
    },
    
    logout: function() {
        firebaseRef.unauth();
        notesCacheService.removeAll();
        myStocksCacheService.removeAll();
        $window.location.reload(true);
        $rootScope.currentUser = '';
        $state.go('app.mystocks');
    },
    
    loadUserData: function(authData) {
        // console.log(authData.uid);
        firebaseUserRef.child(authData.uid).child('stocks').once('value', function(snapshot) {
            
            var stocksFromDatabase = [];
            
            snapshot.val().forEach(function(stock) {
                var stockToAdd = {ticker: stock.ticker};
                stocksFromDatabase.push(stockToAdd);
            });
            
            myStocksCacheService.put('myStocks', stocksFromDatabase);
            
        }, function(error) {
            console.log("Firebase error -> stocks" + error);
        });
        
        firebaseUserRef.child(authData.uid).child('notes').once('value', function(snapshot) {
            
            snapshot.forEach(function(stockWithNotes) {
                // console.log(stockWithNotes);
                var notesFromDatabase = [];
                
                stockWithNotes.forEach(function(note) {
                    notesFromDatabase.push(note.val());
                    var cacheKey = note.child('ticker').val();
                    notesCacheService.put(cacheKey, notesFromDatabase);
                });
            });
            
        }, function(error) {
            console.log('Firebase error -> notes' + error);
        });
    },
    
    updateNotes: function(ticker, notes) {
        firebaseUserRef.child(self.getUser().uid).child('notes').child(ticker).remove();
        notes.forEach(function(note) {
            firebaseUserRef.child(self.getUser().uid).child('notes').child(note.ticker).push(note);
        });
    },
    
    updateStocks: function(stocks) {
        firebaseUserRef.child(self.getUser().uid).child('stocks').set(stocks);
    },
    
    registerUser: function() {
        //kick off the platform web client
        Ionic.io();
        
        //this will give you a fresh user or the previously saved current user
        var user = Ionic.User.current();
        
        //if the user doesn't have an id, you'll give it one
        if (!user.id) {
            user.id = $rootScope.currentUser.uid;
            user.set('email', $rootScope.currentUser.password.email);
            user.set('image', $rootScope.currentUser.password.profileImageURL);
        }
        
        console.log(user);
        
        //persist the user
        user.save();
    },
    
    getUser: function() {
        return firebaseRef.getAuth();   //provide user signing info
    },
    
    getCurrentNode: function() {
        var d = $q.defer();
        var auth = firebaseRef.getAuth();
        // console.log(auth.uid);
        if (auth) {
            self.currentNode = $firebaseObject(firebaseUserRef.child(auth.uid));
            self.currentNode.$loaded(function() {
                d.resolve(self.currentNode);
            });
        }
        return d.promise;
    }
    };
    
    if (self.getUser()) {
        $rootScope.currentUser = self.getUser();
        self.getCurrentNode();
    }
    
    
    
    return self;
})

.factory('chartDataCacheService', function(CacheFactory) {
    
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

.factory('stockDataService', function($q, $http, encodeURIService, stockDetailsCacheService, stockPriceCacheService) {
    
    var getDetailsData = function(ticker) {
        //http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20IN%20(%22YHOO%22)&format=json&env=http://datatables.org/alltables.env 
        
        var deferred = $q.defer(),
        cacheKey = ticker,
        stockDetailsCache = stockDetailsCacheService.get(cacheKey),
        
        query = 'select * from yahoo.finance.quotes where symbol IN ("' + ticker + '")',
        url = 'http://query.yahooapis.com/v1/public/yql?q=' + encodeURIService.encode(query) + '&format=json&env=http://datatables.org/alltables.env';
        
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
        var deferred = $q.defer(),
        
        cacheKey = ticker,
        
        url = "http://finance.yahoo.com/webservice/v1/symbols/" + ticker + "/quote?format=json&view=detail";
        
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
        
        return deferred.promise;
    };
    
    
    return {
        getDetailsData: getDetailsData,
        getPriceData: getPriceData
    };
})

.factory('chartDataService', function($q, $http, encodeURIService, chartDataCacheService) {
    
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
})

.factory('notesService', function(notesCacheService, userService) {
    
    return {
        getNotes: function(ticker) {
            return notesCacheService.get(ticker);
        },
        addNote: function(ticker, note) {
            var stockNotes = [];
            
            if (notesCacheService.get(ticker)) {
                stockNotes = notesCacheService.get(ticker);
            }
            stockNotes.push(note);
            notesCacheService.put(ticker, stockNotes);
            
            if (userService.getUser()) {
                var notes = notesCacheService.get(ticker);
                userService.updateNotes(ticker, notes);
            }
        },
        deleteNote: function(ticker, index) {
            var stockNotes = [];
            
            stockNotes = notesCacheService.get(ticker);
            stockNotes.splice(index, 1);
            notesCacheService.put(ticker, stockNotes);
            
            if (userService.getUser()) {
                var notes = notesCacheService.get(ticker);
                userService.updateNotes(ticker, notes);
            }
        }
    }
})

.factory('newsService', function($q, $http) {
    
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

.factory('myStocksArrayService', function(fillMyStocksCacheService, myStocksCacheService) {
    
    if (!myStocksCacheService.info('myStocks')) {
        fillMyStocksCacheService.fillMyStocksCache();
    }
    var myStocks = myStocksCacheService.get('myStocks');
    
    return myStocks;
})

.factory('followStockService', function(myStocksArrayService, myStocksCacheService, userService) {
    
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
})

.service('modalService', function($ionicModal) {
    
    this.openModal = function(id) {
        
        var _this = this;
        
        if (id == 1) {
            $ionicModal.fromTemplateUrl('templates/search.html', {
                scope: null,
                controller: 'SearchCtrl'
            }).then(function(modal) {
                _this.modal = modal;
                _this.modal.show();
            });
        } else if (id == 2) {
            $ionicModal.fromTemplateUrl('templates/login.html', {
                scope: null,
                controller: 'LoginSignupCtrl'
            }).then(function(modal) {
                _this.modal = modal;
                _this.modal.show();
            });
        
        } else if (id == 3) {
            $ionicModal.fromTemplateUrl('templates/signup.html', {
                scope: null,
                controller: 'LoginSignupCtrl'
            }).then(function(modal) {
                _this.modal = modal;
                _this.modal.show();
            });
        }
        
    };
    
    this.closeModal = function() {
        
        var _this = this;
        
        if (!_this.modal) return;
        _this.modal.hide();
        _this.modal.remove();
    };
    
    // return this;
})

.factory('searchService', function($q, $http) {
    
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
})

;
