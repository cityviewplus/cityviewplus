var map = L.map('leaflet-map', {
  preferCanvas: true
}).setView([42.3601, -71.0589], 13);
var showingWifi = false;
var wifiLayer = null;
var treesHeat = null;

var treesCluster = L.markerClusterGroup({
  // iconCreateFunction is used if we are not using MarkerCluster.Default.css
  // iconCreateFunction: function(cluster) {
  //   return L.divIcon({ html: '<div><span>' + cluster.getChildCount() + '</div></span>', className: 'marker-cluster streetlight-cluster', iconSize: L.point(40, 40) });
  // },
  chunkedLoading: true,
  spiderfyOnMaxZoom: false, // disable spiderfy
  disableClusteringAtZoom: 18, // at this zoom level and below, markers will not be clustered
  maxClusterRadius: 70 // < default (80) makes more, smaller clusters
});

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  maxZoom: 18,
  id: 'mapbox.streets',
  accessToken: 'pk.eyJ1IjoiZXJpY2ttb28iLCJhIjoiY2pwMW9zdnplMDB0MDNrcGV3Y3dpdDdxYyJ9.PKvFcq8kWpz8bH3G2taIjA'
}).addTo(map);

//load the layers
loadWifiLayer();
loadTreesLayer();

function loadWifiLayer() {
  var request = new XMLHttpRequest();
  request.responseType = 'text';
  request.onreadystatechange = function() {
    if (request.readyState === 4 && request.status === 200) {
      geoJsonData = JSON.parse(request.responseText);
      console.log(geoJsonData);

      console.time('loadWifiLayer');

      wifiLayer = L.geoJSON(geoJsonData, {
        pointToLayer: function(point, latlng) {
          return L.circleMarker(latlng, {
            radius: 1
          });
        }
      }).bindPopup(function(layer) {
        return layer.feature.properties.Address;
      });

      showWifi();
      console.timeEnd('loadWifiLayer');
    }
  };

  request.open('GET', 'datasets/Wicked_Free_WiFi_Locations.geojson');
  request.send();
}

function loadTreesLayer() {
  /*
  var request = new XMLHttpRequest();
  //request.responseType = 'text';
  request.responseType = 'text/csv';
  request.onreadystatechange = function() {
    if (request.readyState === 4 && request.status === 200) {
      geoJsonData = JSON.parse(request.responseText);
      console.log(geoJsonData);

      console.time('loadTreesLayer');
      // Sometimes it loads faster if the layer is not saved to a variable first
      // before putting it into a MarkerCluster (difference of ~20,000ms)

      // treesLayer = L.geoJSON(geoJsonData, {
      //   style: 'green',
      //   pointToLayer: function(point, latlng) {
      //     return L.circleMarker(latlng, {
      //       radius: 1,
      //       color: 'green'
      //     });
      //   }
      // }).bindPopup(function(layer) {
      //   return layer.feature.properties.TYPE;
      // });

      treesCluster.addLayers(L.geoJSON(geoJsonData, {
        style: 'green',
        pointToLayer: function(point, latlng) {
          return L.circleMarker(latlng, {
            radius: 1,
            color: 'green'
          });
        }
      }));
      console.timeEnd('loadTreesLayer');
    }
  };

  request.open('GET', 'datasets/Trees.geojson');
  request.send();
  */

  //d3.csv("datasets/Trees.csv", function(d) {
  d3.csv("clustered_trees.csv", function(d) {
    console.time('loadTreesLayer');
    var dataLength = d.length;
    var latList = [];
    var lonList = [];
    var coordList = [];
    // iterate over all data points
    for (var i = 0; i < dataLength; i++) {
      // latList.push(Number(d[i].Y));
      // lonList.push(Number(d[i].X));

      var array = [];

      array.push(Number(d[i].lat));
      array.push(Number(d[i].lon));
      array.push(0.2);

      coordList.push(array)
    }

    // Add markers to cluster group
    // var treesMarkerList = [];
    // for (var i = 0; i < dataLength; i++) {
    //   var marker = L.circleMarker(getLatLon(i, latList, lonList), {
    //     radius: 1,
    //     color: 'green'
    //   });
    //   treesMarkerList.push(marker);
    // }
    //
    // treesCluster.addLayers(treesMarkerList);

    treesHeat = L.heatLayer(coordList, {
      minOpacity: 0.5,
      radius: 30
    });
    console.log(treesHeat);

    console.timeEnd('loadTreesLayer');
  });
}

function showWifi() {
  if (showingWifi) {
    console.log("The map is already showing wifi spots")
    return;
  }

  // if (treesCluster != null) {
  if (treesHeat != null) {
    console.log("removing trees layer")
    //treesCluster.remove();
    treesHeat.remove()
  }

  wifiLayer.addTo(map);

  showingWifi = true;
}

function showTrees() {
  if (!showingWifi) {
    console.log("The map is already showing tree spots")
    return;
  }

  if (wifiLayer != null) {
    console.log("removing wifi layer")
    wifiLayer.remove();
  }

  //treesCluster.addTo(map);
  treesHeat.addTo(map);

  showingWifi = false;
}

// HELPER: Get (lat,lon) for specific point
function getLatLon(i, latList, lonList) {
  return [
    latList[i],
    lonList[i]
  ];
};