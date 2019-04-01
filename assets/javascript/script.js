

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
var map, infoWindow;

$("#map").hide();

$("#currentLocation").on("click", function initMap() {

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
                url : "./assets/images/squatt.png",
                scaledSize: new google.maps.Size(35,35),

            }

            var latLng = new google.maps.LatLng({ lat: fc.coords[1], lng: fc.coords[0] });
            // console.log(latLng)
            var marker = new google.maps.Marker({
                icon : icon,    
                position: latLng,
                map: map
            })


        })
    })

});





$(window).resize(function () {

    google.maps.event.trigger(map, "resize");
});
