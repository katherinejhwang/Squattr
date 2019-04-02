var foreclosureArray = [];


//Google function to call the maps 
function initMap() {

    console.log(google);
    geocoder = new google.maps.Geocoder();
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
            //    console.log(data.length);
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
    var map, infoWindow, geocoder;

    $("#map").hide();
    $("#pano").hide();



// sets the location to UCLA as default, but when using current location or user address
// this will update to the correct location. 
//
    addForclosures(function () {
        map, infoWindow;
        map = new google.maps.Map(
            document.getElementById('map'),
            {
                zoom: 14,
                center: { lat: 34.0689, lng: -118.4452 }

            });

        infoWindow = new google.maps.InfoWindow;
        //
        // getGeoLocationInfo
        $("#currentLocation").on("click", function () {

            displayCustomMarkers();
            $("#map").toggle();

            //
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    var pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };

                    infoWindow.setPosition(pos);
                    infoWindow.setContent('We found you.');
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
            //Throws error code if geolocation failed.
            //
            function handleLocationError(browserHasGeolocation, infoWindow, pos) {
                infoWindow.setPosition(pos);
                infoWindow.setContent(browserHasGeolocation ?
                    'Error: The Geolocation service failed.' :
                    'Error: Your browser doesn\'t support geolocation.');
                infoWindow.open(map);
            }



        })

    });

    //
    // displays custom markers on mapd displayCustomMarkers(...)
    //
    function displayCustomMarkers() {
        

        foreclosureArray.forEach(function (fc) {

            var icon = {
                url: "./assets/images/squatt.png",
                scaledSize: new google.maps.Size(35, 35),

            }

            var latLng = new google.maps.LatLng({ lat: fc.coords[1], lng: fc.coords[0] });
            console.log(fc)
            var marker = new google.maps.Marker({
                icon: icon,
                position: latLng,
                map: map
            })
            //
            // add clicks for street view
            //
            marker.addListener('click', function () {
                $("#pano").toggle();
                var panorama = new google.maps.StreetViewPanorama(

                    document.getElementById('pano'), {
                        position: latLng,
                        pov: {
                            heading: 34,
                            pitch: 10
                        }
                    })
                map.setStreetView(panorama);
                console.log(panorama);
            })


        })

    }
    //user input for address
    document.getElementById('submit').addEventListener('click', function () {
        geocodeAddress(geocoder, map);
        $("#map").toggle();
        displayCustomMarkers();

    });


// code for geolocation address
    function geocodeAddress(geocoder, resultsMap) {
        var address = document.getElementById('addressInput').value
        document.getElementById('addressInput');
        var rm = resultsMap;
        console.log(geocoder);
        geocoder.geocode({ 'address': address }, function (results, status) {
            if (status === 'OK') {
                rm.setCenter(results[0].geometry.location);
                var marker = new google.maps.Marker({
                    map: resultsMap,
                    position: results[0].geometry.location
                });
                marker.setMap(null);
            } else {
                console.log('Geocode was not succesful for the following reason: ' + status);
            }
        })
    }








    $(window).resize(function () {

        google.maps.event.trigger(map, "resize");
    });

}

