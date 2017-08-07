angular.module('starter.directives', [])
.directive('bluedot', function ($timeout) {
    return {
            restrict:'E',
            link:function (scope, element, attrs) {
                element.addClass('user');
            scope.$watch(attrs.x, function (x) {
                element.css('left', x + 'px');
                if(x == -999)
                    element.css('display','none');
                else{
                    element.css('display','block');
                }
            });
            scope.$watch(attrs.y, function (y) {
                element.css('top', y + 'px');
            });
        }
    }
})
.directive('watchMenu', function($timeout, $ionicSideMenuDelegate) {
    return {
        restrict: 'A',
        link: function($scope, $element, $attr) {
            // Run in the next scope digest
            $timeout(function() {
                // Watch for changes to the openRatio which is a value between 0 and 1 that says how "open" the side menu is

                $scope.$watch(function() {
                        return $ionicSideMenuDelegate.getOpenRatio();
                    },
                    function(ratio) {
                        $scope.data=ratio;
                        if( ratio > 0.5 || ratio < -0.5){
                            if (window.StatusBar) {
                                StatusBar.hide();
                                ionic.DomUtil.blurAll();
                            }

                        }else{
                            if (window.StatusBar) {
                                StatusBar.show();
                            }

                        }
                        if (window.cordova && window.cordova.plugins.Keyboard) {
                            cordova.plugins.Keyboard.close();
                        }

                    });
            });
        }
    };
})
.directive('animateRatio', function($timeout, $ionicSideMenuDelegate) {

    return {
        restrict: 'A',
        scope: {
            animateRatio: '='
        },
        link: function (scope, element, attr) {

            $timeout(function () {
                scope.$watch(function () {
                        return $ionicSideMenuDelegate.getOpenRatio();
                    },
                    function (ratio) {
                        scope.animateRatio(element[0], ratio);
                    });
            });
        }
    }

});