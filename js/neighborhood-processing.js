//TODO look into improving performance by deleting coordinates already used

d3.json("datasets/Boston_Neighborhoods.geojson", function(geojson) {
  d3.csv("datasets/clustered_trees.csv", function(d) {
    // //console.log('data: ' + JSON.stringify(d));
    // //console.log('geojson: ' + JSON.stringify(geojson));
    var dataLength = d.length;
    var coordList = [];
    // iterate over all data points
    for (var i = 0; i < dataLength; i++) {
      var array = [];
      array.push(Number(d[i].lon)); //X
      array.push(Number(d[i].lat)); //Y
      coordList.push(array)
    }

    geojson.features.forEach(function(feat) {
      var geom = feat.geometry;
      var props = feat.properties;
      var listLength = coordList.length;
      if (geom.type === 'MultiPolygon') {
        //console.log("this is a multipolygon: " + JSON.stringify(geom));
        for (var i = 0; i < geom.coordinates.length; i++) {
          var polygon = {
            'type': 'Polygon',
            'coordinates': geom.coordinates[i]
          };
          for (var j = 0; j < 4; j++) {
            var coord = coordList[j];
            //console.log(coord);
            var contains = d3.geoContains(polygon, coord);
            if (contains) {
              //console.log(`The coordinates ${coord} are in ${props.Name}`);
              if (props.Trees) {
                props.Trees = props.Trees + 1;
              } else {
                props.Trees = 1;
              }
              //console.log(`Number of trees in ${props.Name} is now ${props.Trees}`);
            } else {
              //console.log(`The coordinates ${coord} were not found to be in any neighborhood. Index ${j}`);
            }
          }
        }
      } else if (geom.type == 'Polygon') {
        var polygon = geom;
        //console.log("this is a polygon: " + JSON.stringify(geom));
        for (var j = 0; j < 4; j++) {
          var coord = coordList[j];
          //console.log(coord);
          var contains = d3.geoContains(polygon, coord);
          if (contains) {
            //console.log(`The coordinates ${coord} are in ${props.Name}`);
            if (props.Trees) {
              props.Trees = props.Trees + 1;
            } else {
              props.Trees = 1;
            }
            //console.log(`Number of trees in ${props.Name} is now ${props.Trees}`);
          } else {
            //console.log(`The coordinates ${coord} were not found to be in any neighborhood. Index ${j}`);
          }
        }
      }
    });
    console.log(geojson);
  });
});