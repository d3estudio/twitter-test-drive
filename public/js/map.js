var geocoder;
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(successFunction, errorFunction);
}

function successFunction(position) {
    var lat = position.coords.latitude;
    var lng = position.coords.longitude;
    codeLatLng(lat, lng)
}

function errorFunction() {
    alert("Geocoder failed");
}

function initialize() {
    geocoder = new google.maps.Geocoder();
}

function codeLatLng(lat, lng) {
    var latlng = new google.maps.LatLng(lat, lng);
    geocoder.geocode({
        'latLng': latlng
    }, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            if (results[1]) {
                for (var i = 0; i < results[0].address_components.length; i++) {
                    for (var b = 0; b < results[0].address_components[i].types.length; b++) {
                        if (results[0].address_components[i].types[b] == "administrative_area_level_1") {
                            city = results[0].address_components[i];
                        }
                    }
                    for (var b = 0; b < results[0].address_components[i].types.length; b++) {
                        if (results[0].address_components[i].types[b] == "country") {
                            country = results[0].address_components[i];
                        }
                    }
                }
                $('.location').val(city.long_name + ', ' + country.long_name);
            }
        }
    });
}
initialize();
