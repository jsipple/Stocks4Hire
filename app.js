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

// below don't do anything let these will work with favorite icon to click and favorite dropdown
$("#fav").on("click", function() {
    database.ref('favorites/' + x).push({
        favorite: $(this).val().trim()
       });
})

let favorites = []
    database.ref('favorites/' + x).on("child_added", function(snap) {
        console.log(snap.val().favorite)
    })


let API = "https://api.iextrading.com/1.0"
let query = "/stock/aapl/chart"
let date = 5
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

// firebase.auth().onAuthStateChanged(function(user) {
//     if (user) {
//       // User is signed in.
//       var displayName = user.displayName;
//       var email = user.email;
//       var emailVerified = user.emailVerified;
//       var photoURL = user.photoURL;
//       var isAnonymous = user.isAnonymous;
//       var uid = user.uid;
//       var providerData = user.providerData;
//       // ...
//     } else {
//       // User is signed out.
//       // ...
//     }
//   });

