angular.module('starter.services', [])
.service('GeoService', function($q, MapboxApi) {
    var service = {
      getAddressFromLatLng: function(lat,lng){
        var deferred = $q.defer();
          MapboxApi.reverseGeocode(lat, lng).then(function(response) {
            var place = response.data.features[0].place_name;
            if(place == undefined){     
                console.log('No results.');
            }
            else{
               deferred.resolve(place);
            }
          }, function (err) {
            deferred.reject();
          });
        return deferred.promise;
      },
      getAddressFromQuery: function(query, lat, lng){
        var deferred = $q.defer();
          MapboxApi.forwardGeocode(query, lat, lng).then(function(response) {
            var places = response.data.features;

            if(places == undefined){     
                console.log('No results.');
            }
            else{
               deferred.resolve(places);
            }
          }, function (err) {
            deferred.reject();
          });
        return deferred.promise;
      }
    };
    return service;
  })
.factory('MapboxApi', function($http, myConfig) {
  return {
        reverseGeocode: function(lat, lng) {
          return $http.get('https://api.mapbox.com/geocoding/v5/mapbox.places/' + encodeURIComponent(lng) + ',' + encodeURIComponent(lat) + '.json?types=address&access_token=' + encodeURIComponent(myConfig.apiKey));
        },
        forwardGeocode: function(query, lat, lng) {
          return $http.get('https://api.mapbox.com/geocoding/v5/mapbox.places/' + encodeURIComponent(query) + '.json?types=poi,address&autocomplete=true&proximity=' + encodeURIComponent(lng) + ',' + encodeURIComponent(lat) + '&access_token=' + encodeURIComponent(myConfig.apiKey));
        }
    }
})