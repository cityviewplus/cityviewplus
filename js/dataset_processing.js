/*
 * Queries a specified dataset from Analyze Boston or a specified url
 * @param {string} query - Query string (resource id = table name, use template string to wrap the query,
 * use double quotes to wrap the table names, and use single quotes to wrap the column names)
 * @param {string} url - optional url to query data from another source
 * @return {Json} dataJsonArray - preprocessed array of Json objects from the query and preprocessData()
 */
function getData(query, callback, url) {
  url = url || 'https://data.boston.gov/api/3/action/datastore_search_sql?sql=';
  var rawJson, dataJson;
  var request = new XMLHttpRequest();
  request.responseType = 'text';
  request.onreadystatechange = function() {
    if (request.readyState === 4 && request.status === 200) {
      rawJson = JSON.parse(request.responseText);
      console.log(rawJson);
      dataJsonArray = preprocessData(rawJson);

      console.log(dataJsonArray);
      callback(dataJsonArray);
      return dataJsonArray;
    }
  };

  request.open('GET', url + query);
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

/*
 * Maps data in a Json object array to two key-value pairs (one value containing categorical data,
 * and the other containing numerical data)
 * @param {Json array} dataJsonArray - array of Json objects containing key-value pairs to be mapped
 * @param {string} catCol - column name containing categorical data
 * @param {string} numCol - column name containing numerical data
 * @param {string} catKey - optional parameter to name the key of the categorical data
 * @param {string} numKey - optional parameter to name the key of the numerical data
 * @return {Json array} mapped - array of Json objects contining the mapped key-value pairs
*/
function mapJsonArray(dataJsonArray, catCol, numCol, catKey, numKey) {
  catKey = catKey || 'name';
  numKey = numKey || 'size';
  var mapped = dataJsonArray.map(function(d, i) {
    return {
      [catKey]: d[catCol],
      [numKey]: d[numCol]
    };
  });
  return mapped;
}

/*
 * Creates a new Json object with a Json array as its child in a key-value pairs
 * @param {Json array} dataJsonArray -
 * @param {string} name - a descriptive name that describes the data that the child Json array contains
 * @param {string} nameKey - optional string for the name key
 * @param {string} childKey - optional string for the child key
 * @return {Json} json - new Json object
*/
function addChildToJson(dataJsonArray, name, nameKey, childKey) {
  nameKey = nameKey || 'name';
  childKey = childKey || 'children';
  var json = {};
  json[nameKey] = name;
  json[childKey] = dataJsonArray;

  return json;
}