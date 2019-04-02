$(document).ready(function () {
    $("#disclaimer").modal('show');

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

    //set up review object for each address

    // var addressR = fc.address
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

        },

    } //close review object
    // } //closes addressR object

    database.ref().on("value", function (snapshot) {

        // If any errors are experienced, log them to console.
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
    });

    //on click of submit button, run the function reviewInput



    var foreclosureArray = [];


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
            // console.log(data.length);
            // console.log(coordinates);
            for (var i = 0; i < data.length; i++) {
                //    console.log(data[i]);
                // var squattCoordinates = data[i].propertyaddress.coordinates;
                if (data[i].propertyaddress) {
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
            cb()

        });
    }
    //showing google maps on the screen
    var map, infoWindow;

    $("#map").hide();
    $("#pano").hide();
    $("#showReviewModal").hide();

    $("#currentLocation").on("click", function () {

        $("#map").toggle();


        addForclosures(function () {
            // console.log(foreclosureArray);
            var uluru = { lat: 34.0689, lng: -118.4452 };
            var map = new google.maps.Map(
                document.getElementById('map'),
                {
                    zoom: 14,
                    center: uluru,

                });


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


            function handleLocationError(browserHasGeolocation, infoWindow, pos) {
                infoWindow.setPosition(pos);
                infoWindow.setContent(browserHasGeolocation ?
                    'Error: The Geolocation service failed.' :
                    'Error: Your browser doesn\'t support geolocation.');
                infoWindow.open(map);
            }



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

                //Event Listener for the Marker will (1) open up street map, (2) Pull Up Modal, and (3) show any logged for that address to the modal
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
                    database.ref("reviews/" + fc.address).on("value", function (snapshot) {
                        console.log(snapshot.val());
                        for (key in snapshot.val()) {
                            var review = snapshot.val()[key];
                            console.log(review);
                            var reviewWrapper = $("<div>");
                            $(reviewWrapper).append(
                                $("<p>").text("Water: " + review.water),
                                $("<p>" + "Power: " + review.power + "</p>"),
                                $("<p>" + "Security: " + review.security + "</p>"),
                                $("<p>" + "Neighbors: " + review.neighbors + "</p>"),
                                $("<p>" + "Vermin: " + review.vermin + "</p>"),
                                $("<p>" + "Other Comments: " + review.otherComments + "</p>")
                            );
                            $(".modal-body").append(reviewWrapper);
                        }

                    })
                    $("#showReviewModal")
                    //second eventlistener for the marker to pop-up modal for review
                    $("#showReviewModal").modal('show');

                    //even listener to write the review to the modal
                    $(".modal-title").append("<p>" + fc.address + "</p>");
                    $("#submit").on("click", function () {
                        reviews.reviewInput(fc.address);
                    });


                });

                //pushing reviews to firebase
                // database.ref('latLng').set({
                //       latLng: {
                //         water: reviews.water,
                //         power: reviews.power,
                //         security: reviews.security,
                //         neighbors: reviews.neighbors,
                //         vermin: reviews.vermin,
                //         otherComments: reviews.otherComments,    
                //       }
                // })





            })


        })
    })
    //Function to create each review
    // function createReview (review, coords) {
    //     database.ref('reviews/'+ coords.toString()).set(review);
    // }


});



$(window).resize(function () {

    google.maps.event.trigger(map, "resize");
});

 //close document ready function

