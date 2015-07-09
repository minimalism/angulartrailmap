var trailmapControllers = angular.module('trailmapControllers', ['ngResource']);

var infoWindow;
var selectedMarker;

trailmapControllers
.controller('MenuController', ['$scope', 'TrailPackages', 'Trails', 'CreateInfoWindow', function ($scope, TrailPackages, Trails, CreateInfoWindow) {

    /* Load list of Trail Packages */
    $scope.trailPackages = TrailPackages.query();

    /* Callback for Trail Package dropdown */
    $scope.onTrailPackageChanged = function ($selectedTrailPackageName) {
        if ($selectedTrailPackageName != null) {
            $scope.selectedTrailPackage = Trails.get({ bundle: $selectedTrailPackageName, environment: 'Development', lang: 'sv' });
        }
        else {
            $scope.selectedTrail = null;
            cleanUpOldTrail($scope);
        }
    }

    // Callback for Trail dropdown
    $scope.onTrailChanged = function ($selectedTrail) {
        // Clean up previously displayed trail
        cleanUpOldTrail($scope);

        // Draw current trail
        if ($selectedTrail != null) {
            $scope.trailInfo = $selectedTrail.path_info;
            $scope.trailImage = $selectedTrail.path_image;
            $scope.markers = [];

            var bounds = new google.maps.LatLngBounds();
            for (var i = 0; i < $selectedTrail.places.length; i++) {
                // Create place marker and an info-window to be opened on click
                var place = $selectedTrail.places[i];
                var latlng = new google.maps.LatLng(place.place_position.lat, place.place_position.lng);
                $scope.markers[i] = new google.maps.Marker({
                    title: place.place_name,
                    position: latlng,
                    animation: google.maps.Animation.DROP,
                    map: $scope.map
                });
                $scope.markers[i].place_id = i;
                CreateInfoWindow($scope, $scope.markers[i], place);
                bounds.extend(latlng);
            }

            // Draw polylines
            $scope.trails = [];
            for (var i = 0; i < $selectedTrail.path_polyline.length; i++) {
                var trailCoordinates = [];
                for (var j = 0; j < $selectedTrail.path_polyline[i].length; j++) {
                    var polycoord = $selectedTrail.path_polyline[i][j];
                    var latlng = new google.maps.LatLng(polycoord.lat, polycoord.lng);
                    trailCoordinates[j] = latlng;
                    bounds.extend(latlng);
                }

                $scope.trails[i] = new google.maps.Polyline({
                    path: trailCoordinates,
                    geodesic: true,
                    strokeColor: '#FF0000',
                    strokeOpacity: 1.0,
                    strokeWeight: 2
                });

                $scope.trails[i].setMap($scope.map);
            }
            $scope.map.fitBounds(bounds);	// Focus map on trail
        }
    }

}]);

// Remove previously displayed trail from the map.
function cleanUpOldTrail($scope) {
    if ($scope.markers != null) {
        for (var i = 0; i < $scope.markers.length; i++) {
            $scope.markers[i].setMap(null);
        }
    }
    if ($scope.trails != null) {
        for (var i = 0; i < $scope.trails.length; i++) {
            $scope.trails[i].setMap(null);
        }
    }
}