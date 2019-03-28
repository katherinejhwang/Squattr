$(document).ready(function() {

    // Do I need an array?
    var addressMap = "";

    //FUNCTION for rendering the Map
    function renderMap() {
        //deleting prior input to adding new activity to prevent repeat rendering
        $("#addressInput").empty();

       //Fun function renderMap upon the click of the submit button
        $("#submit").on("click", function () {
            var activity = $(this).attr("data-name");
            var queryURL = "https://maps.googleapis.com/maps/api/streetview?size=600x300&" + addressMap + "&key=AIzaSyDeGHL5IOI-aLC6AkKUL-ft9Ok29UL2mGM";
        
        $.ajax({
          url: queryURL,
          method: "GET",
        }).then(function(response) {
            console.log(response);
            var results = response.data;
            $("#squattDetails").append()
                var newDiv = $("<div>");
                activityImage.addClass("image");


            // var activityDiv = $("<div style='display: inline-block; margin: 0px 10px'>");
            // activityImage.addClass("image");
            // activityImage.attr('src',results[j].images.fixed_height_still.url);
            // activityImage.attr('data-state', 'still');
            // console.log('set still');
            // var stillImage = activityImage.attr('data-still',results[j]
            // .images.fixed_height_still.url);
            // console.log(stillImage);
            // var animateImage = activityImage.attr('data-animate',results[j].images.fixed_height.url);
            // console.log(animateImage);
            // activityDiv.append(activityImage);
            // activityDiv.append(pDiv);
            // $("#gifs-appear-here").prepend(activityDiv);
            }
          });
      }); //close function to generate giphys
       
  }; //close renderbutton function

  
}); //closing document write function