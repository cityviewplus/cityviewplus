//write your javascript here!

console.log('Starting CityView...')

function loadData() {
  console.log('runnign load')
  var data = {
    resource_id: 'c53f0204-3b39-4a33-8068-64168dbe9847', // the resource id
    limit: 5, // get 5 results
    q: 'jones' // query for 'jones'
  };
  $.ajax({
    url: 'https://data.boston.gov/api/3/action/datastore_search',
    data: data,
    dataType: 'jsonp',
    success: function(data) {
      alert('Total results found: ' + data.result.total)
    }
  });


}
