(function () {
    'use strict';

    angular
        .module('companyProject')
    .controller('chatCtrl', chatCtrl)
    ;
    io({transports: ['websocket', 'polling']});

    chatCtrl.$inject = ['chat', '$rootScope', '$scope', '$http', '$modal', '$timeout', '$log', '$q'];

    function chatCtrl(chat, $rootScope, $scope, $http, $modal, $timeout, $log, $q) {

        // $rootScope.user = {};
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

        // $scope.change = change;
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
        //------------
        $scope.changeRoom('','general'); $scope.chatPanel.content = 'generalMessage';
        //---------------
        $scope.alert = msg =>
            alert(msg);
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
        $scope.like=function like(like,msg){
            chat.emit('like', {like: like, message: msg});
        };

        $scope.setManageGroupSelected = function setManageGroupSelected() {
            $scope.groups.selected = $scope.groups.manage.find(g => g.name == $scope.groups.selection);
        };

        function clearFlashMessage() {
            delete $scope.flash;
        }

        function initMenu() {
            clearFlashMessage();
            $http.get('/api')
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
                }, function (res) {
                    alert('Error: ' + res.data);
                    console.log('Error: ' + res.data);
                    // $scope.flash = {
                    //     message: res.data,
                    //     type: 'error'
                    // };
                });
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
            // $scope.messages = [];
            // $scope.room = "";
            $scope.rooms = {};
            // $scope.username = "";
            // $scope.inputUser = "";
            // $scope.message = "";
            // $scope.selected = {group: ""};

        }

        init();
        console.log("Init MainCtrl");

        // function change() {
        //     console.log("SWITCH: " + $scope.selected.group);
        //     $http.get('/msgs?room=' + $scope.selected.group)
        //         .then(function (resp) {
        //             var msgs = resp.data;
        //             console.log(msgs);
        //             if (msgs instanceof Array) {
        //                 $scope.room = $scope.selected.group;
        //                 chat.emit('switch', {username: $scope.username, newRoom: $scope.room});
        //                 $scope.messages = msgs;
        //             }
        //             else
        //                 $scope.selected.group = $scope.room;
        //         });
        // }

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

    }
})
();