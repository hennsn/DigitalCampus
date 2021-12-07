
// GPS input to show where we are on the map
// source: https://www.w3schools.com/html/html5_geolocation.asp
function getGPSLocation(callback){
	if (navigator.geolocation) {
		// calls callback(GeolocationPosition {coords: GeolocationCoordinates {latitude: 1.23, longitude: 3.45}})
		navigator.geolocation.getCurrentPosition(callback)
	} else callback(null) // e.g. when the browser does not support it
}

// currently only used for debugging :)
// getGPSLocation(console.log)

export { getGPSLocation }
