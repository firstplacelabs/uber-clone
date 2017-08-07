angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicSideMenuDelegate, $timeout) {
})

.controller('MapController', function($scope, $filter, myConfig, GeoService, $http, $ionicSideMenuDelegate, leafletData) {
  
  // Init variables
  var watchPositionId;
  $scope.data = {};
  $scope.data.startAddress = '';
  $scope.data.endAddress = '';

  // Used to show user pos x,y
  $scope.user = {
    x: -999,
    y: -999
  }
  $scope.zooming = false;
  $scope.showPickupBtn = true;

  // We can choose from several tile sources for the map. The default setup is for mapbox.
  // Vist mapbox.com to get your mapbox javascript key and replace the "apikey" field.
  var tilesDict = {
      mapbox_streets: {
          name: 'Mapbox Streets',
          url : 'https://api.mapbox.com/styles/v1/mapbox/{mapid}/tiles/256/{z}/{x}/{y}?access_token={apikey}',
          type: 'xyz',
          options: {
              apikey: myConfig.apiKey,
              mapid: 'streets-v9'
          }
      }
  };
  
  // Extend angular for ui-leaflet
  angular.extend($scope, {
          myCenter: {
              lat: 0,
              lng: 0,
              zoom: 2
          },
          tiles: tilesDict.mapbox_streets,
          defaults: {
            scrollWheelZoom: false,
            zoomControl: false //remove zoom control 
          },
          events: { // teach leaflet to watch these events
              map: {
                  enable: ['move','moveend', 'zoomstart','zoomend', 'drag', 'click', ],
                  logic: 'emit'
              }
          }
      });

      // Here we get the map object and react the map events
      leafletData.getMap("map").then(
        function (map) {

            map.removeControl(map.zoomControl);
            // Map is moved - update user location
            map.on('move', function(){
              $scope.updateUserLocation();
              $scope.showPickupBtn = false;
              $scope.data.startAddress = "Go To Pin";
            })
            // Map clicked - hide address elements and keyboard
            map.on('click', function(){
              console.log('hide address list!');
              $scope.hideAddressList = true;
              // Close keyboard
              if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.close();
              }
            })
            // Map move ended - get the current address of lat,lng
            map.on('moveend', function(){
              leafletData.getMap("map").then(
              function (map) {
                 var ctr = map.getCenter();
                 console.log(ctr.lat + ' : ' + ctr.lng);
                 GeoService.getAddressFromLatLng(ctr.lat, ctr.lng).then(function(data){
                  console.log(data);
                  $scope.fullStartAddress = data;
                  $scope.data.startAddress = data.split(',')[0];
                  $scope.showPickupBtn = true;

                 },function(err){
                  console.log('No address resolved.');
                 })
              })
            })
            map.on('zoomstart', function(){
              console.log('zoomstart');
              $scope.zooming = true;
            })
            map.on('zoomend', function(){
              console.log('zoomend');
              $scope.zooming = false;
            })
        }
      );

  $scope.$on('$ionicView.enter', function(e) {
    $scope.firstLocation = true;
    $ionicSideMenuDelegate.canDragContent(false);
    // Start watching our position
    watchPositionId = navigator.geolocation.watchPosition(successGeolocation, errorGeolocation, {enableHighAccuracy:true});
  });

  $scope.$on('$ionicView.beforeLeave', function() {
    console.log('clearing watchId: ' + watchPositionId);
    navigator.geolocation.clearWatch(watchPositionId);
  });
  
  // Extra function to center based on ip. Not used currently
  $scope.searchIP = function(ip) {
    var url = "http://freegeoip.net/json/" + ip;
      $http.get(url).success(function(res) {
        console.log(res);
          $scope.myCenter = {
              lat: res.latitude,
              lng: res.longitude,
              zoom: 10
          };
          $scope.ip = res.ip;
      });
  };

  // Not used. Locates user via leaflet
  $scope.locateMe = function(){
    leafletData.getMap("map").then(
      function (map) {
        map.locate({
          maxZoom: 16,
          watch: true,
          enableHighAccuracy: true
        });
    })
  }
  
  //Choose address from address list
  $scope.chooseAddress = function(addr){
    console.log(addr);
    // Split the address on ,
    var filterAddr = $filter('split')(addr.place_name,',',0);

    // Did we click the start address box or end address box last?
    console.log($scope.startAddressClicked);
    if($scope.startAddressClicked == 0){
      $scope.data.startAddress = filterAddr;
    }
    else{
      $scope.data.endAddress = filterAddr;
    }
    console.log($scope.data.startAddress);
    $scope.hideAddressList = true;
  }

  // Search for an address string , startAddressClicked 0 for startAddress 1 for endAddress
  $scope.queryAddress = function(addr, startAddressClicked){
    $scope.hideAddressList = true;
    if(addr == undefined || addr == ''){
      return;
    } 

    $scope.startAddressClicked = startAddressClicked;
    console.log($scope.startAddressClicked);

    $scope.hideAddressList = false;
    GeoService.getAddressFromQuery(addr, $scope.lat, $scope.lng).then(function(response){
      console.log(response);
      $scope.possibleAddresses = response;

    },function(err){
      console.log('No address resolved.');
    })
  }

  // Unhide address list
  $scope.showAddressList = function() {
    $scope.hideAddressList = false;
  }

  // Helper function for checking android
  $scope.isAndroid = function(){
    return ionic.Platform.isAndroid();
  }

  // Helper function checking ios
  $scope.isIOS = function(){
    return ionic.Platform.isIOS();
  }

  // Converts lat,lng to viewport px value
  $scope.latLngToPixels = function(lat, lng){
    leafletData.getMap("map").then(
      function (map) {

        var po = map.getPixelOrigin(),
        pb = map.getPixelBounds(),
        offset = map.getPixelOrigin().subtract(map.getPixelBounds().min);

        var x = map.project([lat,lng], map.getZoom());
        console.log(x);
      })
  };

  // Update user location by getting lat,lng projected onto map
  $scope.updateUserLocation = function () {
    leafletData.getMap("map").then(
    function (map) {
      if($scope.lat && $scope.lng){
        var containerPoint = map.latLngToContainerPoint([$scope.lat,$scope.lng]);
        if(containerPoint){
          $scope.user.x = containerPoint.x;
          $scope.user.y = containerPoint.y;
        }
      }
    })
  }

  // Conversion function
  $scope.latLngToContainerPoint = function (lat, lng) {
    leafletData.getMap("map").then(
    function (map) {
      if($scope.lat && $scope.lng){
        var containerPoint = map.latLngToContainerPoint([lat,lng]);
        if(containerPoint){
          $scope.user.x = containerPoint.x;
        $scope.user.y = containerPoint.y;
        }
      }
    })
  }

  // Center and zoom on a location after map load to level 17 zoom
  $scope.centerAndZoomOnLocation = function(lat,lng){
    leafletData.getMap("map").then(
      function (map) {
        map.setView([lat,lng], 17);
      })
  }

  // Center on user location (called from navigation icon, lower right on map display)
  $scope.centerOnLocation = function(){
    leafletData.getMap("map").then(
      function (map) {
        map.setView([$scope.lat,$scope.lng]);
      })
  }

  // Helper alert dismissed debug function
  $scope.alertDismissed = function(){
    console.log('alertDismissed');
  }

  // Use native dialog to show alert message
  $scope.showDialog = function(message,title,btn){
     if(navigator.notification){
          navigator.notification.alert(
              message,             // message
              $scope.alertDismissed,     // callback
              title,              //title
              btn                 // buttonName
          );
        }
        else{
          alert(message);
        }
  }

  // Actions when clicking SUVs or Jets...
  $scope.choose = function(choice){
    switch (choice) {
      case 0:
        $scope.showDialog('Sorry. No SUVs available..','Not Available','OK');
        break;
      case 1:
        $scope.showDialog('Sorry. No Jets available..','Not Available','OK')
        break;
    }
  }

  // Called when a new position is found via watchposition
  function successGeolocation(position) {
    if (!position.coords) return;
      console.log(position);
      $scope.lat = position.coords.latitude;
      $scope.lng = position.coords.longitude;
      $scope.acc = position.coords.accuracy;

      // The first time we receive a geolocation, center on the coordinates and zoom.
      if($scope.firstLocation){
        console.log('Centering/zoom on the first location obj...');
        $scope.centerAndZoomOnLocation($scope.lat, $scope.lng);
        $scope.firstLocation = false;
      }

      $scope.latLngToContainerPoint($scope.lat, $scope.lng);

  }

  function errorGeolocation(error) {
    console.log(error);
  }
  
})
