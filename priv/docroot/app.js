'use strict';

var dashboardApp = angular.module('dashboardApp', [
    'dashboardControllers'
  ]
).directive('simpleTable', function() {
       return {
            restrict: 'A',
            link: function($scope, $element, $attrs) {
                var data = $scope.$eval($attrs.data);
                var colsWatcher = function(newCol, oldCol) {
                    if (newCol !== oldCol) {
                        $element.html("");
                        var cols = $.extend([], newCol);
                        var header = "<thead><tr>";
                        angular.forEach(cols, function(c) {
                            if (c.headerClass != undefined) {
                                header += "<th class=\"" + c.headerClass + "\">" + c.label +"</th>";
                            } else {
                                header += "<th>" + c.label +"</th>";
                            }
                        });
                        header += "</tr></thead>";
                        $element.append(header);
                    }
                };
                $scope.$watch(data.columns, colsWatcher);

                var rowsWatcher = function(newRow, oldRow) {
                    if (newRow !== oldRow) {
                        var rows = $.extend([], newRow);
                        var body = "<tbody>";
                        angular.forEach(rows, function(row) {
                            body += "<tr>";
                            angular.forEach(row, function(cell, field) {
                                if (field != "key") {
                                    body += "<td style=\"text-align:right\">" + cell +"</td>";
                                } else {
                                    body += "<td>" + cell +"</td>";
                                }
                            });
                            body += "</tr>";
                        });
                        body += "</tbody>";
                        $element.append(body);
                    }
                };
                $scope.$watch(data.rows, rowsWatcher);
            }
       }
}).directive('simpleGroupedTable', function() {
       return {
            restrict: 'A',
            link: function($scope, $element, $attrs) {
                var data = $scope.$eval($attrs.data);

                var formatNumber = function(value) {
                    return (value == "") ? value : numeral(value).format('0,0');
                };

                var colsWatcher = function(newCol, oldCol) {
                    if (newCol !== oldCol) {
                        $element.html("");
                        var cols = $.extend([], newCol);
                        var header = "<thead><tr>";
                        angular.forEach(cols, function(c) {
                            if (c.headerClass != undefined) {
                                header += "<th class=\"" + c.headerClass + "\">" + c.label +"</th>";
                            } else {
                                header += "<th>" + c.label +"</th>";
                            }
                        });
                        header += "</tr></thead>";
                        $element.append(header);
                    }
                };
                $scope.$watch(data.columns, colsWatcher);

                var rowsWatcher = function(newRow, oldRow) {
                    if (newRow !== oldRow) {
                        var groups = $.extend([], newRow);
                        var body = "<tbody>";
                        angular.forEach(groups, function(group) {
                            body += "<tr>";
                            body += "<td colspan=\"9\"><strong>" + group.label + "</strong></td>";
                            body += "</tr>";
                            angular.forEach(group.items, function(row) {
                                body += "<tr>";
                                angular.forEach(row, function(cell, field) {
                                    if (field != "key") {
                                        body += "<td style=\"text-align:right\">" + cell +"</td>";
                                    } else {
                                        body += "<td colspan=\"2\" style=\"padding-left: 25px;\">" + cell +"</td>";
                                    }
                                });
                                body += "</tr>";
                            });
                        });
                        body += "</tbody>"
                        $element.append(body);
                    }
                };
                $scope.$watch(data.rows, rowsWatcher);
            }
       }
});