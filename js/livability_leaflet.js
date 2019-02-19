var map = L.map('leaflet-map', {
  preferCanvas: true
}).setView([42.3601, -71.0589], 13);

var streetsMap = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  maxZoom: 18,
  id: 'mapbox.streets',
  accessToken: 'pk.eyJ1IjoiZXJpY2ttb28iLCJhIjoiY2pwMW9zdnplMDB0MDNrcGV3Y3dpdDdxYyJ9.PKvFcq8kWpz8bH3G2taIjA'
}).addTo(map);

var grayscaleMap = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  maxZoom: 18,
  id: 'mapbox.light',
  accessToken: 'pk.eyJ1IjoiZXJpY2ttb28iLCJhIjoiY2pwMW9zdnplMDB0MDNrcGV3Y3dpdDdxYyJ9.PKvFcq8kWpz8bH3G2taIjA'
});

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

var info = L.control();
var showingWifi = false;
var wifiLayer = null;
var treesHeat = null;
var treesLayer = null;

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
  // d3.csv("datasets/clustered_trees.csv", function(d) {
  // console.time('loadTreesLayer');
  // var dataLength = d.length;
  // var latList = [];
  // var lonList = [];
  // var coordList = [];
  // // iterate over all data points
  // for (var i = 0; i < dataLength; i++) {
  //   // latList.push(Number(d[i].Y));
  //   // lonList.push(Number(d[i].X));
  //
  //   var array = [];
  //
  //   array.push(Number(d[i].lat)); //Y
  //   array.push(Number(d[i].lon)); //X
  //   array.push(0.2);
  //
  //   coordList.push(array)
  // }
  //
  // treesHeat = L.heatLayer(coordList, {
  //   minOpacity: 0.5,
  //   radius: 30,
  //   gradient: { 0.2: '#edf8e9', 0.4: '#bae4b3', 0.6: '#74c476', 1: '#238b45' }
  // });
  // console.log(treesHeat);
  //
  // console.timeEnd('loadTreesLayer');
  d3.json("datasets/neighborhoods.geojson", function(d) {
    treesLayer = L.geoJson(d, { style: style, onEachFeature: onEachFeature });
  });
}

function showWifi() {
  if (showingWifi) {
    console.log("The map is already showing wifi spots");
    return;
  }

  if (treesLayer != null) {
    //if (treesHeat != null) {
    console.log("removing trees layer");
    grayscaleMap.remove();
    treesLayer.remove();
    //treesHeat.remove()
  }

  info.remove();
  streetsMap.addTo(map);
  wifiLayer.addTo(map);

  showingWifi = true;
}

function showTrees() {
  if (!showingWifi) {
    console.log("The map is already showing tree spots");
    return;
  }

  if (wifiLayer != null) {
    console.log("removing wifi layer");
    streetsMap.remove()
    wifiLayer.remove();
  }

  grayscaleMap.addTo(map);
  treesLayer.addTo(map);
  info.addTo(map);
  //treesHeat.addTo(map);

  showingWifi = false;
}

// HELPER: Get (lat,lon) for specific point
function getLatLon(i, latList, lonList) {
  return [
    latList[i],
    lonList[i]
  ];
};

function getColor(d) {
  colors = ['#f7fcf5', '#e5f5e0', '#c7e9c0', '#a1d99b', '#74c476', '#41ab5d', '#238b45', '#006d2c', '#00441b']
  return d > 8000 ? colors[8] :
    d > 6000 ? colors[7] :
    d > 4000 ? colors[6] :
    d > 2000 ? colors[5] :
    d > 1000 ? colors[4] :
    d > 500 ? colors[3] :
    d > 100 ? colors[2] :
    d > 50 ? colors[1] :
    colors[0];
}

function style(feature) {
  return {
    fillColor: getColor(feature.properties.Trees), //color(feature.properties.Trees),
    weight: 2,
    opacity: 1,
    color: 'white',
    dashArray: '3',
    fillOpacity: 0.7
  };
}

function highlightFeature(e) {
  var layer = e.target;

  layer.setStyle({
    weight: 5,
    color: '#666',
    dashArray: '',
    fillOpacity: 0.7
  });

  info.update(layer.feature.properties);

  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
    layer.bringToFront();
  }
}

function resetHighlight(e) {
  treesLayer.resetStyle(e.target);
  info.update();
}

function zoomToFeature(e) {
  map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: zoomToFeature
  });
}

info.onAdd = function(map) {
  this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
  this.update();
  return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function(props) {
  this._div.innerHTML = '<h4>Boston Neighborhoods</h4>' + (props ?
    '<b>' + props.Name + '</b>' : 'Hover over a neighborhood');
};