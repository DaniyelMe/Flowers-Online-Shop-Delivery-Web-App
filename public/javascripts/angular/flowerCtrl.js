(function () {
    'use strict';

    angular
        .module('companyProject')
        .controller('userCtrl', userCtrl);

    userCtrl.$inject = ['$rootScope', '$scope', '$http', '$modal'];

    function userCtrl($rootScope, $scope, $http, $modal) {


        function getUsers() {
            $http.get('/api/user/users')
                .then(function (res) {
                    $scope.vm.users = res.data;
                }, function (res) {
                    alert('Error: ' + res.data);
                });
        }

        $scope.vm = {};
        getUsers();

        $scope.addUser = function () {
            var modalInstance = $modal.open({
                templateUrl: '/api/user/addUser',
                controller: addUserCtrl,
                resolve: {},
                scope: $scope.$new()
            });
            modalInstance.result.then(function (selectedItem) {
                console.log('selectedItem: ' + selectedItem);
                $http.post('/api/user/registerAdmin', selectedItem)
                    .then(function (res) {
                        getUsers();
                        alert('Success: ' + res.data);
                    }, function (res) {
                        alert('Error: ' + res.data);
                    });
            }, function () {
                console.log('Modal add user dismissed at: ' + new Date());
            });
        };

        function addUserCtrl($scope, $modalInstance) {
            $scope.eUsr = [];
            $scope.ok = function () {
                getUsers();
                $modalInstance.close($scope.eUsr);
            };

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        };

        $scope.editUser = function (selectedUser) {
            var editUser = selectedUser;
            var modalInstance = $modal.open({
                templateUrl: '/api/user/editUser',
                controller: editUserCtrl,
                resolve: {
                    user: function () {
                        return editUser;
                    }
                },
                scope: $scope.$new()
            });
            modalInstance.result.then(function (selectedItem) {
                console.log('selectedItem: ' + selectedItem);
                $http.post('/api/user/updateUser', selectedItem)
                    .then(function (res) {
                        getUsers();
                        alert('Success: ' + res.data);
                    }, function (res) {
                        alert('Error: ' + res.data);
                    });
            }, function () {
                console.log('Modal edit user dismissed at: ' + new Date());
            });
        }

        function editUserCtrl($scope, $modalInstance, user) {
            $scope.vm = {};
            $scope.vm.user = user;
            $scope.vm.ok = function () {
                $modalInstance.close($scope.vm.user);
            };

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        };

        $scope.deleteUser = function (selectedUser) {
            var r = confirm("are yuo sure you want to delete user:\n" + JSON.stringify(selectedUser));
            if (!r) {
                return;
            } else {
                $http.post('/api/account/delete', selectedUser)
                    .then(function (res) {
                        getUsers();
                        alert('Success: ' + res.data);
                    }, function (res) {
                        alert('Error: ' + res.data);
                    });
            }
        }
        }
})();
