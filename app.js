let API = "https://api.iextrading.com/1.0"
let query = "/stock/aapl/chart"
let date = []
let yAxesMin;
let yAxesMax;
let stockValue = []
function getURL() {
url = API + query
$.get(url).then(function(obj) {
    for (let i = 0; i < 10; i++) {
    date.push(obj[i].date)
    stockValue.push(obj[i].vwap)
    yAxesMin = Math.min(...stockValue) - 10
    console.log(yAxesMin)
    console.log(stockValue)
    }
}).catch( error => console.log(error))
}
getURL()    
var ctx = document.getElementById("myChart").getContext('2d');
var stockChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: date,
        datasets: [{
            label: '# of Votes',
            data: stockValue,
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)'
            ],
            borderColor: [
                'rgba(255,99,132,1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        resposive:true,
        maintainAspectRatio:false,
        scales: {
            yAxes: [{

                ticks: {
                    beginAtZero:false
                }
            }]
        }
    }
});