var map;
var panel;
var LatLng = new google.maps.LatLng(48.811, 2.357);
var geocoder;
var initialize;
var calculate;
var marker;
var directionsDisplay;
var directionsService = new google.maps.DirectionsService();

function initialize()
{
var direction = new google.maps.DirectionsRenderer({
	map   : map, 
	panel : panel 
});
	directionsDisplay = new google.maps.DirectionsRenderer();

	geocoder = new google.maps.Geocoder();
	var mapOptions =
	{
		zoom: 8,
		center: new google.maps.LatLng(48.811, 2.357)
	}

	map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
	directionsDisplay.setMap(map);
	directionsDisplay.setPanel(document.getElementById('directions-panel'));

	var input = document.getElementById('pac-input');

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
	google.maps.event.addListener(autocomplete, 'place_changed', function() {
		infowindow.close();
		marker.setVisible(false);
		var place = autocomplete.getPlace();
		if (!place.geometry) {
			return;
		}

		if(place.geometry.viewport)
		{
			map.fitBounds(place.geometry.viewport);
		}else
		{
			map.setCenter(place.geometry.location);
			map.setZoom(15);
		}

		marker.setIcon(({
			url: place.icon,
			size: new google.maps.Size(71, 71),
			origin: new google.maps.Point(0, 0),
			anchor: new google.maps.Point(17, 34),
			scaledSize: new google.maps.Size(35, 35),
			
		}));
		google.maps.event.addListener(marker, 'click');
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

  // Sets a listener on a radio button to change the filter type on Places
  // Autocomplete.
  function setupClickListener(id, types) {
  	var radioButton = document.getElementById(id);
  	google.maps.event.addDomListener(radioButton, 'click', function() {
  		autocomplete.setTypes(types);
  	});
  }

  setupClickListener('changetype-all', []);
  setupClickListener('changetype-address', ['address']);
  setupClickListener('changetype-establishment', ['establishment']);
  setupClickListener('changetype-geocode', ['geocode']);
}


if(navigator.geolocation)
{
	var watchId = navigator.geolocation.watchPosition(successCallback, null, {enableHighAccuracy:true});
}
else
{
	alert("Votre navigateur n'est pas compatible avec la géolocalisation HTML 5");
}

function successCallback(position)
{
	map.panTo(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
	var marker = new google.maps.Marker({
		position: new google.maps.LatLng(position.coords.latitude, position.coords.longitude),
		map: map
	});
}

function FullScreen()
{
	document.getElementById('map-canvas').style.cssText='width:100%; height:100%;';
	google.maps.event.trigger(map,'resize');
}

function NormalScreen()
{
	document.getElementById('map-canvas').style.cssText='height:600px; width:800px;';
	google.maps.event.trigger(map,'resize');
}

function calculate() 
{
	origin = document.getElementById('origin').value;
	destination = document.getElementById('destination').value;
	var selectedMode = document.getElementById('mode').value;
	var waypts = [];
	var checkboxArray = document.getElementById('waypoints');
	for(var i = 0; i < checkboxArray.length; i++)
	{
		if(checkboxArray.options[i].selected == true)
		{
			waypts.push({
				location:checkboxArray[i].value,
				stopover:true });
		}
	}
	if(origin && destination)
	{
		var request = 
		{
			origin: origin,
			destination: destination,
			waypoints: waypts,
			optimizeWaypoints: true,
			travelMode: google.maps.TravelMode[selectedMode]
		};

		var directionsService = new google.maps.DirectionsService();
		directionsService.route(request, function(response, status)
		{
			if(status == google.maps.DirectionsStatus.OK)
			{
				directionsDisplay.setDirections(response);
			}
			/*var route = response.routes[0];
			var summaryPanel = document.getElementById('panel');
			summaryPanel.innerHTML = '';
			  // For each route, display summary information.
			for(var i = 0; i < route.legs.length; i++)
			{
			    var routeSegment = i + 1;
			    summaryPanel.innerHTML += '<b>Feuille de route: ' + routeSegment + '</b><br>';
			    summaryPanel.innerHTML += route.legs[i].origin_address + ' to ';
			    summaryPanel.innerHTML += route.legs[i].destination_address + '<br>';
			    summaryPanel.innerHTML += route.legs[i].distance.text + '<br><br>';
			}*/
		});
	}
}	
google.maps.event.addDomListener(window, 'load', initialize);