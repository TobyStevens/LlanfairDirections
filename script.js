/************\
|INITIALISING|
\************/
    
// initialise variables to refer to the various API objects
var map;
var infoWindow;
var geocoder;
var marker;
var directionsService;
var directionsDisplay;

var startPos;
var endPos = {lat: 53.2596007, lng: -3.981409};

// initialise the API objects. this is done via Google's callback
function initMap() {
    
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 51.507, lng: 0.127},
        zoom: 8
    });

    // initialise an info window for testing purposes
    infoWindow = new google.maps.InfoWindow({map: map});
    infoWindow.close();

    // create a geocoder for use if user manually enters address
    geocoder = new google.maps.Geocoder();
    geolocateUser();
    
    // create a marker for this map, but don't display it
    marker = new google.maps.Marker({
        map: map
    });
    
    // Initialise objects to be used in calculating directions
    directionsService = new google.maps.DirectionsService();
    directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplay.setMap(map);
    
    
    
};


/*********\
|FUNCTIONS|
\*********/

// Uses a manually entered address to work out user location
// TODO: don't make a marker with this, use as start point for directions instead
function geocodeAddress(geocoder, resultsMap) {
    var address = $('#address').val();
    geocoder.geocode({'address': address}, function(results, status) {
        if (status === 'OK') {
            // successfully geocoded - get rid of the box
            $('#locationBox').addClass('hidden');
            
            // set the start position for directions and ask the directions service to plan a route, default to driving
            startPos = results[0].geometry.location;
            getDirections(directionsService, directionsDisplay, 'DRIVING');
        } else {
            // geocode failed, give error alert
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });
}

// Uses geolocation to find the user's current position
// TODO: don't make a marker with this, use as start point for directions instead
function geolocateUser() {
    if (navigator.geolocation) {
        // the geolocation succeeded so place a marker
        navigator.geolocation.getCurrentPosition(function(position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            
            // set the start position for directions and ask the directions service to plan a route, default to driving
            startPos = pos;
            getDirections(directionsService, directionsDisplay, 'DRIVING');
        }, function() {
            handleLocationError(true);
        });
    } else {
        // Browser doesn't support geolocation
        handleLocationError(false);
    }
}

// Gives an error message if geolocation doesn't work
function handleLocationError(browserHasGeolocation) {
    $('#locationBox').removeClass('hidden');
}

// Calculates and displays the directions from user's current location to the Pavilion, Llanfairfechan
function getDirections(directionsService, directionsDisplay, travelMode) {
    directionsService.route({
        origin: startPos,
        destination: endPos,
        travelMode: travelMode
    }, function(response, status) {
        if (status === 'OK') {
            setDisplayPanel();
            
            directionsDisplay.setDirections(response);
            $('#directionsBox').removeClass('hidden');
            $('#mobileDirectionsBox').removeClass('hidden');
            $('#toggleDirections').removeClass('hidden');
        } else {
            alert('Directions request failed due to: ' + status);
        }
    });
};

// set the directions display panel to one of two divs depending on the size of the viewport
function setDisplayPanel() {
    if ($(window).width() >= 992) {
        directionsDisplay.setPanel(document.getElementById('directionsView'));
        $('#mobileDirectionsView').addClass('hidden');
    } else {
        directionsDisplay.setPanel(document.getElementById('mobileDirectionsView'));
    }
}


/*********\
|LISTENERS|
\*********/

// Disable the geocoder button if there's no address
$('#address').keyup(function(event) {
        text = $('#address').val();
        if (text.length > 0) {
            // there's an address
            $('#geocodeButton').removeClass('disabled');
        } else {
            // no address
            $('#geocodeButton').addClass('disabled');
        }
});

// Listen for the geocode button
$('#geocodeButton').click(function(event) {
    geocodeAddress(geocoder, map);
});

// listen for enter key to geocode
$(document).keydown(function(event) {
    if (event.which === 13 && !$('#geocodeButton').hasClass('disabled')) {
        // User has manually entered an address, therefore geocode
        geocodeAddress(geocoder, map);
    }
});

// listen for a change in travel mode
$('.nav li').click(function(event) {
    $('.nav li').removeClass('active');
    $(this).addClass('active');
    getDirections(directionsService, directionsDisplay, $(this).children().text());
});

$('#toggleDirections').on('click touchstart', function() {
    $('#mobileDirectionsView').toggleClass('hidden');
    return false;
});

// listen for a window resize and change which div the directions renderer points to accordingly
$(window).resize(function() {
    setDisplayPanel();
});