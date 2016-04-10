var mod = angular.module('mystock.services.user', []);

mod.factory('userService', function($rootScope, $window, $timeout, $q, $ionicPopup, $firebaseAuth, $firebaseObject, $state, $ionicAnalytics, firebaseRef, firebaseUserRef, modalService, myStocksArrayService, notesCacheService, myStocksCacheService) {
    
    var self = {
    current: {},
    currentNode: {},
    toggleFavorite: function(ticker) {
        if (!self.currentNode.favorites) {
            self.currentNode.favorites = {};
        }
        if (self.currentNode.favorites[ticker]) {
            self.currentNode.favorites[ticker] = null;
            // $ionicAnalytics.track('Unfavorite Stock', ticker);
        } else {
            self.currentNode.favorites[ticker] = ticker;
            // $ionicAnalytics.track('Favorite Stock', ticker);
        }
        self.currentNode.$save();
    },
    
    loginWithFacebook: function() {
        // console.log('Facebook login');
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
                    // console.log('Token: ' + token);
                    
                    openFB.api({
                        path: '/me',
                        params: {},
                        success: function (userData) {
                            // console.log('Got data from facebook about current user');
                            // console.log(userData);
                            // console.log(userData.name);
                            
                            //
                            // We got details of the current user now authenticate via firebase
                            //
                                       
                            // console.log('Authenticating with firebase');


                            var auth = $firebaseAuth(firebaseRef);
                            auth.$authWithOAuthToken("facebook", token)
                                .then(function (authData) {
                                    // console.log("Authentication success, logged in as:", authData.uid);
                                    // console.log(authData);
                                    
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
                                    // console.error("Authentication failed:", error);
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
                            // console.error('Facebook error: ' + error.error_description);
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
                    // console.error('Facebook login failed');
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
});