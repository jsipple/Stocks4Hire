
$(document).ready(function() {

    let date = []

    let stockValue = []

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

        canvas.attr("id", input).hide();

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
        $(document).unbind().on("click", ".chart", function(){

            console.log("hey")
            
            var click = $(this).attr("val");
    
            if(!clicked){
    
                $("#" + click).hide();
    
                console.log(clicked);
                clicked = true;

               
            }
            else if(clicked){
     
                $("#" + click).show();

                console.log(clicked);
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
                
                var itemval=item.replace(/[^a-zA-Z ]/g, "").split(" ").join("");
                
                var tbody = $("#newsArticles");
                var name = $("<td>").text('Click here for latest news for '+item);
                var newslink = $("<td>").html('<a href="'+newsURL+'" target="blank">'+title+' (Date: '+date+') '+'Author: '+author+'</a>');
                var mainrow = $("<tr>").append(name, "<br>").attr("val", itemval).addClass("newslinks");
                
                var table = $("<tr class="+itemval+">").append(newslink, "<br>");
                if(i==0){
                    tbody.append(mainrow);
                }
                tbody.append(table);
                $('.'+itemval).hide();                    
                $(".newslinks").unbind().on("click", function(){ 
                    var click1 = "."+$(this).attr("val");
                    console.log('click1 '+click1);
                    
                    if(!clicked){
                        $(click1).hide();
                        clicked = true;
                    }else if(clicked){
                        $(click1).show();
                        clicked = false;
                    }
                });            
            };
            
        });
    }

    });

    });


    ////Market close/open TIMER
    var tday =moment('15:30', 'HH:mm');
    var minAway=tday.diff(moment(),"s");
    var secAway=minAway*1000;
    var marketStatus="Time Until market closes: ";

    var pastMidNight=parseInt((moment().format('HH')));
    var pastMidNightM=parseInt((moment().format('mm')));
    
    //accounting for the midnight time 
    if((pastMidNight<9) || ((pastMidNight==9) && pastMidNightM<=30) ){
        minAway=moment().diff(tday,"s");
    }
    
    if(minAway<0){
        var nextDay=moment().add(1, 'd').format('MM-DD-YYYY');
        var open=moment(nextDay+'9:30', 'MM-DD-YYYY HH:mm')
        var minAway=open.diff(moment(),"s");
        var secAway=minAway*1000;
        var marketStatus="Time Until market opens: ";
    }

    //Accounting for weekend
    function dayFinder(dayINeed){
        // if we haven't yet passed the day of the week that I need:
        if (moment().isoWeekday() <= dayINeed) { 
            // then just give me this week's instance of that day
            var dayRequested=moment().isoWeekday(dayINeed);
            return dayRequested;
        } else {
            // otherwise, give me next week's instance of that day
            var dayRequested=moment().add(1, 'weeks').isoWeekday(dayINeed);
            return dayRequested;
        }
    }
        
    var monday=dayFinder(1);
 
    var weekday=moment().weekday();
    
    if( //after 3:30 on friday
        ((weekday>5) || (weekday==5 && (parseInt(moment().format('HH')==13) && parseInt(moment().format('mm')>30) || parseInt(moment().format('HH')>=14))) || (weekday==0)) 
            ||  
        (   (weekday==1) && ((parseInt(moment().format('HH'))<9) || (parseInt(moment().format('HH'))==9 && parseInt(moment().format('mm'))<25))
        )
    ){  //check if the current date is less than monday
        $("#marketTimer").html("Market is closed on weekend Reopens on "+monday.format('MM/DD/YYYY')+" @ 9:30 a.m"); 
    }
    else {//show timer
 
    var countDownQ =new Date().getTime()+secAway;
    var y = setInterval(function() {
    var nowQ = new Date().getTime();
    var distanceQ = countDownQ - nowQ;
    var daysQ = Math.floor(distanceQ / (1000 * 60 * 60 * 24));
    var hoursQ = Math.floor((distanceQ % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutesQ = Math.floor((distanceQ % (1000 * 60 * 60)) / (1000 * 60));
    var secondsQ = Math.floor((distanceQ % (1000 * 60)) / 1000);
    if (minutesQ<9){
        var delim=" : 0";
    }else{
        var delim=" : "; 
    }
    if (hoursQ<9){
        var hdelim=" 0";
    }else{
        var hdelim=" "; 
    }

        if(secondsQ>=0){$("#marketTimer").html("Financial News: &nbsp &nbsp &nbsp  &nbsp &nbsp"+marketStatus+hdelim+hoursQ+' Hours '+delim+minutesQ+' Minutes'); }
        
        if (distanceQ < 0 ) {
            clearInterval(y);
        }
    }, 1000);

}
    //END OF TIMER



// Initialize Firebase
// var config = {
//     apiKey: "AIzaSyDfQP6TQSTiLKBpE16fqOd_JDx-xfCS55g",
//     authDomain: "stocks-eeae4.firebaseapp.com",
//     databaseURL: "https://stocks-eeae4.firebaseio.com",
//     projectId: "stocks-eeae4",
//     storageBucket: "stocks-eeae4.appspot.com",
//     messagingSenderId: "623424739833"
//   };
//   firebase.initializeApp(config);

// let database = firebase.database();
// let auth = firebase.auth()
// $("#signIn").on("click", function(event) {
//     event.preventDefault()
//     const email = $("#email").val().trim()
//     const pass = $("#password").val().trim()
//     const signIn = auth.signInWithEmailAndPassword(email,pass)
//     signIn.catch(e => console.log(e.message))
// })
// console.log('running')
// $("#signUp").on("click", function(event) {
//     console.log("test")
//     event.preventDefault();
//     email = $("#email").val().trim()
//     pass = $("#password").val().trim()
//     console.log("email")
//     const signUp = auth.createUserWithEmailAndPassword(email,pass)
//     signUp.catch(e => console.log(e.message))
// })

// auth.onAuthStateChanged(firebaseUser => {
//     if (firebaseUser) {
//         console.log(`user logged in`)
//     } else {
//         console.log(`user logged out`)
//     }
// })

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

});