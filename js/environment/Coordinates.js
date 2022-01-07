
import { degToRad } from '../Maths.js'

const jenTower = [50.9288633, 11.5846216, 150]
const abbeanum = [50.9339311, 11.5807221, 182]

const center = abbeanum

const lat0 = center[0]
const lon0 = center[1]
const height0 = center[2]
const metersPerDegree = 40e6 / 360 // the world has a circumference of 40_000 km

const lonScale = Math.cos(lat0 * degToRad) // the longitude ring is scaled down by the latitude / distance from equator

const xScale = metersPerDegree * lonScale
const zScale = metersPerDegree

function latToZ(lat){
	// z is inversed to what we'd expect -> -
	return -(lat-lat0) * zScale
}

function zToLat(z){
	return -z/zScale + lat0
}

function lonToX(lon){
	return (lon-lon0) * xScale
}

function xToLon(x){
	return x/xScale + lon0
}

function heightToY(h){
	return h - height0
}

function yToHeight(y){
	return y + height0
}

function placeLatLonObject(object, name, lat, lon, height, rot){
	object.name = name
	object.position.set(lonToX(lon), heightToY(height||0), latToZ(lat))
	object.rotation.set(0, (rot||0) * degToRad, 0)
	window[name] = object
}

export { latToZ, zToLat, lonToX, xToLon, heightToY, yToHeight, placeLatLonObject }