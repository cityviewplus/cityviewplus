// edit read query
//var query = `SELECT * FROM "20f64c02-6023-4280-8131-e8c0cedcae9b"`;
var query = `SELECT * FROM "12cb3883-56f5-47de-afa5-3b1cf61b257b" WHERE "YEAR" = '2018'
AND CAST("MONTH" AS INT) = 12`;

var crimesCluster = L.markerClusterGroup({
  // iconCreateFunction is used if we are not using MarkerCluster.Default.css
  // iconCreateFunction: function(cluster) {
  //   return L.divIcon({ html: '<div><span>' + cluster.getChildCount() + '</div></span>', className: 'marker-cluster streetlight-cluster', iconSize: L.point(40, 40) });
  // },
  chunkedLoading: true,
  spiderfyOnMaxZoom: false, // disable spiderfy
  disableClusteringAtZoom: 18, // at this zoom level and below, markers will not be clustered
  maxClusterRadius: 70 // < default (80) makes more, smaller clusters
});

var map = L.map('leaflet-map', {
  preferCanvas: true
}).setView([42.3601, -71.0589], 13);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  maxZoom: 18,
  id: 'mapbox.streets',
  accessToken: 'pk.eyJ1IjoiZXJpY2ttb28iLCJhIjoiY2pwMW9zdnplMDB0MDNrcGV3Y3dpdDdxYyJ9.PKvFcq8kWpz8bH3G2taIjA'
}).addTo(map);

getData(query, function(jsonArray) {
  var dataLength = jsonArray.length;
  var latList = [];
  var lonList = [];
  // iterate over all data points
  for (var i = 0; i < dataLength; i++) {
    latList.push(Number(jsonArray[i].Lat));
    lonList.push(Number(jsonArray[i].Long));
  }

  // Add markers to cluster group
  var treesMarkerList = [];
  for (var i = 0; i < dataLength; i++) {
    var marker = L.circleMarker(getLatLon(i, latList, lonList), {
      radius: 1,
      color: 'green'
    });
    treesMarkerList.push(marker);
  }

  treesCluster.addLayers(treesMarkerList);
});