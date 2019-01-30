let API = "https://api.iextrading.com/1.0"
let query = "/stock/aapl/chart"
let date = []
// let yAxesMin;
// let yAxesMax;
let stockValue = []
function getURL() {
url = API + query
$.get(url).then(function(obj) {

    console.log(obj);

    for (let i = 0; i < 20; i++) {
    date.push(obj[i].date)
    stockValue.push(obj[i].vwap)
    // yAxesMin = Math.min(...stockValue) - 10
    console.log(stockValue)
    }
}).catch( error => console.log(error))
} 
getURL()
// chart need to make it so that it changes based on different click functions
setTimeout(function() {
var ctx = document.getElementById("myChart").getContext('2d');
var myChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: date,
        datasets: [{
            label: 'stock price',
            data: stockValue,
            backgroundColor: [
                'rgba(0, 0, 0, 0.5)'
            ],
            borderColor: [
                'rgba(0, 255, 0, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        responsive:true,
        maintainAspectRatio:true,
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero:false
                }
            }]
        }
    }
});
},1000)
// when you click on a stock it dropsdown below(using bootstrap) and shows a graph with one month of stock data

// when clicking the star icon next to the stock it will add it to the users favorites firebase
// basic login page that will push user data to firebase or retrieve if already there

// have a moment clock that lists the time until market closes update this every 60000ms(1min)

// pull top 5 news stories from financial times when document loads and put in news div

// when you click on stock it will change the news to search for that company name and show the top five results

// when you type in a company to search it will show results and then prepend them to the stock div where you can click to show graph and news stories and will add it to the users firebase to show at the div recent searches

// if error on search pull up modal that states error company cannot be found

// when clicking home button will show the main page with the top 5 stocks again

// add buttons above graph that will change timeframe

