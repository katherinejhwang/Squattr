    var foreclosureArray = [];
   

   function addForclosures (cb) {
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
               if (data[i].propertyaddress){
                   foreclosureArray.push(data[i].propertyaddress.coordinates);
               }
           }
           cb()
  
   });
}
//showing google maps on the screen
var map;


function initMap() {
    addForclosures(function(){
        console.log(foreclosureArray);
        var uluru = {lat: 34.0689, lng: -118.4452};
        var map = new google.maps.Map(
            document.getElementById('map'), 
            {zoom : 14, 
            center : uluru});
    
            foreclosureArray.forEach(function(fc){
                // console.log(fc);
                var latLng = new google.maps.LatLng({ lat : fc[1], lng: fc[0]});
                console.log(latLng)
                var marker =  new google.maps.Marker({
                    
                    position: latLng, 
                    map: map})

            
            });
    });
    
    





    $(window).resize(function(){

        google.maps.event.trigger(map, "resize");
    });
  };
