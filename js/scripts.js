//write your javascript here!

console.log('Starting CityView...')

var read = `SELECT * FROM "20f64c02-6023-4280-8131-e8c0cedcae9b" LIMIT 100`;

var data = getData(read, function(jsonArray) {
  var ul = document.getElementById('jsonList');
  var dataJson = mapJsonArray(json, 'Neighborhood', 'Percent of Population');

  //https://stackoverflow.com/questions/921789/how-to-loop-through-a-plain-javascript-object-with-the-objects-as-members
  for (var key in dataJson) {
    // skip loop if the property is from prototype
    if (!dataJson.hasOwnProperty(key)) continue;

    var obj = dataJson[key];
    for (var prop in obj) {
        // skip loop if the property is from prototype
        if(!obj.hasOwnProperty(prop)) continue;

        var node = document.createElement("LI");
        var textnode = document.createTextNode(prop + " = " + obj[prop]);
        node.appendChild(textnode);
        ul.appendChild(node);
    }

    ul.innerHTML = ul.innerHTML + "<br/>" + "--------------------------" + "<br/>";
}
});

