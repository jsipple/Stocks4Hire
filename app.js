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
    let date = []
    let favoriteId;
    let stockValue = []
    let aoeu;
    let keys5
    var clicked = true;
    let favArr = []
    let searchArr = []
    let num = 0;
    // Initialize Firebase
    function stock(input){
        var first;
        var last;

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


                stockValue = []
                date = []

                var num2 = -1

                
                for(var i = 0; i < response[input].chart.length; i++){

                    stockValue.push(response[input].chart[i].close);
                    date.push(response[input].chart[i].date);

                    num2++

                }

                first = stockValue[0];
                last = stockValue[num2];


                var color;

                var tbody = $("#stockslisted");
                // put this so that it doesn't take up whole line look for other ways around this
                var name = $("<td>").text(response[input].quote.companyName);
                var close = $("<td>").text("$" + stockValue[num2]);
                var canvas = $("<canvas>");

// adds the start icon on the stocks and allows you to click it changing what icon is shown and whether it is pushed to your favorites
                let favoriteIcon = $("<i>").addClass("fa fa-star-o").on("click", function() {
                    $(this).toggleClass("fa-star-o fa-star")
                    // grabs the ticker code of the stock that it is attached to
                    favoriteId = $(this).parent(".chart").attr("value")
                    if ($(this).hasClass("fa-star")) {
                        // this is keeping the star colored when refreshed seems to always have it stared
                        // pushes to firebase
                        database.ref('favorites/' + x).push({
                            favorite: $(this).parent(".chart").attr("value")
                        });
                    }
                // takes it out of favorites if changed to the empty star
                    if ($(this).hasClass("fa-star-o")) {
                        // goes to favorites and current user
                        database.ref("favorites/" + x).once("value", function(snap) {
                            let ack = snap.val()
                            // makes an array of the keys that are in firebase
                            let key1 = Object.keys(ack)
                            for (let j = 0; j < key1.length; j++) {
                                let k1 = key1[j]
                                // gives all of the favorites for that user one at a time
                                let rFav = ack[k1].favorite
                                // takes the favorite out
                                if (favoriteId == rFav) {
                                    database.ref("favorites/" + x).child(k1).set({
                                        favorite: null
                                    })
                                }
                            }
                        })
                    }
                    database.ref("favorites/").on("child_added", function(snap) {
                        // when favorite added adds it to an array so that you can call it later
                        let favoriteArr = []
                        let ab = snap.val()
                        let keys = Object.keys(ab)
                        for (let i = 0; i < keys.length; i++) {
                            let k = keys[i]
                            let fav = ab[k].favorite
                            favoriteArr.push(fav) 
                        }
                        // this is the array that is called and then resets favoriteArr so no duplicates happen
                        favArr = [...favoriteArr]
                        favoriteArr = []
                    });
                })
                canvas.attr("id", input).hide();
                // checks whether favorite has already been favorited
                if (favArr.indexOf(input) != -1) {
                    favoriteIcon.toggleClass("fa-star-o fa-star")
                }

        // appends stock data to the table
                var table = $("<tr>").append(name, close, favoriteIcon, "<br>").attr("val", input).addClass("chart").attr("value", input).attr('id', input + num)
// creates the graph and puts below stocks
                var newRow = $("<tr>").append($("<td>").attr("colspan", 2).append(canvas)) 

                tbody.prepend(table, newRow);
// below is chartJS it creates the graph

        // me adding the id here causes the graph not to appear

                tbody.prepend(table, newRow);

                if (first > last){
                    color = 'rgba(200, 0, 0, 1)'
                    $("#" + input + num).css("color", "red");
                }
                else if(first < last){
                    color = 'rgba(0, 200, 0, 1)'
                    $("#" + input + num).css("color", "green");
                }


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


                num++ 

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

// when clicking the add-button adds the stock to the stock div
    $("#add-button").on("click", function(event) {
        event.preventDefault()
        stock($("#user-input").val().trim())
        // stores this as recent searches in firebase
        database.ref('search/' + x).push({
            searches: $("#user-input").val().trim()
           });
    })
    // when clicking history button shows the last 5 searches
    $("#history").on("click", function() {
        database.ref("search/").once("value", function(snap) {
            if (x != undefined) {
            let abc = snap.val()
            // below grabs the users
            let keys3 = Object.keys(abc)
            for (let o = 0; o < keys3.length; o++) {
                // matches the user to the correct property
                if (keys3[o] == x) {
                    aoht = abc[keys3[o]]
                    // grabs the keys firebase created and makes an array
                    keys7 = Object.keys(aoht)
                    for (let e = 0; e < keys7.length; e++) {
                        // grabs each individual key
                    let k2 = keys7[e]
                    // grabs each individual search
                    let searchy = aoht[k2].searches
                    // if there are more than 5 searches in firebase deletes oldest ones
                    if (searchArr.length > 5) {
                        
                            database.ref("search/" + x).child(keys7[5]).set({
                                searches: null
                        })
                    }
                    // put them to search array from front to back so that keys7[5] works if do keys7[0] deletes all history
                    searchArr.unshift(searchy)
                    }
                }
            }
        }
        // empties out the stock and news tables and replaces them with last five searched
        if (!x) {
        $("#newsArticles").empty()
        $("#stockslisted").empty()
        $("#stock").text("History")
        for (let t = 0; t < 5; t++) {
        stock(searchArr[t])
        }
    }
        searchArr = []
})
    })

    // when clicking favorites button empties out news and stock and shows favorites
    $("#favs").on("click", function(event) {
        if (!x) {
        event.preventDefault()
        $("#stockslisted").empty()
        $("#newsArticles").empty()
        $("#stock").text("Favorites")
        for (let b = 0; b < favArr.length; b++) {
            stock(favArr[b])
        }
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
        ((weekday>5) || (weekday==5 && ((parseInt(moment().format('HH'))==16) && (parseInt(moment().format('mm'))>0) || (parseInt(moment().format('HH'))>=16))) || (weekday==0)) 
            ||  
        (   (weekday==1) && ((parseInt(moment().format('HH'))<9) || (parseInt(moment().format('HH'))==9 && (parseInt(moment().format('mm')))<25))
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
    // grabs email and password and compares to the users on firebase
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
    // creates a user and stores their information in firebase to be called later
    // also signs the user in
    const signUp = auth.createUserWithEmailAndPassword(email,pass)
    signUp.catch(e => console.log(e.message))
})

// signs the user out and empties the stock and news sections
$("#logoutBtn").on("click", function() {
    auth.signOut()
    $("#newsArticles").empty()
    $(".chart").empty()
    favArr = []
})
// checks whether the user is logged in
auth.onAuthStateChanged(firebaseUser => {
    if (firebaseUser) {
        // if user logged in allows this button to dismiss the modal
        $("#signIn").attr("data-dismiss", "modal")
        $("#signUp").attr("data-dismiss", "modal")
        $("#Welcome").text(`Welcome ${firebaseUser.displayName}`)
        $("#signUpModal").hide()
        $("#signInModal").hide()
        $("#logout").show()
        if (username != null) {
            // adds the display name to their profile(email and pass automatically added already)
        auth.currentUser.updateProfile({
            displayName: username,
        })
    }
    // sets the user variable
    x = firebaseUser.displayName
    } else {
        // shows the buttons that should be shown if user not signed in
        $("#signUpModal").show()
        $("#signInModal").show()
        $("#logout").hide()
        $("#Welcome").empty()
    }
})

// runs when something is added to users favorites
database.ref().on("child_added", function(snap) {
    if (x != undefined) {
    let ab = snap.val()
    // grabs user
    let keys = Object.keys(ab)
    for (let i = 0; i < keys.length; i++) {
        if (keys[i] == x) {
            // grabs keys
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
