'use strict';

angular.module('myApp.{{js_name}}', ['ngRoute','execAPI'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/{{js_name}}', {
            templateUrl: '{{js_name}}.html',
            controller: '{{js_name}}Ctrl'
        });
    }])

    .controller('{{js_name}}Ctrl', ['$scope', '$http', '$interval','$sce','apiCiu', function ($scope, $http, $interval, $sce, apiCiu) {

        $scope.trustAsHtml = function(value) {
            return $sce.trustAsHtml(value);
        };

        $scope.current_level = {};

        apiCiu.func('{{levels}}',{}).success(
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
                {% for col in curr_grd[1] %}
                    { {% for item in col %}
                        {% if item!='maxWidth' and item!='minWidth' %} {{item}}:'{{col[item]}}', {% else %} {{item}}:{{col[item]}}, {% endif %}
                    {% endfor %} } {% if col!=curr_grd[1][-1] %}, {% endif %}
                {% endfor %}

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


        apiCiu.func('{{curr_grd[0]}}',[{{get_currs}}]).success(
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
                {% for col in files_grd[1] %}
                    {% if col!=files_grd[1][-1] %} { field: '{{col.field}}' , displayName: '{{col.id}}' {% if col.minwidth %}, minWidth: {{col.minwidth}} {% endif %} }, {% else %} { field: '{{col.field}}' , displayName: '{{col.id}}' {% if col.minwidth %}, minWidth: {{col.minwidth}} {% endif %} }
                    {% endif %}
                {% endfor %}

                { field: 'NAME', displayName: 'Тип', minWidth: 120},
                { field: 'PUBLISH_DATE', displayName: 'Дата загрузки' }
            ],
            onRegisterApi: function (gridApi) {
                $scope.files_grdApi = gridApi;
    }
        };

        $scope.curr_grdClick = function(){
            var rows = $scope.curr_grdApi.selection.getSelectedRows();
            $scope.id_curriculum = rows[0]["{{curr_grd[1][0]['field']}}"];
            apiCiu.func('{{files_grd[0]}}',[$scope.id_curriculum]).success(
                function (data) {
                    $scope.files_grdOptions.data = data;
                }
            );
        }

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
