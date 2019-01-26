let API = "https://api.iextrading.com/1.0"
let query = "/stock/aapl/splits/5y"
function getURL() {
url = API + query
$.get(url).then(function(obj) {
 console.log(obj)
 console.log(url)
}).catch( error => console.log(error))
}
getURL()