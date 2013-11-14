'use strict';

var dashboardControllers = angular.module('dashboardControllers', []);
dashboardApp.controller('DashboardCtrl', ["$scope",
   function DashboardCtrl($scope) {

       $scope.histograms = [];

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

           // merged and node histagrams
           var histograms = $scope.getByType(data, "histogram");
           $scope.histograms = $scope.histograms.concat(histograms);

           $scope.mergedHistograms = $scope.postProcessHistograms($scope.histograms);
           $scope.nodesHistograms = $scope.postProcessNodesHistograms($scope.histograms);
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
       $scope.postProcessHistograms = function(data) {
           var histograms = _.filter(data, function (h) {
               return h.node instanceof Array
           });
           //console.dir(histograms);
           var grouped = _.groupBy(histograms, function (h) {
               return h.id;
           });
           //console.dir(grouped);
           var result = [];

           _.each(grouped, function (grouped, i) {
               //console.dir(grouped);
               //var items = histograms[i];
               //result.push({"histogram": histograms[i]['id'], "values": items});
           });
           return result;
       };
       $scope.postProcessNodesHistograms = function(data) {
           var histograms = _.reject(data, function (h) {
               return h.node instanceof Array
           });
           var nodes = _.uniq(_.pluck(histograms, 'node')).sort();
           var result = [];

           _.each(nodes, function (node) {
               var grouped = _.groupBy(
                   _.filter(histograms, function (h) {
                       return h.node == node;
                   }),
                   function (h) { return h.id }
               );
               _.each(nodes, function (node) {
                   _.each(grouped, function (grouped, i) {
                       var items = [];
                       var label = node + ": " + i;
                       _.each(grouped, function (g) {
                           items.push(g);
                       });
                       result.push({"label": label, "items": items});
                   });
               });
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