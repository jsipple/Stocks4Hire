$(document).ready(function() {
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
    let username = null
    let x;
    let remove;
    let date = []
    let favoriteId;
    let stockValue = []
    let user;
    let aoeu;
    let keys5
    var clicked = true;
    let favArr = []
    let sArr = [];
    let searchArr = []
    // Initialize Firebase
    function stock(input){
        var first;
        var last;

        date = []

        stockValue = []

        input = input.toUpperCase();

        var queryURL = "https://api.iextrading.com/1.0/stock/market/batch?symbols=" + input + "&types=quote,chart&range=1m&last=5";

        $.ajax({
        url: queryURL,
        method: "GET",
        error: function (error) {
            console.log(error);
        } 
        })//catch the error for when the company name is empty
        .catch(function(response) {
            if (response.status === 400) {
                $("#compCode").html(input+" Missing Company Code");
                $("#compNotFound").show();  
                $(":button").on("click", function(event) {
                    if ($(this).attr("data-dismiss")=='modal'){
                        $("#compNotFound").hide();
                    }
                }); 
                //clear console only when error 400 is found 
                console.clear();
                return;
                
            }else{
                return response;
            }
        })
        .then(function(response){
            if(!response){
                return;
            }
            
            if (response[input]!=undefined ){

                getNews(response[input].quote.companyName);
                
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
                var close = $("<td>").text("$" + response[input].chart[19].close);
                var canvas = $("<canvas>");

                // might change the click event to be on the td because when on tr can't click the favorite icon also need to grab the tr val when clicked

                let favoriteIcon = $("<i>").addClass("fa fa-star-o").on("click", function() {
                    $(this).toggleClass("fa-star-o fa-star")
                    // alternating but toggle class not working because adding if i do opposite just taking out
                    favoriteId = $(this).parent(".chart").attr("value")
                    if ($(this).hasClass("fa-star")) {
                        // this is keeping the star colored when refreshed seems to always have it stared
                        // below grabs the value of the chart and that would grab the search term
                        database.ref('favorites/' + x).push({
                            favorite: $(this).parent(".chart").attr("value")
                        });
                    }
                
                    if ($(this).hasClass("fa-star-o")) {
                        // gets company code
                        // maybe make this do a .once
                        database.ref("favorites/" + x).once("value", function(snap) {
                            let ack = snap.val()
                            let key1 = Object.keys(ack)
                            for (let j = 0; j < key1.length; j++) {
                                let k1 = key1[j]
                                let rFav = ack[k1].favorite
                                if (favoriteId == rFav) {
                                    database.ref("favorites/" + x).child(k1).set({
                                        favorite: null
                                    })
                                }
                            }
                        })
                    }
                    database.ref("favorites/").on("child_added", function(snap) {
                        // this is doing for all users need to make user specific
                        let favoriteArr = []
                        let ab = snap.val()
                        let keys = Object.keys(ab)
                        for (let i = 0; i < keys.length; i++) {
                            let k = keys[i]
                            let fav = ab[k].favorite
                            favoriteArr.push(fav) 
                        }
                        favArr = [...favoriteArr]
                        favoriteArr = []
                    });
                })
                canvas.attr("id", input).hide();
                if (favArr.indexOf(input) != -1) {
                    favoriteIcon.toggleClass("fa-star-o fa-star")
                }
        // me adding the id here causes the graph not to appear
                var table = $("<tr>").append(name, close, favoriteIcon, "<br>").attr("val", input).addClass("chart").attr("value", input)

                var newRow = $("<tr>").append($("<td>").attr("colspan", 2).append(canvas)) 

                tbody.prepend(table, newRow);

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
            
                        clicked = true;
                    }
                    else if(clicked){
            
                        $("#" + click).show();

                        clicked = false;

                        
                    }
                });
   //api calls to get news links for the stock searched         
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
                        // replaces the special characters in the string company name so it can be used for class names
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

            }else{
                $("#compCode").html(input+" Not Found");
                $("#compNotFound").show();
                $(":button").on("click", function(event) {
                    if ($(this).attr("data-dismiss")=='modal'){
                        $("#compNotFound").hide();
                    }
                });
            }
        });

    };


    $("#add-button").on("click", function(event) {
        event.preventDefault()
        stock($("#user-input").val().trim())
        // need to add storing for the users recent searches then can make a similar click or just append below
        database.ref('search/' + x).push({
            searches: $("#user-input").val().trim()
           });
    })
    $("#history").on("click", function() {
        // below is grabbing favorites not searches
        database.ref("search/").once("value", function(snap) {
            if (x != undefined) {
            let abc = snap.val()
            // look into what the below does
            // const arrOfUsers = Object.entries(abc); // [key, value]
            // const match = arrOfUsers.find()
            let keys3 = Object.keys(abc)
            for (let o = 0; o < keys3.length; o++) {
                if (keys3[o] == x) {
                    aoht = abc[keys3[o]]
                    keys7 = Object.keys(aoht)
                    for (let e = 0; e < keys7.length; e++) {
                    let k2 = keys7[e]
                    let searchy = aoht[k2].searches
                    
                    if (searchArr.length > 5) {
                        
                            database.ref("search/" + x).child(keys7[5]).set({
                                searches: null
                        })
                    }
                    searchArr.unshift(searchy)
                    }
                }
            }
        }
        // also need to do the same with news
        $("#newsArticles").empty()
        $("#stockslisted").empty()
        $("#stock").text("History")
        for (let t = 0; t < 5; t++) {
        stock(searchArr[t])
        }
        searchArr = []
})
    })

    
    $("#favs").on("click", function(event) {
        event.preventDefault()
        $("#stockslisted").empty()
        $("#newsArticles").empty()
        $("#stock").text("Favorites")
        for (let b = 0; b < favArr.length; b++) {
            stock(favArr[b])
        }
    })
    ////Market close/open TIMER
    var tday =moment('16:00', 'HH:mm');
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
    
    if( //after 4:00 on friday
        ((weekday>5) || (weekday==5 && (parseInt(moment().format('HH')==16) && parseInt(moment().format('mm')>0) || parseInt(moment().format('HH')>=16))) || (weekday==0)) 
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

        if(secondsQ>=0){$("#marketTimer").html("Financial News: &nbsp &nbsp &nbsp  &nbsp &nbsp"+marketStatus+hdelim+hoursQ+' hrs '+delim+minutesQ+' min'); }
        
        if (distanceQ < 0 ) {
            clearInterval(y);
        }
    }, 1000);

}
    //END OF TIMER

// Initialize Firebase

$("#signIn").on("click", function(event) {
    event.preventDefault()
    const email = $("#email").val().trim()
    const pass = $("#password").val().trim()
    const signIn = auth.signInWithEmailAndPassword(email,pass)
    signIn.catch(e => console.log(e.message))
})
$("#signUp").on("click", function(event) {
    event.preventDefault();
    username = $("#entry-displayname").val().trim()
    const email = $("#entry-email").val().trim()
    const pass = $("#entry-password").val().trim()
    const signUp = auth.createUserWithEmailAndPassword(email,pass)
    signUp.catch(e => console.log(e.message))
})


$("#logoutBtn").on("click", function() {
    auth.signOut()
    $("#newsArticles").empty()
    $(".chart").empty()
    favArr = []
})
auth.onAuthStateChanged(firebaseUser => {
    if (firebaseUser) {
        $("#signIn").attr("data-dismiss", "modal")
        $("#signUp").attr("data-dismiss", "modal")
        $("#Welcome").text(`Welcome ${firebaseUser.displayName}`)
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
    } else {
        $("#signUpModal").show()
        $("#signInModal").show()
        $("#logout").hide()
        $("#Welcome").empty()
    }
})

// reminder to clean up the variables here
database.ref().on("child_added", function(snap) {
    if (x != undefined) {
    let ab = snap.val()
    let keys = Object.keys(ab)
    for (let i = 0; i < keys.length; i++) {
        if (keys[i] == x) {
            aoeu = ab[keys[i]]
            keys5= Object.keys(aoeu)
            for (j = 0; j < keys5.length; j++) {
            let k = keys5[j]
            let fav = aoeu[k].favorite
            favArr.push(fav)
            }
        }
    }
}
});

});
