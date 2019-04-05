$(document).ready(function () {

    //Disclaimer modal
    $("#disclaimer").modal('show');

    // Set up for landing
    $("#map").hide();
    $("#pano").hide();
    $("#showReviewModal").hide();
    

// empty array to store data being pulled from api
    var foreclosureArray = [];

//using ajax call to get data 
    function addForclosures(cb) {
        var queryURL = "https://data.lacity.org/resource/rd7m-rts2.json";
        $.ajax({
            url: queryURL,
            type: "GET",
            data: {
                "$limit": 100,
                //   "$$app_token" : "YOURAPPTOKENHERE" // i don't think this requires an API token or key unless we plan to go public
            }
        }).then(function (data) {
            for (var i = 0; i < data.length; i++) {
                // var squattCoordinates = data[i].propertyaddress.coordinates;
                if (data[i].propertyaddress) {
                    //Looping through data and looking for only "propertyaddress obj"
                    //within that object get the addres, city, state, and zip
                    var address = data[i].propertyaddress_address;
                    var city = data[i].propertyaddress_city;
                    var state = data[i].propertyaddress_state;
                    var zip = data[i].propertyaddress_zip;
                    foreclosureArray.push({
                        address: `${address} ${city} ${state} ${zip} `,
                        coords: data[i].propertyaddress.coordinates
                    });
                }
            }
            //call back function to grab the foreclosurArray
            
            cb()
        
        });
    }

    //showing google maps on the screen
    var map, infoWindow;

    //on submit button, show the map
    document.getElementById('submit').addEventListener('click', function () {
        geocodeAddress(geocoder, map);
        $("#map").toggle();
        
    });


    function geocodeAddress(geocoder, resultsMap){
            var address = document.getElementById('addressInput').value
            var rm = resultsMap;
            geocoder.geocode({ 'address': address }, function (results, status){
                if( status === 'OK'){
                    rm.setCenter(results[0].geometry.location);
                    var marker = new google.maps.Marker({
                        map: resultsMap,
                        position: results[0].geometry.location
                    });
                    marker.setMap(null);
                } else{
                    console.log('nope');
                }
            })
        }


        addForclosures(function () {
            // console.log(foreclosureArray);
            
            var map = new google.maps.Map(
                document.getElementById('map'),
                {
                    zoom: 14,
                    center: { lat: 34.0689, lng: -118.4452 }

                });

                infoWindow = new google.maps.InfoWindow;
            $("#currentLocation").on("click", function () {
            
                $("#map").toggle();
                $("#middleDiv").hide();
                

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    var pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };

                    infoWindow.setPosition(pos);
                    infoWindow.setContent('Location found.');
                    infoWindow.open(map);
                    map.setCenter(pos);
                }, function () {
                    handleLocationError(true, infoWindow, map.getCenter());
                });
            } else {
                // Browser doesn't support Geolocation
                handleLocationError(false, infoWindow, map.getCenter());
            }

            //
            //Throws error code if geolocation failed
            //
            function handleLocationError(browserHasGeolocation, infoWindow, pos) {
                infoWindow.setPosition(pos);
                infoWindow.setContent(browserHasGeolocation ?
                    'Error: The Geolocation service failed.' :
                    'Error: Your browser doesn\'t support geolocation.');
                infoWindow.open(map);
            }

        })

       

            foreclosureArray.forEach(function (fc) {
    
                var icon = {
                    url: "./assets/images/squatt.png",
                    scaledSize: new google.maps.Size(35, 35),
    
                }
    
                var latLng = new google.maps.LatLng({ lat: fc.coords[1], lng: fc.coords[0] });
                // console.log(latLng)
                 var marker = new google.maps.Marker({
                    icon: icon,
                    position: latLng,
                    map: map
                })

 
                //Event Listener for the Squattr Marker will (1) open up street map, (2) Pull Up Modal, and (3) show any logged for that address to the modal
                marker.addListener('click', function () {
                    
                    $("#pano").toggle();
                    var panorama = new google.maps.StreetViewPanorama(
                        document.getElementById('pano'), {
                            position: latLng,
                            pov: {
                                heading: 34,
                                pitch: 10
                            }
                        }
                    )
                    map.setStreetView(panorama);


                    //??NeedtogooverthiswithPatrickagain.  Everytime there is an update to the review, basically append the review to the modal
                    database.ref("reviews/" + fc.address).on("value", function (snapshot) {
                        
                        for (key in snapshot.val()) {
                            var review = snapshot.val()[key];
                            console.log(review);
                            var reviewWrapper = $("<div>");
                            $("#showReview").prepend(
                                $("<p>").text("Water: " + review.water),
                                $("<p>").text("Power: " + review.power),
                                $("<p>").text("Security: " + review.security),
                                $("<p>").text("Neighbors: " + review.neighbors),
                                $("<p>").text("Vermin: " + review.vermin),
                                $("<p>").text("Other Comments: " + review.otherComments)
                            );
                            $("#showReview").append(reviewWrapper);
                        }

                    })
                   
                    //eventlistener for the marker to pop-up modal for review
                    $("#showReviewModal").modal('show');
                   
                    //event listener for the marker to write address to the modal-title      
                    $(".modal-title").append("<h3>" + fc.address + "</h3>");
               
                    //upon clickingsubmit Review, write data to firebase and clear the form and the area written
                    $("#submitReview").on("click", function () {
                        reviews.reviewInput(fc.address);
                    });
                 
                });

            });
        

            });
    
            //clears showReviewmodal upon closing modal
            $("#showReviewClose").on("click", function() {
                $(".modal-title").html("");
                $("#showReview").empty();
                $("#reviewForm").trigger("reset");
            });

            // function resetReviews() {
            //         reviews = {
            //             water: "",
            //             power: "",
            //             security: "",
            //             neighbors: "",
            //             vermin: "",
            //             otherComments: "",
                    
            //     }
            // }

// Initialize Firebase
    var config = {
        apiKey: "AIzaSyBgsXpvv64II3MPuCvCc1K6W9hr1j8aItA",
        authDomain: "squattr-19bfc.firebaseapp.com",
        databaseURL: "https://squattr-19bfc.firebaseio.com",
        projectId: "squattr-19bfc",
        storageBucket: "squattr-19bfc.appspot.com",
        messagingSenderId: "847122013348"
};

    firebase.initializeApp(config);

    //set var database to equal to firebase.database();
    var database = firebase.database();

// Reviews
reviews = {

    //set up empty values
    water: "",
    power: "",
    security: "",
    neighbors: "",
    vermin: "",
    otherComments: "",

    //Function for pushing review information to firebase
    reviewInput: function (address) {
        reviews.water = $("#water").val().trim();
        reviews.power = $("#power").val().trim();
        reviews.security = $("#security").val().trim();
        reviews.neighbors = $("#neighbors").val().trim();
        reviews.vermin = $("#vermin").val().trim();
        reviews.otherComments = $("#otherComments").val().trim();
        database.ref('reviews/' + address).push({
            water: reviews.water,
            power: reviews.power,
            security: reviews.security,
            neighbors: reviews.neighbors,
            vermin: reviews.vermin,
            otherComments: reviews.otherComments,
        }).catch(error => {
            console.log(error);
        });
        reviews.water = "";
        reviews.power = "";
        reviews.security = "";
        reviews.neighbors = "";
        reviews.vermin = "";
        reviews.otherComments = "";

    },

} //close review object

database.ref().on("value", function (snapshot) {

    // If any errors are experienced, log them to console.
}, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
});

        })

$(window).resize(function () {

    google.maps.event.trigger(map, "resize");

});//close document ready function

