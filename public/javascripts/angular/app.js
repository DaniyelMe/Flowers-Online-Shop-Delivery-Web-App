(function () {
    'use strict';

    angular
        .module('companyProject', ['ngRoute', 'ngCookies', 'ui.bootstrap'])
        .config(config)
        .config(['$tooltipProvider', function ($tooltipProvider) {
            $tooltipProvider.setTriggers({
                'show': 'hide'
            });
        }])
        .run(run)
        .directive('fileUpload', function ($window, $parse) {
            return {
                require: "ngModel",
                restrict: 'A',
                link: function ($scope, element, attrs, ngModel) {
                    var model = $parse(attrs.fileUpload);
                    var modelSetter = model.assign;
                    element.bind('change', function (event) {
                        var files = event.target.files;
                        var src = '';
                        if (files.length > 0) {
                            src = $window.URL.createObjectURL(files[0]);
                            modelSetter($scope, element[0].files[0]);
                            ngModel.$setViewValue(src);
                        } else {
                            // alert('file<0');
                            // modelSetter(undefined, element[0].files[0]);
                        }
                        $scope.$apply();
                    });
                }
            };
        })
    ;

    config.$inject = ['$routeProvider', '$locationProvider'];

    function config($routeProvider, $locationProvider) {
        $routeProvider

            .when('/home', {
                templateUrl: 'home.html',
                controller: 'mainCtrl'
            })

            // route for the about page
            .when('/about', {
                templateUrl: 'about.html',
                controller: 'aboutCtrl'
            })

            // route for the contact page
            .when('/contact', {
                templateUrl: 'contact.html',
                controller: 'contactCtrl'
            })

            // route for the users page
            .when('/flowers', {
                templateUrl: '/flower',
                controller: 'flowerCtrl',
                controllerAs: 'vm'
            })

            // route for the users page
            .when('/users', {
                templateUrl: '/user',
                controller: 'userCtrl',
                // controllerAs: 'vm'
            })

            // route for the reset password page
            .when('/reset/:token', {
                controller: 'resetCtrl',
                templateUrl: function (routeParam) { //register it as function
                    return '/reset/' + routeParam.token;  //Get the id from the argument
                },
                controllerAs: 'vm'
            })

            .otherwise({redirectTo: '/'})

        ;
    }

    run.$inject = ['$rootScope', '$location', '$http'];

    function run($rootScope, $location, $http) {
        $rootScope.$on('$locationChangeStart', function (event, next, current) {
            // redirect to login page if not logged in and trying to access a restricted page
            var path = $location.path()
            // confirm(path);
            console.log(path);
            var restrictedPage = $.inArray($location.path(), ['/', '/login', '/register']) === -1;
            var loggedIn = $rootScope.user;
            if (restrictedPage && !loggedIn) {
                // $location.path('/');
            }
        });
        $rootScope.$on('$stateChangeError', function (event, next, current) {
            // redirect to login page if not logged in and trying to access a restricted page
            var path = $location.path()
            // confirm(path);
            console.log(path);
            var restrictedPage = $.inArray($location.path(), ['/', '/login', '/register']) === -1;
            var loggedIn = $rootScope.user;
            if (restrictedPage && !loggedIn) {
                // $location.path('/');
            }
        });
    }
})();