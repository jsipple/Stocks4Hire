$(document).ready(function() {

    let date = []

    let stockValue = []

    var myChart;

    var clicked = true;

    $("#add-button").on("click", function(event){
        event.preventDefault();

        var first;
        var last;

        date = []

        stockValue = []

        var input = $("#user-input").val().trim()

        input = input.toUpperCase();

        var queryURL = "https://api.iextrading.com/1.0/stock/market/batch?symbols=" + input + "&types=quote,chart&range=1m&last=5";

    $.ajax({
      url: queryURL,
      method: "GET"
    })
    .then(function(response){

        getNews(response[input].quote.companyName);

    setTimeout(function(){
        console.log(response);
        
        for(var i = 0; i < response[input].chart.length; i++){

            stockValue.push(response[input].chart[i].close);
            date.push(response[input].chart[i].date);

        }

        first = stockValue[0];
        last = stockValue[20];

        var color;

            if (first > last){
                color = 'rgba(200, 0, 0, 1)'
                $("#my-data").css("color", "red");
            }
            else if(first < last){
                color = 'rgba(0, 200, 0, 1)'
                $("#my-data").css("color", "green");
            }

        $("#stock-name").text("Stock: " + input);
        $("#current-price").text("Price: $" + last);

        // Resets the chart so it doesn't freak out.
        if (myChart != undefined)
        {
            myChart.destroy();
            console.log("Destroyed previous chart");
            $("#myChart").show();
        }

            var ctx = document.getElementById("myChart").getContext('2d');
            myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: date,

                datasets: [{
                    label: input,
                    data: stockValue,
                    backgroundColor:[
                        'rgba(0, 0, 0, 0)'
                    ],
                    borderColor: [
                        color
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                legend: {
                    labels: {
                        fontColor: color
                    }
                },
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
        }, 1);
        console.log("Made chart");
        $("#myChart").hide();
        });

    $("#my-data").unbind().on("click", function(){

        console.log("hey")

        if(!clicked){
            console.log(clicked);

            $("#myChart").hide();
            if (first > last){
                $("#my-data").css("color", "red");
            }
            else if(first < last){
                $("#my-data").css("color", "green");
            }

            for(var i = 1; i < 5; i++){
                $("#news" + i).hide();
            }
            
            $("#stock-name").show();
            $("#current-price").show();

            
            

            clicked = true;
        }
        else if(clicked){

            for(i = 1; i < 5; i++){
                $("#news" + i).show();
            }

            console.log(clicked);

            $("#my-data").css("background-color", "black");
            $("#myChart").show();
            

            $("#stock-name").hide();
            $("#current-price").hide();

            clicked = false;
        }
    });

});

function getNews(item){

    var URL = 'https://newsapi.org/v2/everything?q=' + item + 's&apiKey=d53b18e6f2bb4408bb4b79dd3dfb406b'

    $.ajax({
        url: URL,
        method: "GET"
      })
      .then(function(response){

        for(i = 0; i < 5; i++){
        var newsURL = response.articles[i].url;
        
        $("#news" + i).append(newsURL);

        $("#news" + i).hide();
        }

        $("#news0").show();
        
      });
}

});
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

