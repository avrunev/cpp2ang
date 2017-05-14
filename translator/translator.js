'use strict';

angular.module('myApp.view1', ['ngRoute','execAPI'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/view1', {
            templateUrl: 'view1.html',
            controller: 'view1Ctrl'
        });
    }])

    .controller('view1Ctrl', ['$scope', '$http', '$interval','$sce','apiCiu', function ($scope, $http, $interval, $sce, apiCiu) {

        $scope.trustAsHtml = function(value) {
            return $sce.trustAsHtml(value);
        };

        $scope.current_level = {};

        apiCiu.func('decanatuser.ohop_on_site_pkg.get_levels',{}).success(
            function (data) {
                $scope.data_levels = data;
            }
        );

        $scope.curr_grdOptions = {
            enableRowSelection: true,
            enableRowHeaderSelection: false,
            multiSelect: false,
            modifierKeysToMultiSelect: false,
            noUnselect: true,
            enableFiltering: true,
            columnDefs:  [

                
                    { 
                         field:'ID_CURRICULUM', 
                    
                         maxWidth:80, 
                    
                         id:'â„–', 
                     } , 
                
                    { 
                         field:'OKSO_STR', 
                    
                         id:'ÐÐ°Ð¿Ñ€Ð°Ð²Ð»ÐµÐ½Ð¸Ðµ', 
                     } , 
                
                    { 
                         field:'PROFILE_DIRECTION', 
                    
                         id:'ÐŸÑ€Ð¾Ñ„Ð¸Ð»ÑŒ', 
                     } , 
                
                    { 
                         field:'FACULTET', 
                    
                         maxWidth:80, 
                    
                         id:'Ð¤Ð°ÐºÑƒÐ»ÑŒÑ‚ÐµÑ‚', 
                     } , 
                
                    { 
                         field:'YEAR_ENROL', 
                    
                         maxWidth:80, 
                    
                         id:'Ð“Ð¾Ð´', 
                     } 
                


                { field: 'ID_CURRICULUM', displayName: '¹', maxWidth: 80},
                { field: 'OKSO_STR', displayName: 'Íàïðàâëåíèå' },
                { field: 'PROFILE_DIRECTION' , displayName: 'Ïðîôèëü' },
                { field: 'FACULTET' , displayName: 'Ôàêóëüòåò', maxWidth: 100 },
                { field: 'YEAR_ENROL', displayName: 'Ãîä', maxWidth: 80}
            ],
        onRegisterApi: function (gridApi) {
                $scope.curr_grdApi = gridApi;
            }
        };


        apiCiu.func('decanatuser.ohop_on_site_pkg.get_currs',[0,0]).success(
            function (data) {
               $scope.curr_grdOptions.data = data;
            }
        );

        $scope.files_grdOptions = {
            enableRowSelection: true,
            enableRowHeaderSelection: false,
            multiSelect: false,
            modifierKeysToMultiSelect: false,
            noUnselect: true,
            enableFiltering: true,
            columnDefs:  [
                
                     { field: 'NAME' , displayName: 'Ð¢Ð¸Ð¿'  }, 
                
                     { field: 'PUBLISH_DATE' , displayName: 'Ð”Ð°Ñ‚Ð° Ð·Ð°Ð³Ñ€ÑƒÐ·ÐºÐ¸'  }
                    
                

                { field: 'NAME', displayName: 'Òèï', minWidth: 120},
                { field: 'PUBLISH_DATE', displayName: 'Äàòà çàãðóçêè' }
            ],
            onRegisterApi: function (gridApi) {
                $scope.files_grdApi = gridApi;
    }
        };

        $scope.curr_grdClick = function(){
            var rows = $scope.curr_grdApi.selection.getSelectedRows();
            $scope.id_curriculum = rows[0]["ID_CURRICULUM"];
            apiCiu.func('decanatuser.ohop_on_site_pkg.get_curr_files',[$scope.id_curriculum]).success(
                function (data) {
                    $scope.files_grdOptions.data = data;
                }
            );
        }

    }]).filter('propsFilter', function () {
    //ôèëüòðàöèÿ â âûïàäàþùåì ñïèñêå
    return function (items, props) {
        var out = [];

        if (angular.isArray(items)) {
            var keys = Object.keys(props);

            items.forEach(function (item) {
                var itemMatches = false;

                for (var i = 0; i < keys.length; i++) {
                    var prop = keys[i];
                    var text = props[prop].toLowerCase();
                    if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                        itemMatches = true;
                        break;
                    }
                }

                if (itemMatches) {
                    out.push(item);
                }
            });
        } else {
            // Let the output be the input untouched
            out = items;
        }

        return out;
    };
});