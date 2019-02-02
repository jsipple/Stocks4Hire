$(document).ready(function() {

    let date = []

    let stockValue = []

    var myChart;

    var clicked = true;

    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyB7FoClUg_vFWCfyZLegDveIwcnbr3WIcs",
        authDomain: "stocks4hire-488ef.firebaseapp.com",
        databaseURL: "https://stocks4hire-488ef.firebaseio.com",
        projectId: "stocks4hire-488ef",
        storageBucket: "stocks4hire-488ef.appspot.com",
        messagingSenderId: "233038305491"
    };
    firebase.initializeApp(config);
    

    $("#add-button").on("click", function(event){
        event.preventDefault();

        var first;
        var last;

        date = []

        stockValue = []

        var input = $("#user-input").val().trim()

        console.log(input);

        input = input.toUpperCase();

        var queryURL = "https://api.iextrading.com/1.0/stock/market/batch?symbols=" + input + "&types=quote,chart&range=1m&last=5";

    $.ajax({
      url: queryURL,
      method: "GET"
    })
    .then(function(response){

        getNews(response[input].quote.companyName);

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

        var tbody = $("#stockslisted");
        
        var name = $("<td>").text(response[input].quote.companyName);
        var close = $("<td>").text("$" + response[input].chart[20].close);
        var canvas = $("<canvas>");

        canvas.attr("id", input);

        var table = $("<tr>").append(name, close, "<br>").attr("val", input).addClass("chart");

        var newRow = $("<tr>").append(canvas);


        tbody.append(table, newRow);

            var ctx = document.getElementById(input).getContext('2d');
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

        
            var click = $(this).attr("val");

            $("#" + click).hide();

            console.log(click);
        });

        console.log("Made chart");

    $(document).on("click", ".chart", function(){

        console.log("hey")
        
        var click = $(this).attr("val");

        if(!clicked){

            $("#" + click).show();

            console.log(clicked);

            clicked = true;
        }
        else if(clicked){

            $("#" + click).hide();
            
            clicked = false;
        }
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
            var title = response.articles[i].title;
            var date = response.articles[i].publishedAt.substr(0,10);
            var author = response.articles[i].author;
            
            $("#news" + i).append('<a href="'+newsURL+'" target="blank">'+title+' (Date: '+date+') '+'Author: '+author+'</a><br>');
        
      };
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

