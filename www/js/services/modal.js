var mod = angular.module('mystock.services.modal', []);

mod.service('modalService', function($ionicModal) {
    
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
});
