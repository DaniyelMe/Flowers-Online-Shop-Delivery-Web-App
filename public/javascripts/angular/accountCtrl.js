(function () {
    'use strict';

    angular
        .module('companyProject')
        .controller('accountCtrl', accountCtrl);

    // accountCtrl.$inject = ['$scope', '$http', '$modal', '$log'];

    function accountCtrl($scope, $modalInstance, user) {
        $scope.usr = {};
        $scope.vm = {};
        $scope.vm.user = user;
        $scope.ok = function () {
            $scope.vm.dataLoading = true;
            console.log($scope.usr);
            $http.post('/api/account', $scope.usr)
                .then(function (res) {
                    // vm.user.password = undefined;
                    $scope.flash = {
                        message: res.data,
                        type: 'success'
                    };
                    confirm('Success aaa: ' + res.data);
                    $scope.vm.dataLoading = false;
                    $modalInstance.close($scope.usr);
                }, function (res) {
                    confirm('Error: ' + res.data);
                    $scope.flash = {
                        message: res.data,
                        type: 'error'
                    };
                    $scope.vm.dataLoading = false;
                });
        };
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
        // $scope.login = function () {
        //     $modalInstance.dismiss('cancel');
        //     login();
        // }
    }
})();
