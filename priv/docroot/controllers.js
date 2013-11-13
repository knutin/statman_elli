'use strict';

var dashboardControllers = angular.module('dashboardControllers', []);
dashboardApp.controller('DashboardCtrl', ["$scope",
   function DashboardCtrl($scope) {

       // reload data from stream
       var stream = new EventSource("statman/stream");
       stream.addEventListener("message", function (e) {
           $scope.$apply(function() {
               $scope.updateUI($.parseJSON(e.data));
           });
       }, false);

       $scope.updateUI = function (data) {
           // general
           $scope.hostname = data.hostname;

           // rates
           var rates = $scope.getByType(data, "counter");
           $scope.ratesNodes = $scope.getNodes(rates);
           $scope.rates = $scope.postProcessData($scope.ratesNodes, rates);

           // gauges
           var gauges = $scope.getByType(data, "gauge");
           $scope.gaugesNodes = $scope.getNodes(gauges);
           $scope.gauges = $scope.postProcessData($scope.gaugesNodes, gauges);

           //TODO: merged histagrams
           //TODO: node histagrams
       };

       // helpers
       $scope.postProcessData = function(nodes, data) {
           var grouped = _.groupBy(data, "key");
           var keys = _.keys(grouped).sort();
           var result = [];

            _.each(keys, function (key) {
                _.each(nodes, function (node) {
                    var d = _.find(grouped[key], function (c) {
                        return c.node == node;
                    });
                    if (d) {
                        result.push({"key": key, "value": d.value});
                    }
                })
           });
           return result;
       };
       $scope.getByType = function (data, type) {
           return  _.filter(data.metrics, function (m) {
               return m.type == type
           });
       };
       $scope.getNodes = function (data) {
           return _.uniq(_.map(data, function (item) {
               if (item.node instanceof Array) {
                   return item.node.sort().join(",");
               }
               return item.node
           }))
       };
    }
]);