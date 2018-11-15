/*
 * Queries a specified dataset from Analyze Boston
 * @param {string} query - Query string (resource id = table name, use template string to wrap the query,
 * use double quotes to wrap the table names, and use single quotes to wrap the column names)
 * @return {Json} dataJsonArray - preprocessed array of Json objects from the query and preprocessData()
 */
function getData(query, callback) {
  var rawJson, dataJson;
  var request = new XMLHttpRequest();
  request.responseType = 'text';
  request.onreadystatechange = function() {
    if (request.readyState === 4 && request.status === 200) {
      rawJson = Json.parse(request.responseText);
      console.log(rawJson);
      dataJsonArray = preprocessData(rawJson);

      console.log(dataJsonArray);
      callback(dataJsonArray);
      return dataJsonArray;
    }
  };

  request.open('GET', 'https://data.boston.gov/api/3/action/datastore_search_sql?sql=' + query);
  request.send();
}

/*
 * Extracts dataset from Json object
 * @param {Json} rawJson - Json object retrieved within getData(),
 * data is usually under result > records
 * @return {Json array} dataJsonArray - array of Json objects containing only the rows of the dataset
 */
function preprocessData(rawJson) {
  var dataJsonArray;

  if (rawJson) {
    dataJsonArray = rawJson.result.records;
    return dataJsonArray;
  } else {
    console.log('No JSON object to preprocess');
  }

}

//TODO make function to map JsonArray
function mapJsonArray(dataJsonArray, keyCol, valueCol, key, value) {
  key = key || 'name';
  value = value || 'size';
  var mapped = dataJsonArray.map(function(d, i) {
    return {
      [key]: d[keyCol],
      [value]: d[valueCol]
    };
  });
  return mapped;
}