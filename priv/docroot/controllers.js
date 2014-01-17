'use strict';

var dashboardControllers = angular.module('dashboardControllers', []);
dashboardApp.controller('DashboardCtrl', ["$scope",
   function DashboardCtrl($scope) {
       // table data definitions
       $scope.ratesGrid = {rows: 'ratesRows', columns: 'ratesCols'};
       $scope.gaugesGrid = {rows: 'gaugesRows', columns: 'gaugesCols'};
       $scope.histNodesGrid = {rows: 'histNodesRows', columns: 'histCols'};
       $scope.histMergedGrid = {rows: 'histMergedRows', columns: 'histCols'};

       $scope.cachedHists = [];

       // reload data from stream
       var stream = new EventSource("statman/stream");
       stream.addEventListener("message", function (e) {
           $scope.$apply(function() {
               $scope.updateUI($.parseJSON(e.data));
           });
       }, false);

       //TODO: update only what needs to be updated!!!
       $scope.updateUI = function (data) {
           // general
           $scope.hostname = data.hostname;

           // rates
           var rates = $scope.getByType(data, "counter");
           var ratesNodes = $scope.getNodes(rates);
           $scope.ratesCols = $scope.getNodeColumns(ratesNodes);
           $scope.ratesRows = $scope.postProcessData(ratesNodes, rates);

           // gauges
           var gauges = $scope.getByType(data, "gauge");
           var gaugesNodes = $scope.getNodes(gauges);
           $scope.gaugesCols = $scope.getNodeColumns(gaugesNodes);
           $scope.gaugesRows = $scope.postProcessData(gaugesNodes, gauges);

           // merged and node histagrams
           var histograms = $scope.getByType(data, "histogram");
           //console.dir(histograms);
           $scope.cachedHists = $scope.mergeHistograms($scope.cachedHists, histograms);
           console.dir($scope.cachedHists);

           $scope.histCols = $scope.getHistogramColumns();
           $scope.histNodesRows = $scope.postProcessNodesHistograms(histograms);
           $scope.histMergedRows = $scope.postProcessHistograms(histograms);
       };

       //TODO: key/host is unique value
       $scope.mergeHistograms = function(a, b) {
           var result = [];
           for (var i = 0; i < b.length; i++) {
               if (a.length > 0) {
                   for (var y = 0; y < a.length; y++) {
                       if (a[y].key == b[i].key) {
                           result.push(b[i]);
                       } else {
                           result.push(a[i]);
                       }
                   }
               } else {
                   result.push(b[i]);
               }
           }
           return result;
       };

       // helpers
       $scope.postProcessData = function(nodes, data) {
           var grouped = _.groupBy(data, "key");
           var keys = _.keys(grouped).sort();
           var result = [];

            _.each(keys, function (key) {
                var row = new Object();
                row.key = key;
                _.each(nodes, function (node, i) {
                    var d = _.find(grouped[key], function (c) {
                        return c.node == node;
                    });
                    if(d) {
                        row["node" + i] = $scope.formatNumber(
                            (d.rate != undefined) ? d.rate : d.value
                        );
                    } else {
                        row["node" + i] = "";
                    }
                });
                result.push(row);
           });
           return result;
       };
       //TODO: handle only updates
       $scope.postProcessHistograms = function(data) {
           var histograms = _.filter(data, function (h) {
               return h.node instanceof Array
           });
           var grouped = _.groupBy(histograms, function (h) {
               return h.id;
           });
           var result = [];

           _.each(grouped, function (grouped, i) {
               result.push(
                   $scope.getHistogramRow(grouped[0].id, grouped)
               );
           });
           return result;
       };
       //TODO: handle only updates
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
               _.each(grouped, function (grouped, i) {
                   var label = (i == "null") ? node + "/unknown" : node + i;
                   result.push(
                       $scope.getHistogramRow(label, grouped)
                   );
               });
           });
           return result;
       };
       $scope.getHistogramRow = function (label, grouped) {
           var row = new Object();
           row.label = label;
           row.items = [];
           _.each(grouped, function (group) {
               row.items.push({
                   "key":  group.key,
                   "rate": $scope.formatNumber(group.rate),
                   "observations": $scope.formatNumber(group.observations),
                   "mean": $scope.formatMs(group.mean),
                   "sd":   $scope.formatNumber(group.sd),
                   "p95":  $scope.formatMs(group.p95),
                   "p99":  $scope.formatMs(group.p99),
                   "max":  $scope.formatMs(group.max)
               });
           });
           return row;
       };

       // columns builders
       $scope.getNodeColumns = function(nodes) {
           var columns = [{label: 'Key', field: 'key'}];
           _.each(nodes, function(node, i) {
               columns.push({label: node,
                             field: "node" + i,
                             headerClass: "alignRight"
                            });
           });
           return columns;
       };
       $scope.getHistogramColumns = function() {
           return [{label: ""}, {label: ""},
                   {label: "Rate per second", headerClass: "alignRight"},
                   {label: "Observations",    headerClass: "alignRight"},
                   {label: "Mean (ms)",       headerClass: "alignRight"},
                   {label: "Standard deviation", headerClass: "alignRight"},
                   {label: "95th (ms)",       headerClass: "alignRight"},
                   {label: "99th (ms)",       headerClass: "alignRight"},
                   {label: "Max (ms)",        headerClass: "alignRight"}
                  ];
       };

       // data helpers
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

       // formatting helpers
       $scope.formatMs = function (value) {
           return numeral( (value / 1000).toFixed(4) ).format('0,0.0000');
       };
       $scope.formatNumber = function (value) {
           if (value % 1 != 0) {
               return numeral(value).format('0,0.0000');
           } else {
               return numeral(value).format('0,0');
           }
       };
   }
]);