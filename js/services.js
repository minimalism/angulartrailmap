var trailmapServices = angular.module('trailmapServices', ['ngResource']);

var endpointUrl = 'https://forward-byte-711.appspot.com/';

// Service to retrieve trail package list
trailmapServices.factory('TrailPackages', ['$resource',
  function ($resource) {
      return $resource(endpointUrl + 'list', {}, {
          query: { method: 'GET', isArray: true }
      });
  }]);

// Service to retrieve trail information
trailmapServices.factory('Trails', ['$resource',
  function ($resource) {
      return $resource(endpointUrl + 'read/:bundle/:environment/:lang', {}, {
          query: { method: 'GET', params: { bundle: 'Test', environment: 'Production', lang: 'sv' }, isArray: false }
      });
  }]);

// This service creates a google map InfoWindow containing information for a given place,
// and creates an onClick listener to open said window.
trailmapServices.factory('CreateInfoWindow', ['$compile',
  function ($compile) {

      function getMediaImage(mediaContent) {
          ret = '<div class="media_gallery_item">' + mediaContent.content_text;
          ret += '<img class="media_content_image" src="' + mediaContent.content_url + '"/>'
          ret += '</div>';
          return ret;
      }

      function getMediaAudio(mediaContent) {
          ret = '<div class="media_content">' + mediaContent.content_text;
          ret += '<audio class="media_audio" src="' + mediaContent.content_url + '" controls preload="auto" autobuffer></audio>';
          ret += '</div>';
          return ret;
      }

      // Extract and present media information
      function getMedia(media) {
          var ret = '' + media.media_name + '</div>';

          if (media.media_image) {
              ret += '<img class="place_image" src="' + media.media_image + '"/>';
          }

          if (media.media_type == 'text') {
              ret += media.media_contents;
          }
          else if (media.media_type == 'image') {
              ret += '<div class="media_gallery">';
              angular.forEach(media.media_contents, function (media_content) {
                  ret += getMediaImage(media_content);
              });
              ret += '</div>';
          }
          else if (media.media_type == 'audio') {
              ret += getMediaAudio(media.media_contents);
          }

          return ret;
      }

      return function (scope, marker, selectedPlace) {
          var contentString = '<div id="content"><h1>' + selectedPlace.place_name + '</h1>' +
               '<div id="bodyContent"><p>' + selectedPlace.place_info + '</p>';

          if (selectedPlace.place_image) {
              contentString += '<img class="place_image" src="' + selectedPlace.place_image + '" />'
          }

          angular.forEach(selectedPlace.place_media, function (media) {
              contentString += '<div class="media">' + getMedia(media) + '</div>';
          });

          contentString += '</div></div>';  // end of bodyContent, content

          google.maps.event.addListener(marker, 'click', function () {
              // Close previously opened infowindow
              if (infoWindow) {
                  infoWindow.close();
              }
              if (selectedMarker) {
                  selectedMarker.setAnimation(null);
              }

              infoWindow = new google.maps.InfoWindow({
                  content: contentString,
                  maxWidth: 400
              });
              selectedMarker = marker;
              selectedMarker.setAnimation(google.maps.Animation.BOUNCE);
              infoWindow.open(selectedMarker.get('map'), marker);
          });
      };
  }]);