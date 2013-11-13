'use strict';

var dashboardApp = angular.module('dashboardApp', [
    'dashboardControllers'
  ]
);
/*
.config(['$routeProvider',
  function($routeProvider) {
      console.log("app config");
      $routeProvider.
          when('/statman', {
              controller: 'DashboardCtrl',
              template
          }).
          otherwise({
              redirectTo: '/statman'
          });
  }]
);
*/