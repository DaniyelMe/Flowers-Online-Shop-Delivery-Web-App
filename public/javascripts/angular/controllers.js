(function () {
    'use strict';
    // confirm('function() controllers');
    // var count = 0;

    angular
        .module('companyProject')
        .directive('fileModel', ['$parse', function ($parse) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    var model = $parse(attrs.fileModel);
                    var modelSetter = model.assign;

                    element.bind('change', function () {
                        scope.$apply(function () {
                            modelSetter(scope, element[0].files[0]);
                        });
                    });
                }
            };
        }])
        .service('fileUpload', ['$http', function ($http) {
            this.uploadFileToUrl = function (file, uploadUrl) {
                var fd = new FormData();
                fd.append('file', file);

                $http.post(uploadUrl, fd, {
                    transformRequest: angular.identity,
                    headers: {'Content-Type': undefined}
                //     $http.post(uploadUrl,{file:file}, {
                //     transformRequest: angular.identity,
                //     headers: {'Content-Type': undefined}
                }).then(function (res) {
                    // $scope.flowers = res.data;
                }, function (res) {
                    console.log('Error: ' + res.data);
                });
            }
        }])
        .controller('flowerCtrl', ['$scope', '$http', 'fileUpload', function ($scope, $http, fileUpload) {
            $scope.uploadFile = function () {
                var file = $scope.myFile;

                console.log('file is ');
                console.dir(file);

                var uploadUrl = "/flower/flowerImage";
                fileUpload.uploadFileToUrl(file, uploadUrl);
            }
            // }])
            // .controller('flowerCtrl', function ($scope, $http) {
            $http.get('api/flower/flowers')
                .then(function (res) {
                    $scope.flowers = res.data;
                }, function (res) {
                    console.log('Error: ' + res.data);
                });
            // })
        }])
        // .controller('usersCtrl', function ($scope, $http) {
        //     var vm = this;
        //     vm.addUser = addUser;
        //     vm.updateUser = updateUser;
        //     vm.deleteUser = deleteUser;
        //     vm.getUsers = getUsers;
        //     getUsers();
        //
        //     function getUsers() {
        //         $http.get('api/user/users')
        //             .then(function (res) {
        //                 $scope.users = res.data;
        //             }, function (res) {
        //                 console.log('Error: ' + res.data);
        //             });
        //     }


        // })

        .controller('resetCtrl',function (UserService,  FlashService, $location, $rootScope, $routeParams) {
            var vm = this;

            vm.resetPassword = resetPassword;

            function resetPassword() {
                vm.dataLoading = true;
                vm.user.token = $routeParams.token;
                UserService.ResetPassword(vm.user)
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
        })
        // create the controller and inject Angular's $scope
        .controller('mainCtrl', function ($scope, $http) {
            // .controller('mainCtrl', function ($scope, $http, MenuService) {
            // confirm('mainCtrl');
            // console.log('mainCtrl');
            // var vm = this;
            // if(!$scope.count)
            // {
            //     $scope.count = 0;
            // }
            // $scope.count = $scope.count + 1;
            // console.log('$scope-count:' + $scope.count);
            // vm.initMenu = initMenu;
            // // $scope.initMenu = initMenu;
            // $scope.logout = logout;
            //
            // function initMenu() {
            //     $http.get('/load')
            //         .then(function (res) {
            //             // console.log("$scope.message");
            //             // console.log($scope.message);
            //             console.log("$scope.user");
            //             console.log($scope.user);
            //             $scope.user = res.data;
            //             vm.user = res.data;
            //             console.log("res.data");
            //             console.log($scope.user);
            //          }, function (res) {
            //             console.log('Error: ' + res.data);
            //         });
            // }
            //
            // function logout() {
            //     $http.get('/logout')
            //         .then(function (res) {
            //             initMenu();
            //         }, function (res) {
            //             console.log('Error: ' + res.data);
            //         });
            // }
            //
            // initMenu();
            // $scope.message = 'Everyone come and see how good I look!';
            // console.log("$scope.message");
            // console.log($scope.message);
        })

        .controller('aboutCtrl', function ($scope) {
            // confirm('aboutCtrl');
            $scope.message = 'Look! I am an about page.';
        })

        .controller('contactCtrl', function ($scope) {
            // confirm('contactCtrl');
            $scope.message = 'Contact us! DZ. This is just a demo.';
        })

        .controller('loginCtrl', function ($scope) {
            confirm('loginCtrl');
            $scope.message = 'Contact us! DZ. This is just a demo.';
        })

        .controller('registerCtrl', function ($scope) {
            confirm('registerCtrl');
            $scope.message = 'registerCtrl';
        })

        .controller('logoutCtrl', function ($scope, $http) {
            confirm('logoutCtrl');
            $scope.message = 'Contact us! DZ. This is just a demo.';
            $scope.message = 'Everyone come and see how good I look!';
            // when landing on the page, get all todos and show them
            $http.get('/logout');
            // .success(function (data) {
            //     confirm("logout");
            //     $scope.menu = data;
            //     console.log(data);
            // })
            // .error(function (data) {
            //     console.log('Error: ' + data);
            // });
        })


// .directive('myModal', function () {
//     return {
//         restrict: 'A',
//         link: function (scope, element, attr) {
//             scope.dismiss = function () {
//                 element.modal('hide');
//             };
//         }
//     };
// })

    ;

})
();