(function () {
    'use strict';

    angular
        .module('companyProject')
        .factory('UserService', UserService);

    UserService.$inject = ['$http'];

    function UserService($http) {
        var service = {};

        service.encodePasswords = encodePasswords;
        service.GetAll = GetAll;
        service.GetById = GetById;
        service.GetByUsername = GetByUsername;
        service.Create = Create;
        // service.Update = Update;
        // service.GetAccount = GetAccount;
        service.UpdateAccount = UpdateAccount;
        service.UpdatePassword = UpdatePassword;
        service.ForgetPassword = ForgetPassword;
        service.ResetPassword = ResetPassword;
        service.Delete = Delete;
        service.Login = Login;
        service.Logout = Logout;

        return service;

        function GetAll() {
            return $http.get('/api/users').then(handleSuccess, handleError('Error getting all users'));
        }

        function GetById(id) {
            return $http.get('/api/users/' + id).then(handleSuccess, handleError('Error getting user by id'));
        }

        function GetByUsername(username) {
            return $http.get('/api/users/' + username).then(handleSuccess, handleError('Error getting user by username'));
        }

        function Login(user) {
            user.password = Base64.encode(user.password);
            return $http.post('/api/login', user).then(handleSuccess, handleError);
        }

        function Logout(user) {
            // user.password = undefined;
            return $http.post('/api/logout', user).then(handleSuccess, handleError);
        }

        function Create(user) {
            user.password = Base64.encode(user.password);
            user.confirmPassword = Base64.encode(user.confirmPassword);
            return $http.post('/api/register', user).then(handleSuccess, handleError);
        }

        // function Update(user) {
        //     return $http.put('/api/users/' + user.id, user).then(handleSuccess, handleError);
        // }

        // function GetAccount() {
        //     return $http.get('/api/account').then(handleSuccess, handleError('Error updating user'));
        // }

        function UpdateAccount(user) {
            return $http.post('/api/account/profile', user).then(handleSuccess, handleError);
        }

        function UpdatePassword(user) {
            user.oldPassword = Base64.encode(user.oldPassword);
            user.newPassword = Base64.encode(user.newPassword);
            user.confirmPassword = Base64.encode(user.confirmPassword);
            return $http.post('/api/account/password', user).then(handleSuccess, handleError);
        }

        function ForgetPassword(user) {
            return $http.post('/api/forgot', user).then(handleSuccess, handleError);
        }

        function ResetPassword(user) {
            // user.password = Base64.encode(user.password);
            // user.confirmPassword = Base64.encode(user.confirmPassword);
            return $http.post('/api/reset/' + user.token, user).then(handleSuccess, handleError);
        }

        function Delete(user) {
            // return $http.delete('/api/account/delete',user).then(handleSuccess, handleError);
            return $http.post('/api/account/delete',user).then(handleSuccess, handleError);
        }

        // private functions

        function handleSuccess(res) {
            return {success: true, message: res.data};
        }

        function handleError(res) {
            return {success: false, message: res.data};
        }


        function  encodePasswords(user) {
            for (var property in user) {
                if(property.toLowerCase().includes('password')){
                    user[property] = Base64.encode(user[property])
                }
            }
        }
    }
    // Base64 encoding service used by AuthenticationService
    var Base64 = {

        keyStr: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',

        encode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;

            do {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);

                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;

                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }

                output = output +
                    this.keyStr.charAt(enc1) +
                    this.keyStr.charAt(enc2) +
                    this.keyStr.charAt(enc3) +
                    this.keyStr.charAt(enc4);
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";
            } while (i < input.length);

            return output;
        },
    };


})();
