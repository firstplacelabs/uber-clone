angular.module('starter.filters', [])
// filter is used to strip out pieces of the place_name for address display
.filter('split', function() {
    return function(input, splitChar, splitIndex) {
        // do some bounds checking here to ensure it has that index
        return input.split(splitChar)[splitIndex];
    }
});