var lat;
var lon;
var map;
var circle;
var del;
var circle_center;
var infowindowsearch;
var markers = [];

var cOptions = {
    fillColor: '#8DDBFD',
    fillOpacity: 0.4,
    strokeWeight: 1,
    clickable: true,
    editable: false,
    zIndex: 1,
    draggable: true,
    radius: 1000
};

var mOptions = {
    crossOnDrag: false,
    icon: './img/x.png',
    animation: null,
    clickable: true,
    draggable: true,
    title: "Eliminar radio",
    visible: true,
    zIndex: 2
};

function deleteMarkers(){
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers = [];
}

function resetCenter(position){
    lat = position.coords.latitude;
    lon = position.coords.longitude;  
    var latlon = new google.maps.LatLng(lat, lon);
    map.setCenter(latlon);
    getCityCenter()
}

function callback(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
            createMarker(results[i]);
        }
    }
}

function createMarker(place) {
    var placeLoc = place.geometry.location;
    var marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location
    });
    markers.push(marker);

    google.maps.event.addListener(marker, 'click', function() {
      infowindowsearch.setContent(place.name);
      infowindowsearch.open(map, this);
    });
}

function getCityCenter(){//aqui creo que va a terminar regresando algo, coordenadas de ciudad actual
    var geocoder = new google.maps.Geocoder();
    var latlon = new google.maps.LatLng(lat, lon);
    geocoder.geocode({'latLng': latlon}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        console.log(results);
        if (results[1]) {
         //formatted address
         alert(results[0].formatted_address)
        //find country name
             for (var i=0; i<results[0].address_components.length; i++) {
            for (var b=0;b<results[0].address_components[i].types.length;b++) {

            //there are different types that might hold a city admin_area_lvl_1 usually does in come cases looking for sublocality type will be more appropriate
                if (results[0].address_components[i].types[b] == "administrative_area_level_1") {
                    //this is the object you are looking for
                    city= results[0].address_components[i];
                    break;
                }
            }
        }
        //city data
        alert(city.short_name + " " + city.long_name)


        } else {
          alert("No se encontraron resultados.");
        }
      } else {
        alert("El geolocalizador ha fallado: " + status);//aqui que pedo
      }
    });
}

function initMap() {
    
    lat = 19.4284700;
    lon = -99.1276600;
    var city;
    
    getCityCenter(); 
    
    map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: this.lat, lng: lon},
      zoom: 8
    });
    
    var input = /** @type {!HTMLInputElement} */(document.getElementById('pac-input'));

    var types = document.getElementById('type-selector');
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(types);

    var autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo('bounds', map);

    var infowindow = new google.maps.InfoWindow();
    var marker = new google.maps.Marker({
      map: map,
      anchorPoint: new google.maps.Point(0, -29)
    });

    autocomplete.addListener('place_changed', function() {
        infowindow.close();
        marker.setVisible(false);
        var place = autocomplete.getPlace();
        if (!place.geometry) {
            if(document.getElementById('changetype-radio').checked){
                
                if(circle == null || circle.getMap() == null){
                    alert("No se ha definido radio.");
                    return;
                }
                
                var input_text = document.getElementById('pac-input').value;
                if(input_text == ""){
                    alert("No se ha introducido un texto.");
                    return;
                }
                
                if(markers.length>0)
                    deleteMarkers()
                
                infowindowsearch = new google.maps.InfoWindow();
                var service = new google.maps.places.PlacesService(map);                
                service.nearbySearch({
                  location: circle.getCenter(),
                  radius: circle.getRadius(),
                  keyword: input_text
                }, callback);
                
                return;
            }
            else{
                // User entered the name of a Place that was not suggested and
                // pressed the Enter key, or the Place Details request failed.
                window.alert("No se encontró el lugar: '" + place.name + "'");
                return;    
            }
        }

      // If the place has a geometry, then present it on a map.
      if (place.geometry.viewport) {
        map.fitBounds(place.geometry.viewport);
      } else {
        map.setCenter(place.geometry.location);
        map.setZoom(17);  // Why 17? Because it looks good.
      }
      marker.setIcon(/** @type {google.maps.Icon} */({
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(35, 35)
      }));
      marker.setPosition(place.geometry.location);
      marker.setVisible(true);

      var address = '';
      if (place.address_components) {
        address = [
          (place.address_components[0] && place.address_components[0].short_name || ''),
          (place.address_components[1] && place.address_components[1].short_name || ''),
          (place.address_components[2] && place.address_components[2].short_name || '')
        ].join(' ');
      }

      infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
      infowindow.open(map, marker);
    });
    
    var drawingManager = new google.maps.drawing.DrawingManager({
      drawingMode: null,
      drawingControl: false,
      drawingControlOptions: {
        position: google.maps.ControlPosition.BOTTOM_CENTER,
        drawingModes: ['circle']
      },
      circleOptions: cOptions
    });
    
    map.addListener('click', function(e) {
        if(circle == null){
            circle = new google.maps.Circle(cOptions);
            del = new google.maps.Marker(mOptions);
        }    
        circle_center = e.latLng;
        circle.setCenter(circle_center);
        circle.setMap(map);
        del.setPosition(circle_center);
        del.setMap(map);
        circle.addListener('drag', function(b){
            circle_center = b.latLng;
            del.setPosition(circle_center);
        });
        del.addListener('drag', function(c){
            circle_center = c.latLng;
            circle.setCenter(circle_center);
        });
        del.addListener('click', function(a){
            deleteMarkers();
            circle.setRadius(0);
            google.maps.event.clearListeners(circle, 'drag');
            google.maps.event.clearListeners(del, 'click');
            google.maps.event.clearListeners(del, 'drag');
            
            circle.setMap(null);
            this.setMap(null);
            
            circle = null;
        });
    });
    
    // Sets a listener on a radio button to change the filter type on Places
    // Autocomplete.
    function setupClickListener(id, types) {
      var radioButton = document.getElementById(id);
      radioButton.addEventListener('click', function() {
        autocomplete.setTypes(types);
      });
    }

    setupClickListener('changetype-all', []);
    setupClickListener('changetype-address', ['address']);
    setupClickListener('changetype-establishment', ['establishment']);
    setupClickListener('changetype-geocode', ['geocode']);
    drawingManager.setMap(map);
}

function startMap(){
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(resetCenter);
    } else {
        alert("No se pudo cargar la ubicación actual.")
        return;
    }
}