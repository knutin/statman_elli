angular.module('ng').filter('formatNumber', function () {
    return function (value) {
        return numeral(value).format('0,0');
    }
});
angular.module('ng').filter('formatMs', function () {
    return function (value) {
        return numeral((us / 1000).toFixed(4)).format('0,0');
    }
});