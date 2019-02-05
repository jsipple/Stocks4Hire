
$(document).ready(function() {

    let date = []
    let favoriteId;
    let stockValue = []

    var clicked = true;

    // Initialize Firebase
    

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
        // put this so that it doesn't take up whole line look for other ways around this
        var name = $("<td>").text(response[input].quote.companyName);
        var close = $("<td>").text("$" + response[input].chart[20].close);
        var canvas = $("<canvas>");
        // might change the click event to be on the td because when on tr can't click the favorite icon also need to grab the tr val when clicked
        let favoriteIcon = $("<i>").addClass("fa fa-star-o").on("click", function() {
            $(this).toggleClass("fa-star-o fa-star")
            // alternating but toggle class not working because adding if i do opposite just taking out
            favoriteId = $(this).parent(".chart").attr("value")
            if ($(this).hasClass("fa-star")) {
                console.log("a")
                // this is keeping the star colored when refreshed seems to always have it stared
                // below grabs the value of the chart and that would grab the search term
                console.log($(this).parent(".chart").attr("value"))
                database.ref('favorites/' + x).push({
                    favorite: $(this).parent(".chart").attr("value")
                   });
            }
        })
        canvas.attr("id", input).hide();
// me adding the id here causes the graph not to appear
        var table = $("<tr>").append(name, close, favoriteIcon, "<br>").attr("val", input).addClass("chart").attr("value", input)

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
                var dates = response.articles[i].publishedAt.substr(0,10);
                var author = response.articles[i].author;
                // what does this do? seems to be looking to replace the first if it starts with a letter with nothing but theres thi g for some reason
                var itemval=item.replace(/[^a-zA-Z ]/g, "").split(" ").join("");
                
                var tbody = $("#newsArticles");
                var name = $("<td>").text('Click here for latest news for '+item);
                var newslink = $("<td>").html('<a href="'+newsURL+'" target="blank">'+title+' (Date: '+dates+') '+'Author: '+author+'</a>');
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
        var delim=" , 0";
    }else{
        var delim=" , "; 
    }
    if (hoursQ<9){
        var hdelim=" 0";
    }else{
        var hdelim=" "; 
    }

        if(secondsQ>=0){$("#marketTimer").html("Financial News: &nbsp &nbsp &nbsp  &nbsp &nbsp"+marketStatus+hdelim+hoursQ+' hrs '+delim+minutesQ+' mins'); }
        
        if (distanceQ < 0 ) {
            clearInterval(y);
        }
    }, 1000);

}
    //END OF TIMER



// Initialize Firebase
var config = {
    apiKey: "AIzaSyDfQP6TQSTiLKBpE16fqOd_JDx-xfCS55g",
    authDomain: "stocks-eeae4.firebaseapp.com",
    databaseURL: "https://stocks-eeae4.firebaseio.com",
    projectId: "stocks-eeae4",
    storageBucket: "stocks-eeae4.appspot.com",
    messagingSenderId: "623424739833"
  };
  firebase.initializeApp(config);
let database = firebase.database();
let auth = firebase.auth()
let user = auth.currentUser
let username = null
let x;


$("#signIn").on("click", function(event) {
    event.preventDefault()
    const email = $("#email").val().trim()
    const pass = $("#password").val().trim()
    const signIn = auth.signInWithEmailAndPassword(email,pass)
    signIn.catch(e => console.log(e.message))
})
$("#signUp").on("click", function(event) {
    console.log("test")
    event.preventDefault();
    username = $("#entry-displayname").val().trim()
    const email = $("#entry-email").val().trim()
    const pass = $("#entry-password").val().trim()
    console.log("entry-email")
    console.log(username)
    const signUp = auth.createUserWithEmailAndPassword(email,pass)
    signUp.catch(e => console.log(e.message))
    console.log(auth.currentUser)
})



//   if (user != null) {
//     user.providerData.forEach(function (profile) {
//       console.log("Sign-in provider: " + profile.providerId);
//       console.log("  Provider-specific UID: " + profile.uid);
//       console.log("  Name: " + profile.displayName);
//       console.log("  Email: " + profile.email);
//       console.log("  Photo URL: " + profile.photoURL);
//     });
//   }

//   user.updateProfile({
//     displayName: "Jane Q. User",
//     photoURL: "https://example.com/jane-q-user/profile.jpg"
//   }).then(function() {
//     // Update successful.
//   }).catch(function(error) {
//     // An error happened.
//   });

$("#logoutBtn").on("click", function() {
    auth.signOut()
})
auth.onAuthStateChanged(firebaseUser => {
    if (firebaseUser) {
        console.log(`user logged in`)
        $("#signUpModal").hide()
        $("#signInModal").hide()
        $("#logout").show()
        if (username != null) {
        auth.currentUser.updateProfile({
            displayName: username,
        })
    }
    // this isn't working
    x = firebaseUser.displayName
    $("#welcome").text(`Welcome ${firebaseUser.displayName}`)
    } else {
        console.log(`user logged out`)
        $("#signUpModal").show()
        $("#signInModal").show()
        $("#logout").hide()
        $("#welcome").empty()
    }
})

database.ref('favorites/' + x).on("value", function(snap) {
    console.log(snap.val())
})

});
