(function () {
    'use strict';

    angular
        .module('companyProject')
        .directive('ngEnter', ngEnter)
        .factory('chat', chat)
        .controller('menuCtrl', menuCtrl)
    // .controller('chatCtrl1', chatCtrl1)
    ;

    function ngEnter() {
        return function (scope, element, attrs) {
            element.bind("keydown keypress", function (event) {
                if (event.which === 13) {
                    scope.$apply(function () {
                        scope.$eval(attrs.ngEnter);
                    });
                    event.preventDefault();
                }
            });
        };
    }

    io({transports: ['websocket', 'polling']});

    //Service to interact with the socket library
    chat.$inject = ['$rootScope'];

    function chat($rootScope) {
        var mySocket = undefined;
        var apply = false;
        return {
            isActive: function () {
                return mySocket !== undefined
            },
            activate: function (callback) {
                console.log("socket.open chat");
                mySocket = io.connect('/chat');
                var args = arguments;
                mySocket.on('connect', function () {
                    console.log("Chat socket connected!");
                    if (callback)
                        if (apply)
                            callback.apply(mySocket, args);
                        else
                            $rootScope.$apply(function () {
                                apply = true;
                                callback.apply(mySocket, args);
                                apply = false;
                            });
                });
            },
            deactivate: function (callback) {
                console.log("socket.close chat");
                mySocket.disconnect();
                mySocket = undefined;
                var args = arguments;
                if (callback)
                    if (apply)
                        callback.apply(mySocket, args);
                    else
                        $rootScope.$apply(function () {
                            apply = true;
                            callback.apply(mySocket, args);
                            apply = false;
                        });
            },
            on: function (eventName, callback) {
                console.log("socket.on " + eventName);
                if (mySocket === undefined) return;
                mySocket.on(eventName, function () {
                    console.log("socket.on received " + eventName);
                    var args = arguments;
                    if (callback)
                        if (apply)
                            callback.apply(mySocket, args);
                        else
                            $rootScope.$apply(function () {
                                apply = true;
                                callback.apply(mySocket, args);
                                apply = false;
                            });
                });
            },
            emit: function (eventName, data, callback) {
                console.log("socket.emit " + eventName);
                if (mySocket === undefined) return;
                mySocket.emit(eventName, data, function () {
                    console.log("socket.emitted " + eventName);
                    var args = arguments;
                    if (callback)
                        if (apply)
                            callback.apply(mySocket, args);
                        else
                            $rootScope.$apply(function () {
                                apply = true;
                                callback.apply(mySocket, args);
                                apply = false;
                            });
                })
            }
        };
    }

    menuCtrl.$inject = ['chat', '$rootScope', '$scope', '$http', '$modal', '$timeout', '$log', '$q','$location'];

    function menuCtrl(chat, $rootScope, $scope, $http, $modal, $timeout, $log, $q,$location) {

        $rootScope.user = {};
        $scope.clearFlashMessage = clearFlashMessage;
        $scope.clearFlashMessage = clearFlashMessage;
        $scope.login = login;
        $scope.register = register;
        $scope.logout = logout;
        $scope.account = account;
        $scope.chatOpen = chatOpen;
        $scope.initChat = initChat;
        $scope.newConversation = {};
        $scope.addConversation = addConversation;
        $scope.content = {};

        $scope.change = change;
        $scope.send = send;
        $scope.chatPanel = {};
        $scope.msg = {};
        $scope.msg.room = {};
        $scope.msg.type = '';
        $scope.msg.content = '';
        $scope.changeRoom = function (room, kind) {
            $scope.msg.room.kind = kind;
            $scope.msg.room.name = room;
            $scope.chatPanel.room = room;
            try {
                var elm = $('#' + room);
                $timeout(function () {
                    elm.scrollTop(elm[0].scrollHeight);
                }, 100);
            }
            catch
                (err) {
                // alert(err);
            }
        };
        $scope.alert = msg =>
            alert(msg);
        //------------
        $scope.changeRoom('','general'); $scope.chatPanel.content = 'generalMessage';
        //---------------
        $scope.newGroup = {};
        $scope.groups = {};
        // $scope.groups.all = [{"name": 'g1'}, {"name": 'g2'}, {"name": 'g3'}, {"name": 'g4'}];
        $scope.getAllGroupsList = function getAllGroupsList() {
            $http.get('/chat/groups')
                .then(function (res) {
                    $scope.groups.all = res.data;
                }, function (res) {
                    alert('Error: ' + res.data);
                });
        };
        $scope.getGroupsToJoin = function getGroupsToJoin() {
            $http.get('/chat/groupsToJoin')
                .then(function (res) {
                    $scope.groups.toJoin = res.data;
                }, function (res) {
                    alert('Error: ' + res.data);
                });
        };
        $scope.getManageGroups = function getManageGroups() {
            $http.get('/chat/groupsManage')
                .then(function (res) {
                    $scope.groups.manage = res.data;
                }, function (res) {
                    alert('Error: ' + res.data);
                });
        };
        $scope.addGroup = function addGroup() {
            $scope.newGroup.admin = $rootScope.user._id;
            $scope.newGroup.members = [$rootScope.user._id];
            chat.emit('newGroup', $scope.newGroup, function (data) {
                if (data.success) {
                    $scope.rooms.groups.push(data.group);
                    $scope.changeRoom(data.group._id, 'group');
                }
                else {
                    alert(JSON.stringify(data.err));
                }
            });
            $scope.newGroup = {};
        };

        $scope.joinGroup = function joinGroup() {
            chat.emit('join group', $scope.groups.selected, function (err) {
                if (err) {
                    alert(JSON.stringify(err));
                } else {
                    $scope.groups.selected = '';
                }
            });
        };

        $scope.attachGroup = function attachGroup(attach, group, msg) {
            chat.emit('attach group', {attach: attach, group: group, message: msg});
        };

        $scope.attachUser = function attachGroup(attach, msg) {
            chat.emit('attach user', {attach: attach, message: msg});
        };

        $scope.removeMember = function removeMember(member) {
            chat.emit('remove member', {group: $scope.groups.selected._id, user: member}, function (err) {
                if (err) {
                    alert(JSON.stringify(err));
                } else {
                    $scope.groups.selected = {};
                    $scope.groups.selection = '';
                    $scope.getManageGroups();
                }
            })
            // $http.post('/group/removeMember',{group:group,user:member})
            //     .then(function (res) {
            //         $scope.getManageGroups();
            //     }, function (res) {
            //         alert('Error: ' + res.data);
            //     });
        };


        $scope.like = function like(like, msg) {
            chat.emit('like', {like: like, message: msg}, function (err) {
                    if (err) {
                        alert(JSON.stringify(err));
                    }
                }
            );
        };


        $scope.setManageGroupSelected = function setManageGroupSelected() {
            $scope.groups.selected = $scope.groups.manage.find(g => g.name == $scope.groups.selection);
        };

        function clearFlashMessage() {
            delete $scope.flash;
        }

        function initMenu() {
            clearFlashMessage();
            $http.get('/session/user')
                .then(function (res) {
                    // alert('Success: ' + res.data);
                    $rootScope.user = res.data;
                    $scope.chatActive = ($rootScope.user ? true : false);
                    // $rootScope.vm.user = res.data;
                    chat.activate(function () {
                        console.log("chat socket activated");
                        registerChat();
                        // chat.emit('login', {username: $rootScope.user.username});
                        chat.emit('login');
                    });
                }, function (res) {
                    alert('Error: ' + res.data);
                    // console.log('Error: ' + res.data);
                });
        }

        initMenu();

        function logout() {
            $http.post('/api/logout')
                .then(function (res) {
                    // alert('Success logout: ' + res.data);
                    // // FlashService.Success(response.message);
                    // $scope.flash = {
                    //     message: res.data,
                    //     type: 'success'
                    // };
                    initMenu();
                    console.log("emit logout");
                    chat.emit('logout', {username: $rootScope.user.username}, function () {
                        console.log("closing chat socket");
                        chat.deactivate(function () {
                            init();
                        });
                    });
                    $location.path('/');
                }, function (res) {
                    alert('Error: ' + res.data);
                    console.log('Error: ' + res.data);
                    // $scope.flash = {
                    //     message: res.data,
                    //     type: 'error'
                    // };
                });
        }

        function login() {
            var modalInstance = $modal.open({
                templateUrl: '/login',
                controller: loginCtrl,
                resolve: {},
                scope: $scope.$new()
            });
            modalInstance.result.then(function (selectedItem) {
                initMenu();
                chat.activate(function () {
                    console.log("chat socket activated");
                    registerChat();
                    // chat.emit('login', {username: $scope.user.username});
                    chat.emit('login');
                });
            }, function () {
                console.log('Modal dismissed at: ' + new Date());
            });
        }

        function loginCtrl($scope, $modalInstance) {
            $scope.vm = {};
            $scope.vm.user = {};
            $scope.vm.ok = function () {
                $scope.vm.dataLoading = true;
                // var x = $rootScope.user;
                console.log($scope.usr);
                $http.post('/api/login', $scope.vm.user)
                    .then(function (res) {
                        // vm.user.password = undefined;
                        $scope.vm.flash = {
                            message: res.data,
                            type: 'success'
                        };
                        console.log('Success login: ' + res.data);
                        // alert('Success login: ' + res.data);
                        $scope.vm.dataLoading = false;
                        $modalInstance.close($scope.usr);
                    }, function (res) {
                        alert('Error: ' + res.data);
                        $scope.vm.flash = {
                            message: res.data,
                            type: 'error'
                        };
                        $scope.vm.dataLoading = false;
                    });
            };
            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
            $scope.register = function () {
                $modalInstance.dismiss('cancel');
                register();
            }
            $scope.forgot = function () {
                $modalInstance.dismiss('cancel');
                forgot();
            }
        }

        function register() {
            var modalInstance = $modal.open({
                templateUrl: '/register',
                controller: registerCtrl,
                resolve: {},
                scope: $scope.$new()
            });
            modalInstance.result.then(function (selectedItem) {
                initMenu();//Unnecessary
            }, function () {
                console.log('Modal dismissed at: ' + new Date());
            });
        }

        function registerCtrl($scope, $modalInstance) {
            $scope.vm = {};
            $scope.vm.user = {};
            $scope.vm.ok = function () {
                $scope.vm.dataLoading = true;
                console.log($scope.usr);
                if ($scope.vm.myFile) {
                    var fd = new FormData();
                    fd.append('file', $scope.vm.myFile);
                    $http.post('register/profileImage', fd, {
                        transformRequest: angular.identity,
                        headers: {'Content-Type': undefined}
                    }).then(function (res1) {
                        $scope.vm.user.isFileImage = true;
                        $http.post('/api/register', $scope.vm.user)
                            .then(function (res) {
                                alert('Success: ' + JSON.stringify(res.data));
                                alert('Success: ' + JSON.stringify(res1.data));
                                $scope.vm.dataLoading = false;
                                $modalInstance.close();
                            }, function (res) {
                                alert('Error register: ' + JSON.stringify(res.data));
                                $scope.vm.flash = {message: res.data, type: 'error'};
                                $scope.vm.flash = {message: res1.data, type: 'error'};
                                $scope.vm.dataLoading = false;
                            });
                    }, function (res) {
                        alert('Error: ' + JSON.stringify(res.data));
                        $scope.vm.flash = {message: res.data, type: 'error'};
                        $scope.vm.dataLoading = false;
                    });
                } else {
                    $http.post('/api/register', $scope.vm.user)
                        .then(function (res) {
                            alert('Success: ' + JSON.stringify(res.data));
                            $scope.vm.dataLoading = false;
                            $modalInstance.close();
                        }, function (res) {
                            alert('Error register: ' + JSON.stringify(res.data));
                            $scope.vm.flash = {message: res.data, type: 'error'};
                            $scope.vm.dataLoading = false;
                        });
                }
            };
            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
            $scope.login = function () {
                $modalInstance.dismiss('cancel');
                login();
            }

        }

        function forgot() {
            var modalInstance = $modal.open({
                templateUrl: '/forgot',
                controller: forgotCtrl,
                resolve: {},
                scope: $scope.$new()
            });
            modalInstance.result.then(function (selectedItem) {
                initMenu();
            }, function () {
                console.log('Modal dismissed at: ' + new Date());
            });
        }

        function forgotCtrl($scope, $modalInstance) {
            $scope.vm = {};
            $scope.vm.user = {};
            $scope.ok = function () {
                $scope.vm.dataLoading = true;
                console.log($scope.vm.user);
                $http.post('/api/forgot', $scope.vm.user)
                    .then(function (res) {
                        // vm.user.password = undefined;
                        $scope.flash = {
                            message: res.data,
                            type: 'success'
                        };
                        // alert('Success send email: ' + JSON.stringify(res.data));
                        alert(res.data[0].msg);
                        $scope.vm.dataLoading = false;
                        $modalInstance.close($scope.usr);
                    }, function (res) {
                        alert('Error: ' + JSON.stringify(res.data));
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
            $scope.login = function () {
                $modalInstance.dismiss('cancel');
                login();
            }

        }

        function account() {
            var user = $rootScope.user;
            var modalInstance = $modal.open({
                templateUrl: '/account',
                controller: accountCtrl,
                resolve: {
                    user: function () {
                        return user;
                    }
                },
                scope: $scope.$new()
            });
            modalInstance.result.then(function () {
                initMenu();
            }, function () {
                console.log('Modal dismissed at: ' + new Date());
            });
        }

        function accountCtrl($scope, $modalInstance, user) {
            $scope.vm = {};
            $scope.vm.user = user;
            $scope.vm.oldProfileImage = $scope.vm.user.profileImage;
            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
            $scope.vm.updateAccount = function () {
                $scope.vm.dataLoading = true;
                console.log($scope.vm.user);
                if ($scope.vm.myFile &&
                    $scope.vm.oldProfileImage != $scope.vm.user.profileImage) {
                    var fd = new FormData();
                    fd.append('file', $scope.vm.myFile);
                    $http.post('account/profileImage', fd, {
                        transformRequest: angular.identity,
                        headers: {'Content-Type': undefined}
                    }).then(function (res1) {
                        $scope.vm.user.isFileImage = true;
                        $http.post('/api/account/profile', $scope.vm.user)
                            .then(function (res) {
                                alert('Success: ' + JSON.stringify(res.data));
                                alert('Success: ' + JSON.stringify(res1.data));
                                $scope.vm.dataLoading = false;
                                $modalInstance.close();
                            }, function (res) {
                                alert('Error: ' + JSON.stringify(res.data));
                                $scope.vm.flash = {message: res.data, type: 'error'};
                                $scope.vm.dataLoading = false;
                            });
                    }, function (res) {
                        alert('Error: ' + JSON.stringify(res.data));
                        $scope.vm.flash = {
                            message: res.data,
                            type: 'error'
                        };
                        $scope.vm.dataLoading = false;
                    });
                } else {
                    $http.post('/api/account/profile', $scope.vm.user)
                        .then(function (res) {
                            alert('Success: ' + JSON.stringify(res.data));
                            $scope.vm.dataLoading = false;
                            $modalInstance.close();
                        }, function (res) {
                            alert('Error: ' + JSON.stringify(res.data));
                            $scope.vm.flash = {message: res.data, type: 'error'};
                            $scope.vm.dataLoading = false;
                        });
                }
            };
            $scope.vm.updatePassword = function () {
                $scope.vm.dataLoading = true;
                console.log($scope.vm.usr);
                $http.post('/api/account/password', $scope.vm.pass)
                    .then(function (res) {
                        $scope.vm.flash = {
                            message: res.data,
                            type: 'success'
                        };
                        alert('Success: ' + JSON.stringify(res.data));
                        $scope.vm.dataLoading = false;
                        $modalInstance.close();
                    }, function (res) {
                        alert('Error: ' + JSON.stringify(res.data));
                        $scope.vm.flash = {message: res.data, type: 'error'};
                        $scope.vm.dataLoading = false;
                    });
            };
            $scope.vm.deleteAccount = function () {
                $scope.vm.dataLoading = true;
                console.log($scope.vm.user);
                $http.post('/api/account/delete', $scope.vm.user)
                    .then(function (res) {
                        $scope.vm.flash = {
                            message: res.data,
                            type: 'success'
                        };
                        alert('Success: ' + JSON.stringify(res.data));
                        $scope.vm.dataLoading = false;
                        $modalInstance.close();
                    }, function (res) {
                        alert('Error: ' + JSON.stringify(res.data));
                        $scope.vm.flash = {message: res.data, type: 'error'};
                        $scope.vm.dataLoading = false;
                    });
            };
        }

        function addConversation() {
            chat.emit('addConversation', $scope.newConversation, function (data) {
                // chat.on('addConversation',function (data) {
                //     if(data.success){
                $scope.rooms.conversations.push(data);
                $scope.changeRoom(data._id, 'conversation');
                // }
                // });
            });
            // //Empty the textarea
            // $scope.message = "";

            // $http.post('/api/chat/addConversation', $scope.newConversation)
            //     .then(function (res) {
            //         $scope.rooms.conversations.push(res.data);
            //         $scope.changeRoom(res.data._id, 'conversation');
            //     }, function (res) {
            //         alert('Error: ' + res.data);
            //         //         console.log('Error: ' + res.data);
            //     });
        }

        function initChat() {
            angular.element('#myChat').popover({
                html: true,
                trigger: 'manual',
                content: chatContent()
            })
            //     .click(function(e) {
            //     angular.element(this).popover('toggle');
            // });
        }

        function chatContent() {
            $http.get('/chat')
                .then(function (res) {
                    return res.data;
                }, function (res) {
                    alert('Error: ' + res.data);
                    return res.data;
                });
        }

        function chatOpen() {
            if (!$rootScope.user) {
                alert("please login first")
                login();
                return;
            }
            if ($scope.chatActive) {
                $scope.chatActive = false;
                return;
            }
            $scope.chatActive = true;
        }

        function chat1() {
            if (!$rootScope.user) {
                alert("please login first")
                login();
                return;
            }
            if ($scope.chatActive) {
                // angular.element('#myChat').popover({
                //     animation: true,
                //     content: "",
                //     html: true,
                //     placement: 'top',
                // }).popover('show');
                $scope.chatActive = false;
                return;
            }

            $http.get('/chat')
                .then(function (res) {
                    $scope.content = res.data;
                    // angular.element('#myChat').popover();
                    $scope.chatActive = true;
                    // alert('Success: ' + res.data);
                }, function (res) {
                    alert('Error: ' + res.data);
                    // console.log('Error: ' + res.data);
                });
            // var modalInstance = $modal.open({
            //     templateUrl: '/chat',
            //     controller: chatCtrl,
            //     keyboard: true,
            //     resolve: {},
            //     scope: $scope.$new(),
            //     backdrop: 'static'
            // });
            // modalInstance.result.then(function (selectedItem) {
            //     $scope.chatActive = false;
            //     initMenu();
            // }, function () {
            //     $scope.chatActive = false;
            //     console.log('Modal dismissed at: ' + new Date());
            // });
        }

        function chatCtrl($scope, $modalInstance) {
            // $scope.usr = {};
            // $scope.vm = {};
            $scope.ok = function () {
                // $scope.vm.dataLoading = true;
                // console.log($scope.usr);
                // $http.post('/api/account', $scope.usr)
                //     .then(function (res) {
                //         // vm.user.password = undefined;
                //         $scope.flash = {
                //             message: res.data,
                //             type: 'success'
                //         };
                //         alert('Success aaa: ' + res.data);
                //         $scope.vm.dataLoading = false;
                //         $modalInstance.close($scope.usr);
                //     }, function (res) {
                //         alert('Error: ' + res.data);
                //         $scope.flash = {
                //             message: res.data,
                //             type: 'error'
                //         };
                //         $scope.vm.dataLoading = false;
                //     });
            };
            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
            $scope.login = function () {
                $modalInstance.dismiss('cancel');
                login();
            }

        }


        function registerChat() {
            //Listen for the setup event and create rooms
            chat.on('setup', function (data) {
                console.log("socket.io: setup ");
                // console.log("socket.io: setup " + JSON.stringify(data));
                $scope.rooms = data.rooms;
                // if (true || data.rooms.length > 0) {
                //     $scope.username = $scope.inputUser;
                //     console.log($scope.selected);
                //     // $scope.selected.group = $scope.room = data.rooms[0];
                //     console.log($scope.selected.group);
                //     $http.get('/chat/messages')
                //         .then(function (resp) {
                //             var msgs = resp.data;
                //             console.log(msgs);
                //             // $scope.messages = msgs;
                //             if (msgs instanceof Array) {
                //                 //     for (var i = 0; i < 3; i++) {
                //                 // $scope.rooms.groups.push({name: 'group' + i, messages: msgs})
                //                 // $scope.rooms.conversations.push({name: 'conversation' + i, messages: msgs})
                //                 // }
                //             }
                //             else
                //                 init();
                //         });
                // } else {
                //     $http.post("/users/logout")
                //         .then(function good(resp) {
                //             console.log("POST /logout response");
                //             init();
                //         }, function bad(resp) {
                //             init();
                //         });
                // }
            });


            chat.on('message', function (data) {
                console.log("socket.io: message");
                //Push to new message to our $scope.messages
                // $scope.messages.push(data);
                try {
                    var index = $scope.rooms[data.room.kind + 's'].findIndex((obj => obj._id === data.room.name));
                    if (index > -1) {
                        var msgs = $scope.rooms[data.room.kind + 's'][index].messages;
                        if (!msgs) {
                            $scope.rooms[data.room.kind + 's'][index].messages = [];
                        }
                        $scope.rooms[data.room.kind + 's'][index].messages.push(data);
                        try {
                            var elm = $('#' + data.room.name);
                            $timeout(function () {
                                elm.scrollTop(elm[0].scrollHeight);
                            }, 100);
                        }
                        catch
                            (err) {
                            // alert(err);
                        }
                        // $scope.messages[data.room.kind + 's'][index].username =
                        //     $scope.messages[index].username + '1';
                    }
                }
                catch
                    (err) {
                    alert(err);
                }
            });

            chat.on('message update', function (data) {
                console.log("socket.io: message update");
                try {
                    var index = $scope.rooms[data.room.kind + 's'].findIndex((obj => obj._id == data.room.name));
                    if (index > -1) {
                        var msgs = $scope.rooms[data.room.kind + 's'][index].messages;
                        index = msgs.findIndex(obj => obj._id == data._id);
                        if (index > -1) {
                            msgs[index] = data;
                        }
                    }
                }
                catch
                    (err) {
                    alert(err);
                }
            });

            chat.on('general message', function (data) {
                console.log("socket.io: general message");
                //Push to new message to our $scope.messages
                $scope.rooms.general.messages.push(data);
                try {
                    var elm = $('#generalMessage');
                    $timeout(function () {
                        elm.scrollTop(elm[0].scrollHeight);
                    }, 100);
                }
                catch
                    (err) {
                    // alert(err);
                }
            });

            chat.on('general message update', function (data) {
                console.log("socket.io: v message update");
                try {
                    var index = $scope.rooms.general.messages.findIndex((obj => obj._id == data._id));
                    if (index > -1) {
                        $scope.rooms.general.messages[index] = data;
                    }
                }
                catch
                    (err) {
                    alert(err);
                }
            });

            chat.on('user registered', function (data) {
                console.log("socket.io: system message");
                $scope.rooms.system.messages.push(data);
                $scope.changeRoom('', 'system');
                $scope.chatPanel.content = 'systemMessage';
                // var attach = alert(JSON.stringify(data));
                // $scope.attachUser(attach, data);
                try {
                    var elm = $('#systemMessage');
                    $timeout(function () {
                        elm.scrollTop(elm[0].scrollHeight);
                    }, 100);
                }
                catch
                    (err) {
                    // alert(err);
                }
            });

            chat.on('system message', function (data) {
                console.log("socket.io: system message");
                $scope.rooms.system.messages.push(data);
                $scope.changeRoom('', 'system')
                $scope.chatPanel.content = 'systemMessage';
                try {
                    var elm = $('#systemMessage');
                    $timeout(function () {
                        elm.scrollTop(elm[0].scrollHeight);
                    }, 100);
                }
                catch
                    (err) {
                    // alert(err);
                }
            });

            chat.on('system message update', function (data) {
                console.log("socket.io: system message update");
                try {
                    var index = $scope.rooms.system.messages.findIndex((obj => obj._id == data._id));
                    if (index > -1) {
                        $scope.rooms.system.messages[index] = data;
                    }
                }
                catch
                    (err) {
                    alert(err);
                }
            });

            chat.on('user message', function (data) {
                console.log("socket.io: user message");
                //Push to new message to user room messages
                $scope.rooms.user.messages.push(data);
                $scope.chatPanel.content = 'userMessage';
                $scope.chatPanel.room = '';
                // $scope.changeRoom(user._id, 'user');
                try {
                    var elm = $('#userMessage');
                    $timeout(function () {
                        elm.scrollTop(elm[0].scrollHeight);
                    }, 100);
                }
                catch
                    (err) {
                    // alert(err);
                }
            });

            chat.on('user message update', function (data) {
                console.log("socket.io: user message update");
                try {
                    var index = $scope.rooms.user.messages.findIndex((obj => obj._id == data._id));
                    if (index > -1) {
                        $scope.rooms.user.messages[index] = data;
                    }
                }
                catch
                    (err) {
                    alert(err);
                }
            });

            chat.on('newConversation', function (data) {
                $scope.rooms.conversations.push(data);
                // $scope.changeRoom(data._id, 'conversation');
                // chat.emit('newConversation', $scope.msg);
            });

            chat.on('addConversation', function (data) {
                $scope.rooms.conversations.push(data);
                chat.emit('join conversation', data._id);
            });


            chat.on('join group', function (data, fn) {
                alert(JSON.stringify(data));
                fn({success: true});
            });

            chat.on('add group', function (data,) {
                $scope.rooms.groups.push(data);
                chat.emit('add group', data._id);
            });

            chat.on('remove group', function (data,) {
                var index = $scope.rooms.groups.findIndex((obj => obj._id === data));
                if (index > -1) {
                    $scope.rooms.groups.splice(index, 1);
                }
                chat.emit('remove group', data);
            });

            chat.on('like', function (data) {
                console.log("socket.io: like");
                //Push to new message to our $scope.messages
                $scope.messages.push(data);
            });

            // chat.on('joined', function (data) {
            //     console.log("socket.io: joined");
            //     if (data.username != $scope.username) {
            //         var message = {username: data.username, content: "joined the room"}
            //         $scope.messages.push(message);
            //         console.log(JSON.stringify($scope.messages));
            //     }
            // });

            // chat.on('left', function (data) {
            //     console.log("socket.io: joined");
            //     if (data.username != $scope.username)
            //         var message = {username: data.username, content: "left the room"}
            //     $scope.messages.push(message);
            //     console.log(JSON.stringify($scope.messages));
            // });

            chat.on("disconnect", function () {
                console.log("server disconnected");
                chat.deactivate(function () {
                    init();
                });
            });
        }

        function init() {
            //Global Scope
            $scope.messages = [];
            $scope.room = "";
            $scope.rooms = {};
            $scope.username = "";
            $scope.inputUser = "";
            $scope.message = "";
            $scope.selected = {group: ""};

        }

        init();
        console.log("Init MainCtrl");

        function change() {
            console.log("SWITCH: " + $scope.selected.group);
            $http.get('/msgs?room=' + $scope.selected.group)
                .then(function (resp) {
                    var msgs = resp.data;
                    console.log(msgs);
                    if (msgs instanceof Array) {
                        $scope.room = $scope.selected.group;
                        chat.emit('switch', {username: $scope.username, newRoom: $scope.room});
                        $scope.messages = msgs;
                    }
                    else
                        $scope.selected.group = $scope.room;
                });
        }

        function send() {
            if (!chat.isActive()) {
                alert('Please login first!');
                initChat();
                return;
            }
            if ($scope.msg.content == '') {
                alert('The message is empty!!!');
                return;
            }
            if ($scope.chatPanel.content === 'generalMessage') {
                $scope.msg.author = $rootScope.user._id;
                chat.emit('generalMessage', $scope.msg);
                //reset the message area
                $scope.newConversation = {};
                $scope.msg.content = "";
                $scope.msg.type = '';
                return;
            }
            if ($scope.newConversation.forAllUsers) {
                $scope.msg.author = $rootScope.user._id;
                $scope.chatPanel.content = 'generalMessage';
                $scope.changeRoom('', 'general');
                chat.emit('generalMessage', $scope.msg);
                //reset the message area
                $scope.newConversation = {};
                $scope.msg.content = "";
                $scope.msg.type = '';
                return;
            }
            if ($scope.chatPanel.content === 'newConversation') {
                $scope.msg.author = $rootScope.user._id;
                chat.emit('newConversation', {conversation: $scope.newConversation, msg: $scope.msg}, function (data) {
                    if (data.success) {
                        // $scope.rooms.conversations.push(data.data);
                        $scope.chatPanel.content = '';
                        $scope.changeRoom(data.data._id, 'conversation');
                        // chat.emit('newConversation', $scope.msg);
                    } else {
                        alert(data.message);
                    }
                });
                //reset the message area
                $scope.newConversation = {};
                $scope.msg.content = "";
                $scope.msg.type = '';
                return;
            }
            //Notify the server that there is a new message with the message as packet
            $scope.msg.author = $rootScope.user._id;
            chat.emit('message', $scope.msg);
            //reset the message area
            $scope.msg.content = "";
            $scope.msg.type = '';
        };


        function editUser(selectedUser) {
            var editUser = selectedUser;
            console.log(editUser);
            var modalInstance = $modal.open({
                templateUrl: '/user/editUser',
                controller: ModalInstanceCtrl3,
                resolve: {
                    locations: function () {
                        return editUser;
                    }
                },
                scope: $scope.$new()
            });
            modalInstance.result.then(function (selectedItem) {
                console.log('selectedItem: ' + selectedItem);
                $http.post('/api/user/updateUser', selectedItem)
                    .then(function (res) {
                        alert('Success: ' + res.data);
                    }, function (res) {
                        alert('Error: ' + res.data);
                    });
                getUsers();
            }, function () {
                console.log('Modal dismissed at: ' + new Date());
            });
        }

        function ModalInstanceCtrl3($scope, $modalInstance, locations) {
            // $scope.input = angular.copy(locations);
            $scope.eUsr = locations;
            console.log(locations);
            $scope.ok = function () {
                $modalInstance.close($scope.eUsr);
            };

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        };

//----------------------------------

        var self = this;

        // list of `state` value/display objects
        self.states = loadAll();
        self.selectedItem = null;
        self.searchText = null;
        self.querySearch = querySearch;

        // ******************************
        // Internal methods
        // ******************************

        /**
         * Search for states... use $timeout to simulate
         * remote dataservice call.
         */
        function querySearch(query) {
            var results = query ? self.states.filter(createFilterFor(query)) : self.states;
            var deferred = $q.defer();
            $timeout(function () {
                deferred.resolve(results);
            }, Math.random() * 1000, false);
            return deferred.promise;
        }

        /**
         * Build `states` list of key/value pairs
         */
        function loadAll() {
            var allStates = 'Alabama, Alaska, Arizona, Arkansas, California, Colorado, Connecticut, Delaware,\
              Florida, Georgia, Hawaii, Idaho, Illinois, Indiana, Iowa, Kansas, Kentucky, Louisiana,\
              Maine, Maryland, Massachusetts, Michigan, Minnesota, Mississippi, Missouri, Montana,\
              Nebraska, Nevada, New Hampshire, New Jersey, New Mexico, New York, North Carolina,\
              North Dakota, Ohio, Oklahoma, Oregon, Pennsylvania, Rhode Island, South Carolina,\
              South Dakota, Tennessee, Texas, Utah, Vermont, Virginia, Washington, West Virginia,\
              Wisconsin, Wyoming';

            return allStates.split(/, +/g).map(function (state) {
                return {
                    value: state.toLowerCase(),
                    display: state
                };
            });
        }

        /**
         * Create filter function for a query string
         */
        function createFilterFor(query) {
            var lowercaseQuery = angular.lowercase(query);

            return function filterFn(state) {
                return (state.value.indexOf(lowercaseQuery) === 0);
            };

        }


    }
})
();