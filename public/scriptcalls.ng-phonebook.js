/* global BASE_APP */
(function(){
    var BASE_URL='/engine/contacts/';
    var BASE_URL_SUFFIX='';

    BASE_APP.directive('phonebookTable', function(){
        return{
            restrict:'E',
            templateUrl:'/components/ctrlPhonebookTable.html'
        };
    });

    BASE_APP.directive('phonebookData', function(){
        return{
            restrict:'E',
            templateUrl:'/components/ctrlPhonebookData.html'
        };
    });

    BASE_APP.directive('focus', function($timeout){
        return function(scope, elements){
                var firstFocus=function(value){
                    if(!value){
                        $timeout(function(){
                            elements[0].focus();
                            elements[0].select();
                        });
                    }
                }
                scope.$watch('toggleForm', firstFocus, true);
                scope.$watch('viewOnly', firstFocus, true);
            }
    });

    BASE_APP.controller('ctrlPhonebook', ['$scope', '$http', '$localStorage', function($scope, $http, $localStorage){
            $scope.$contactsMeta=$localStorage? $localStorage.$default({last_synced: null, r_index:[], triggers: []}): {last_synced: null, r_index:[], triggers: []};
            $scope.$contactsStore=$localStorage? $localStorage.$default({phonebook: null}): {phonebook: null};
            $scope.$contactsCurr=null;
            $scope.viewOnly=false;
            $scope.invalidEmail=false;
            $scope.toggleForm=true;

            function SyncTriggerAgent(doAdd, doUpdate, doDelete){
                this.doAdd=doAdd? true: false;
                this.doUpdate=doUpdate? true: false;
                this.doDelete=doDelete? true: false;
                this.timestamp=new Date();
                this.payload=new Object();
                return this;
            }

            //TOGGLES : MDD
            $scope.enterAdd=function(){
                $scope.$contactsCurr=new Object();
                $scope.phone=null;
                $scope.viewOnly=false;
                $scope.invalidEmail=false;
                $scope.toggleForm=false;
            };


            //METHODS : MEDIATORS
            $scope.applyPhoneNumber=function(e){
                var num=$(e.target).val();
                if(!isNaN(num) && num>1000000000 && num<9999999999)
                    $scope.$contactsCurr.phone=('('+ num.substr(0, 3) +') '+ num.substr(3, 3) +'-'+ num.substr(6, 4));
                return null;
            };

            $scope.checkUniqueContact=function(e){
                if($scope.$contactsCurr && !($scope.$contactsCurr.id)){
                    $http.get((BASE_URL +'check/'+ $(e.target).val()))
                        .success(function(response){
                            if(response.answer>0){
                                $(e.target).val('');
                                $scope.invalidEmail=true;
                            }else{
                                angular.forEach($scope.$contactsStore.phonebook, function(contact, ix){
                                    if(contact.email==$(e.target).val()){
                                        $(e.target).val('');
                                        $scope.invalidEmail=true;
                                    }
                                });
                            }
                        });
                }
            };

            $scope.requestSync=function(e){
                var tDateTime=(new Date());
                var restoreText=$(e.target).text();
                $(e.target).text('Syncing..');
                $http.post(BASE_URL +'sync/', {r_index:$scope.$contactsMeta.r_index, triggers:$scope.$contactsMeta.triggers})
                            .then(function(){
                                    $scope.$contactsMeta.r_index.length=0;
                                    $scope.$contactsMeta.triggers.length=0;
                                    $scope.$contactsStore.phonebook=null;
                                    $.get(window.location).success(function(){
                                                                    $scope.$contactsMeta.last_synced=$.datepicker.formatDate('mm/dd/yy', tDateTime) +' '+ ('0'+ tDateTime.getHours()).slice(-2) +':'+ ('0'+ tDateTime.getMinutes()).slice(-2) +' '+ ((tDateTime.getHours()>12)? 'PM': 'AM');
                                                                    $(e.target).text(restoreText);
                                                                    $scope.init();
                                                                });
                                });
            };


            //METHODS : OPERATIONS
            $scope.reload=function(){
                $http.get(BASE_URL+BASE_URL_SUFFIX)
                        .then(function(response){
                                $scope.$contactsStore.phonebook=response.data;
                            });
            };

            $scope.init=function(){
                if($scope.$contactsStore.phonebook===null || $scope.$contactsStore.phonebook==='') $scope.reload();
                $scope.predicate='name';
                $scope.$contactsCurr=null;
                $scope.invalidEmail=false;
                $scope.toggleForm=true;
                if($scope.frmX) $scope.frmX.$setPristine();
                isTableLoaded=true;
            };

            $scope.add=function(){
                if($localStorage){
                    var sta=new SyncTriggerAgent(true, null, null);
                    var newID=$scope.$contactsStore.phonebook.length+1;
                    angular.forEach($scope.$contactsStore.phonebook, function(contact, ix){
                        if(contact.id>=newID)
                            newID=contact.id+1;
                    });
                    $scope.$contactsCurr.id=newID;
                    sta.payload=angular.copy($scope.$contactsCurr);
                    $scope.$contactsMeta.r_index.push({localID:newID, remoteID:0});
                    $scope.$contactsMeta.triggers.push(sta);
                    $scope.$contactsStore.phonebook.push($scope.$contactsCurr);
                    $scope.init();
                }else{
                    $http.post(BASE_URL, $scope.$contactsCurr)
                            .then(function(){
                                    $scope.init();
                                });
                }
            };

            $scope.fetch=function(contact_id, readonly){
                var loadContact=function(contact){
                    $scope.$contactsCurr=angular.copy(contact);
                    $scope.phone=$scope.$contactsCurr.phone.toString().match(/\d+/g).join([]);
                    $scope.viewOnly=(readonly || false);
                    $scope.invalidEmail=false;
                    $scope.toggleForm=false;
                }

                if($localStorage){
                    angular.forEach($scope.$contactsStore.phonebook, function(contact, ix){
                        if(contact.id===contact_id)
                            loadContact(contact);
                    });
                }else{
                    $http.get(BASE_URL+contact_id)
                            .then(function(response){
                                    loadContact(response.data);
                                });
                }
            };

            $scope.update=function(contact_id){
                if($localStorage){
                    angular.forEach($scope.$contactsStore.phonebook, function(contact, ix){
                        if(contact.id===contact_id){
                            var sta=new SyncTriggerAgent(null, true, null);
                            sta.payload=angular.copy($scope.$contactsCurr);
                            $scope.$contactsMeta.triggers.push(sta);
                            $scope.$contactsStore.phonebook[ix]=$scope.$contactsCurr;
                            $scope.init();
                        }
                    });
                }else{
                    $http.put(BASE_URL+contact_id, $scope.$contactsCurr)
                            .then(function(){
                                    $scope.init();
                                });
                }
            };

            $scope.remove=function(contact_id){
                if(confirm('Are you sure you want to delete?')){
                    if($localStorage){
                        angular.forEach($scope.$contactsStore.phonebook, function(contact, ix){
                            if(contact.id===contact_id){
                                var sta=new SyncTriggerAgent(null, null, true);
                                sta.payload=angular.copy(contact);
                                $scope.$contactsMeta.triggers.push(sta);
                                $scope.$contactsStore.phonebook.splice(ix, 1);
                                $scope.init();
                            }
                        });
                    }else{
                        $http.delete((BASE_URL+contact_id))
                                .success(function(){
                                        $scope.init();
                                    });
                    }
                }
            };
        }]);
})();


