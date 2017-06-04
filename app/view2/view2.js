'use strict';

angular.module('myApp.view2', ['ngRoute','execAPI'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/view2', {
            templateUrl: 'view2/view2.html',
            controller: 'View2Ctrl'
        });
    }])

    .controller('View2Ctrl', ['$scope', '$http', '$interval','$sce','apiCiu', function ($scope, $http, $interval, $sce, apiCiu) {

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
                { field: 'ID_CURRICULUM', displayName: '№', maxWidth: 80},
                { field: 'OKSO_STR', displayName: 'Направление' },
                { field: 'PROFILE_DIRECTION' , displayName: 'Профиль' },
                { field: 'FACULTET' , displayName: 'Факультет', maxWidth: 100 },
                { field: 'YEAR_ENROL', displayName: 'Год', maxWidth: 80}
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

        //обработчик на изменение lookup
        $scope.levelsChange = function(levels_selected){
            apiCiu.func('decanatuser.ohop_on_site_pkg.get_currs',[levels_selected['KEY2'],0]).success(
                function (data) {
                    $scope.curr_grdOptions.data = data;
                }
            );
        };
        //новый обработчик на щелчок
        $scope.curr_grdClick = function(){
            $scope.dlg =
                ngDialog.open({ template: 'view2/dialog2.xml',
                    className: 'ngdialog-theme-default',
                    scope: $scope,
                    width: '60%' ,
                    //height:  '400px',
                    closeByDocument: false});  
        };

    }]).filter('propsFilter', function () {
    //фильтрация в выпадающем списке
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