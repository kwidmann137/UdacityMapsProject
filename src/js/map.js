//global variables for map
var map;
var bounds;
var defaultFeaturedIcon;
var selectedFeaturedIcon;
var defaultIcon;
var selectedIcon;
var largeInfoWindow;
//html format for the info window
var infoWindowContent = '<div class="row infoWindowRow"><h3>%name%</h3></div><div class="row infoWindowRow"><p class="col-xs-7">Yelp Review: %yelpReview% </p><img class="col-xs-5 img-responsive" src="%src%"></div>';

//initializes the map
function initMap() {
    window.onload = function() {
        // Create a map object and specify the DOM element for display.
        map = new google.maps.Map(document.getElementById('map'), {
            center: {
                lat: 29.494119,
                lng: -98.705823
            },
            zoom: 12
        });
        bounds = new google.maps.LatLngBounds();

        //variables for markers
        defaultFeaturedIcon = './images/featuredIcon.png';
        selectedFeaturedIcon = './images/selectedIcon.png';
        defaultIcon = './images/defaultIcon.png';
        selectedIcon = './images/selectedIcon.png';
        largeInfoWindow = new google.maps.InfoWindow();

        //add featured locations
        createFeaturedLocation("Golf Club of Texas, San Antonio, TX");
        createFeaturedLocation("Lone Star Crossfit, San Antonio, TX");
        createFeaturedLocation("Top Golf, San Antonio, TX");
        createFeaturedLocation("K1 Speed, San Antonio, TX");
        createFeaturedLocation("Mission San Jose Church, San Antonio, TX");
        createFeaturedLocation("The Alamo, San Antonio, TX");
        createFeaturedLocation("Government Canyon, San Antonio, TX");
    }
}

//creates a featured location, sends to yelp for info
function createFeaturedLocation(locationKeyword) {
    var request = {
        query: locationKeyword,
        bounds: map.getBounds()
    }
    var allResults = [];

    var service = new google.maps.places.PlacesService(map);
    service.textSearch(request, callback);

    function callback(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            for (var i = 0; i < results.length; i++) {
                var marker = new google.maps.Marker({
                    map: map,
                    position: results[i].geometry.location,
                    name: results[i].name,
                    animation: google.maps.Animation.DROP,
                    id: results[i].place_id,
                    icon: defaultFeaturedIcon,
                });
                //get yelp info for this result
                yelpSearch("San Antonio", results[i].name, results[i], marker, "featured");
                bounds.extend(results[i].geometry.location)
            }
        }
        map.fitBounds(bounds);
    }
}

//searches google maps for desired keyword from model,forwards to yelp for yelp info
function mapSearch(searchKeyword) {
    var request = {
        query: searchKeyword,
        bounds: map.getBounds()
    }
    var allResults = [];

    var service = new google.maps.places.PlacesService(map);
    service.textSearch(request, callback);

    function callback(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            for (var i = 0; i < results.length; i++) {

                var marker = new google.maps.Marker({
                    map: map,
                    position: results[i].geometry.location,
                    name: results[i].name,
                    animation: google.maps.Animation.DROP,
                    id: results[i].place_id,
                    icon: defaultIcon,
                });
                yelpSearch("San Antonio", results[i].name, results[i], marker, "search");
                bounds.extend(results[i].geometry.location)
            }
        }
        map.fitBounds(bounds);
    }
}

//clears the marker from teh map
function mapClearMarker(marker) {
    marker.setMap(null);
}

//makes marker active on teh map
function mapSetMarker(marker) {
    marker.setMap(map);
    bounds.extend(marker.position);
    map.fitBounds(bounds);
}

//aniomtes the marker based on type, triggered by a click on the marker
function mapAnimateMarker(marker, type) {
    //here is where we will change the icon if that list item is clicked
    if (type == "search") {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        marker.setIcon(selectedIcon);
        setTimeout(function() {
            marker.setAnimation(null);
            marker.setIcon(defaultIcon);
        }, 3000);
    } else if (type == "featured") {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        marker.setIcon(selectedFeaturedIcon);
        setTimeout(function() {
            marker.setAnimation(null);
            marker.setIcon(defaultFeaturedIcon);
        }, 3000);
    }
}

//populate the info window with marker info when clicked
function populateInfoWindow(marker, infoWindow, yelpData, result) {
    if (infoWindow.marker != marker) {
        infoWindow.marker = marker;
        var formattedInfoWindow = infoWindowContent.replace("%name%", result.name);
        var photoURL = typeof result.photos !== 'undefined' ?
            result.photos[0].getUrl({
                'maxWidth': 150,
                'maxHeight': 150
            }) :
            ''; //alternative a "nophoto.jpg"
        formattedInfoWindow = formattedInfoWindow.replace("%src%", photoURL);
        var yelpReview = yelpData !== null ? yelpData.snippet_text : 'Not Available...';
        formattedInfoWindow = formattedInfoWindow.replace("%yelpReview%", yelpReview);
        infoWindow.setContent(formattedInfoWindow);
        infoWindow.open(map, marker);
        infoWindow.addListener('closeclick', function() {
            this.marker = null;
        }, infoWindow);
    }
};


//adds a completed featured location to the model
function mapAddCompletedFeaturedLocation(yelpData, result, marker) {
    //if names don't match dont and addressed don't match, set yelp to null
    if (yelpData != null && yelpData.name != result.name && result.formatted_address.toLowerCase().search(yelpData.location.address[0].toLowerCase()) < 0) {
        yelpData = null;
    }
    marker.addListener('click', function() {
        populateInfoWindow(this, largeInfoWindow, yelpData, result);
    });
    //add the location to the knockout array
    myVM.addFeaturedLocation(yelpData, result, marker);
}

//adds a compelted search location to the model
function mapAddCompletedSearchLocation(yelpData, result, marker) {
    //if names don't match dont and addressed don't match, set yelp to null
    if (yelpData != null && yelpData.name != result.name && result.formatted_address.toLowerCase().search(yelpData.location.address[0].toLowerCase()) < 0) {
        yelpData = null;
    }
    marker.addListener('click', function() {
        populateInfoWindow(this, largeInfoWindow, yelpData, result);
    });
    //if they do match add review to location
    //add the location to the knockout array
    myVM.addSearchResult(yelpData, result, marker);
}