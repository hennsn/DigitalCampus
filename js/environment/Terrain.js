
// die Kartendaten sind von https://www.geoportal-th.de/de-de/Downloadbereiche/Download-Offene-Geodaten-Th%C3%BCringen/Download-H%C3%B6hendaten

import * as THREE from 'https://cdn.skypack.dev/three@0.135.0'

import { mix, unmix, clamp } from '../Maths.js'
import { lonToX, latToZ, xToLon, zToLat, heightToY } from './Coordinates.js'
import { printError, updateDownloadProgress } from '../UserInterface.js'

// I (Antonio) had to guess the coordinates, so an offset is possible
// the Abbeanum is correct now, the Saale is no longer; maybe we can correct is using these two points;
// but: it isn't final anyways
var dx = -0.0005
var dy = +0.00023
var minLat = 50.9186171 + dy
var minLon = 11.5628571 + dx
var maxLat = 50.9463458 + dy
var maxLon = 11.6035806 + dx

var terrainWidth
var terrainHeight
var terrainData

// query a height at a certain integer coordinate
function getHTG(xi,yi){
	var index = (xi + yi * terrainWidth) * 4
	var r = terrainData[index]
	var g = terrainData[index+1]
	var h = (r * 256 + g) * 0.1
	return h
}

function getHeightOnTerrain(x,z){
	if(terrainData == null) return 0
	// convert world coordinates into grid coordinates, clamp them to the edges
	var x = clamp(unmix(minLon, maxLon, xToLon(x)), 0, 1) * (terrainWidth-1)
	var y = clamp(unmix(minLat, maxLat, zToLat(z)), 0, 1) * (terrainHeight-1)
	// linear interpolation for the height at that position:
	// int grid position, needs to be clamped again for that
	var xi = Math.min(x | 0, terrainWidth-2)
	var yi = Math.min(y | 0, terrainHeight-2)
	// remainder
	var xf = x - xi
	var yf = y - yi
	// actual linear interpolation
	var h = mix(mix(getHTG(xi,yi  ), getHTG(xi+1,yi  ), xf),
				mix(getHTG(xi,yi+1), getHTG(xi+1,yi+1), xf), yf)
	return heightToY(h)
}

function createTerrain(scene){
	var terrainImage = new Image()
	terrainImage.src = 'images/map/h750.png' // alternatives: h1500, h3000
	// terrainImage.onprogress could be added like this: https://stackoverflow.com/questions/14218607/javascript-loading-progress-of-an-image
	terrainImage.onload = () => {
		var img = terrainImage
		var width = terrainWidth = img.width
		var height = terrainHeight = img.height
		var canvas = document.createElement('canvas')
		canvas.width = img.width
		canvas.height = img.height
		canvas.getContext('2d').drawImage(img, 0, 0, width, height)
		var data = terrainData = canvas.getContext('2d').getImageData(0, 0, width, height).data
		var geometry = new THREE.BufferGeometry()
		var vertices = []
		var uvs = []
		for(var y=0,i=0;y<height;y++){
			for(var x=0;x<width;x++,i+=4){
				var r = data[i]
				var g = data[i+1]
				var h = (r * 256 + g) * 0.1
				var u = x/(width-1)
				var v = y/(height-1)
				var xi = mix(minLon, maxLon, u)
				var yi = mix(minLat, maxLat, v)
				vertices.push(lonToX(xi), heightToY(h), latToZ(yi))
				// uvs.push(u * 0.99 + 0.02, v * 0.99 - 0.003)
				uvs.push(u, v)
			}
		}
		var indices = []
		for(var y=1;y<height;y++){
			var i = (y-1)*width;
			for(var x=1;x<width;x++,i++){
				indices.push(i, i+1, i+width+1)
				indices.push(i, i+1+width, i+width)
			}
		}
		geometry.setIndex(indices)
		geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
		geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
		geometry.computeVertexNormals() // could be computed from the texture data
		const texture = textureLoader.load('map/c900.jpg') // if we want texture loading updated, we could use https://github.com/mrdoob/three.js/issues/10439
		// 3.js does not support it out-of-the-box
		const mesh = window.terrainMesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({ map: texture }))
		mesh.name = 'Terrain'
		scene.add(mesh)
	}
}

export { createTerrain, getHeightOnTerrain }

