(function () {
    'use strict';

    angular
        .module('companyProject')
        .controller('AccountCtrl', AccountCtrl);

    AccountCtrl.$inject = ['UserService', 'FlashService', '$location', '$rootScope'];

    function AccountCtrl(UserService, FlashService, $location, $rootScope) {
        var vm = this;

        // vm.user = null;
        // vm.getAccount = getAccount;
        vm.updateAccount = updateAccount;
        vm.updatePassword = updatePassword;
        vm.forgetPassword = forgetPassword;
        vm.resetPassword = resetPassword;
        vm.deleteAccount = deleteAccount;
        vm.login = login;
        vm.register = register;
        vm.logout = logout;

        function accountService(path) {
            vm.dataLoading = true;
            var x = $rootScope.user;
            // vm.user.password = undefined;
            path(vm.user)
                .then(function (response) {
                    if (response.success) {
                        vm.dataLoading = false;
                        $location.path('/home');
                        vm.user.password = undefined;
                        // angular.element('#loginModal').modal('hide');
                        FlashService.Success(response.message);
                    } else {
                        FlashService.Error(response.message);
                        vm.dataLoading = false;
                    }
                });
        }

        initController();

        // getAccount();

        function initController() {

            // loadCurrentUser();
            // loadAllUsers();
        }


        function login() {
            accountService(UserService.Login);
        }


        function register() {
            accountService(UserService.Create);
        }


        function logout() {
            accountService(UserService.Logout);
        }

        function updateAccount() {
            // confirm('function updateAccount()');
            vm.dataLoading = true;
            UserService.UpdateAccount(vm.user)
                .then(function (response) {
                    if (response.success) {
                        vm.dataLoading = false;
                        // $location.path('/');
                        // angular.element('#loginModal').modal('hide');
                        FlashService.Success(response.message);
                    } else {
                        FlashService.Error(response.message);
                        vm.dataLoading = false;
                    }
                });
        }

        function updatePassword() {
            vm.dataLoading = true;
            UserService.UpdatePassword(vm.user)
                .then(function (response) {
                    if (response.success) {
                        vm.dataLoading = false;
                        // $location.path('/');
                        // angular.element('#loginModal').modal('hide');
                        FlashService.Success(response.message);
                    } else {
                        FlashService.Error(response.message);
                        vm.dataLoading = false;
                    }
                });
        }

        function forgetPassword() {
            vm.dataLoading = true;
            UserService.ForgetPassword(vm.user)
                .then(function (response) {
                    if (response.success) {
                        vm.dataLoading = false;
                        // $location.path('/');
                        // angular.element('#loginModal').modal('hide');
                        FlashService.Success(response.message);
                    } else {
                        FlashService.Error(response.message);
                        vm.dataLoading = false;
                    }
                });
        }

        function resetPassword() {
            accountService(UserService.ResetPassword);
        }

        function deleteAccount(id) {
            accountService(UserService.Delete);
        }
    }

})();