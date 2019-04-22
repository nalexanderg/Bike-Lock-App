// This example adds a search box to a map, using the Google Place Autocomplete
// feature. People can enter geographical searches. The search box will return a
// pick list containing a mix of places and predicted search terms.

// This example requires the Places library. Include the libraries=places
// parameter when you first load the API. For example:

const stylesArray = [
    {
        featureType: 'all',
        stylers: [
            {visibility: 'off'}
        ]
    },
    {
        featureType: 'road',
        stylers: [
            {visibility: 'on'}
        ]
    },
    {
        featureType: 'landscape',
        stylers: [
            {visibility: 'on'}
        ]
    },
    {
        featureType: 'water',
        stylers: [
            {visibility: 'on'}
        ]
    },
    {
        featureType: 'poi.park',
        stylers: [
            {visibility: 'on'}
        ]
    }
];

var rackLocation = [
    ['Tremont Athletic East', 41.508821, -81.602177, 'A'],
    ['Washkewicz School of Engineering', 41.503503, -81.673287, 'B'],
    ['Climb Cleveland', 41.482013, -81.687308, 'C'],
    ['Sherwin Williams HQ', 41.496804, -81.692058, 'D']
];

function initAutocomplete() {
    //Needs to be inside this function
    const markerSize = new google.maps.Size(50, 50);
    const markerURL = 'src/Images/number_';
    var icons = {
        user: {
            url: 'src/Images/cycling.png',
            scaledSize: markerSize
        },
        numbers: {
            url: markerURL,
            scaledSize: markerSize
        },
        search: {
            url: 'src/Images/pin.png',
            scaledSize: markerSize
        }
    };

    const defaultPos = { lat: 41.499321, lng: -81.694359 };

    const map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        mapTypeId: 'roadmap',
        disableDefaultUI: 'true'
    });

    const currentLocation = new google.maps.Marker({
        map: map,
        icon: icons.user,
        title: 'Your location'
    });

    let prevMarker = currentLocation;

    const bikeLayer = new google.maps.BicyclingLayer();
    bikeLayer.setMap(map);
    map.setOptions({styles: stylesArray});

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            let userPos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            currentLocation.setPosition(userPos);
            map.setCenter(userPos);
        }, () => {
            //If location services denied
            currentLocation.setPosition(defaultPos);
            map.setCenter(defaultPos);
        });
    }
    else {
        // Browser doesn't support Geolocation
        currentLocation.setPosition(defaultPos);
        map.setCenter(defaultPos);
    }

    //Puts user marker on map
    currentLocation.addListener('click', () => {
        banner([currentLocation.title, null]);
        toggleBounce(prevMarker, currentLocation);
        prevMarker = currentLocation;
        const userBounds = new google.maps.LatLngBounds();
        userBounds.extend(currentLocation.position);
        map.fitBounds(userBounds);
        map.setZoom(16);
    });

    rackLocation.forEach(rack => {
        icons.numbers.url += availableLocks[rack[3]][0] + '.png';
        let marker = new google.maps.Marker({
            position: {lat: rack[1], lng: rack[2]},
            map: map,
            icon: icons.numbers,
            title: rack[0]
        });

        //Passes the specific rack to display necessary data, location, num locks
        marker.addListener('click', () => {
            banner(rack);
            toggleBounce(prevMarker, marker);
            prevMarker = marker;
            const lockBounds = new google.maps.LatLngBounds();
            lockBounds.extend(marker.position);
            map.fitBounds(lockBounds);
            map.setZoom(16);
        });
        icons.numbers.url = markerURL;
    });

    // Create the search box and link it to the UI element.
    let input = document.getElementsByClassName('pac-input')[0];
    let searchBox = new google.maps.places.SearchBox(input);
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(input);
    let prevSearch;

    // Bias the SearchBox results towards current map's viewport.
    map.addListener('bounds_changed', function() {
        searchBox.setBounds(map.getBounds());
    });

    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.

    searchBox.addListener('places_changed', function() {

        var places = searchBox.getPlaces();

        places.forEach(function(place) {
            // Create a marker for each place.
            let markers = new google.maps.Marker({
                map: map,
                icon: icons.search,
                title: place.name,
                position: place.geometry.location
            });

            prevSearch ? prevSearch.setMap(null) : null;
            prevSearch = markers;

            const searchBounds = new google.maps.LatLngBounds();
            searchBounds.extend(markers.position);
            map.fitBounds(searchBounds);
            map.setZoom(16);
        });
    });
}