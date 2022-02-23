
import { degToRad } from '../Maths.js'
import * as THREE from 'https://cdn.skypack.dev/three@0.135.0'

const jenTower      = [50.9288633, 11.5846216, 150]
const abbeanum      = [50.9339311, 11.5807221, 182]
const abbeanumFront = [50.9341265, 11.5808257, 182.95]

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

function latLonToXYZ(lat,lon,h){
	// lat, lon, height -> x, y (up), z
	const x = lonToX(lon)
	const z = latToZ(lat)
	const y = heightToY(h)
	return new THREE.Vector3(x,y,z)
}

function xyzToLatLon(x,y,z){
	// x, y (up), z -> lat, lon, height
	const lat = zToLat(z)
	const lon = xToLon(x)
	const h = yToHeight(y)
	return new THREE.Vector3(lat,lon,h)
}

function placeLatLonObject(object, name, lat, lon, height, rot){
	object.name = name
	object.position.set(lonToX(lon), heightToY(height||0), latToZ(lat))
	object.rotation.set(0, (rot||0) * degToRad, 0)
	window[name] = object
}

export { latToZ, zToLat, lonToX, xToLon, heightToY, yToHeight, placeLatLonObject, xyzToLatLon, latLonToXYZ }