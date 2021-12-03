
import * as THREE from 'https://cdn.skypack.dev/three@0.134.0'
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.134.0/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.134.0/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'https://cdn.skypack.dev/three@0.134.0/examples/jsm/loaders/DRACOLoader.js'
import { HDRCubeTextureLoader } from 'https://cdn.skypack.dev/three@0.134.0/examples/jsm/loaders/HDRCubeTextureLoader.js';
import { RGBELoader } from "https://cdn.skypack.dev/three@0.134.0/examples/jsm/loaders/RGBELoader.js";
import Stats from 'https://cdn.skypack.dev/three@0.134.0/examples/jsm/libs/stats.module'

import { VRButton } from 'https://cdn.skypack.dev/three@0.134.0/examples/jsm/webxr/VRButton.js'

// what exactly does that do? / how does it work?
// eher etwas für die #InteractionsGruppe
// import { XRControllerModelFactory } from 'https://cdn.skypack.dev/three@0.134.0/examples/jsm/webxr/XRControllerModelFactory.js'



// conventions (may be altered, if sb hates them 😂):
// x = left/right
// y = up/down (may change, because z is up in Blender)
// z = forward/backward

// tabs instead of spaces for identation, so every user can set the identation width themselves
// single and multi line comments are fine
// no semicolons, because they are not really required in JavaScript 😄. Except somebody really loves them

// named functions probably should have the "function" keyword, while annonymous functions should be lambda expressions

const near = 0.1  // near clipping plane: closer pixels are invisible
const far  = 1e5 // far clipping plane: farther pixels/objects are invisible
const fov  = 75   // fov in degrees, on the y axis

// the keyboard
const keyboard = {}
function printError(err){
	console.log(err)
}

// the user
const user = { height: 1.8, speed: 0.2, turnSpeed: 0.03 }




// camera
const camera = new THREE.PerspectiveCamera(fov, window.innerWidth/window.innerHeight, near, far)
camera.position.set(0, user.height, 15)

// renderer
const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.xr.enabled = true
document.body.appendChild(renderer.domElement)
document.body.appendChild(VRButton.createButton(renderer))

////////////////////////////
// scene + sample objects //
////////////////////////////

const scene = window.scene = new THREE.Scene()
// Configure and create Draco decoder.
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('js/libs/draco/')
// who can get this working over the CDN? current error message: "Uncaught SyntaxError: Unexpected token 'export'"
// dracoLoader.setDecoderPath('https://cdn.skypack.dev/three@0.134.0/examples/js/libs/draco/')
dracoLoader.setDecoderConfig({ type: 'js' })
const glTFLoader = new GLTFLoader()
glTFLoader.setDRACOLoader(dracoLoader)

const textureLoader = new THREE.TextureLoader() // png, jpg, bmp, ...
const hdrLoader = new RGBELoader()
	.setPath('./images/environment/')
	
hdrLoader.setDataType(THREE.HalfFloatType) // alternatives: UnsignedByteType/FloatType/HalfFloatType
hdrLoader.load(['kloofendal_38d_partly_cloudy_2k.hdr'], (tex, texData) => {
	tex.magFilter = THREE.LinearFilter
	tex.needsUpdate = true
	const scale = far * 0.707 // slightly less than 1/sqrt(2)
	const cube = new THREE.BoxGeometry(scale, scale, scale)
	const material = new THREE.ShaderMaterial({
		uniforms: { tex: { value: tex }, exposure: { value: 5 } }, side: THREE.DoubleSide,
		vertexShader: 'varying vec3 v_pos; void main(){ v_pos = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1); }',
		fragmentShader: 'varying vec3 v_pos; uniform float exposure; uniform sampler2D tex; void main(){ vec3 n = normalize(v_pos); vec3 c = texture(tex, vec2(atan(n.x, n.z)*'+(0.5/Math.PI)+'+.5, n.y*.5+.5)).rgb * exposure; gl_FragColor = vec4(c/(1.0+c), 1); }' // x/(1+x) is equal to Reinhard tonemapping (as long as we don't render in HDR)
	})
	const mesh = window.envMap = new THREE.Mesh(cube, material)
	mesh.name = 'EnvironmentMap'
	scene.add(mesh)
})

// intershop tower is the center of our world
var lat0 = 50.9288633
var lon0 = 11.5846216
var height0 = 182
// abbeanum is the center
lat0 = 50.9339311, lon0 = 11.5807221
var metersPerDegree = 40e6 / 360
var degreesToRad = Math.PI / 180
var lonScale = Math.cos(lat0 * degreesToRad)

function latToLocal(lat){
	// z is inversed to what we'd expect -> -
	return -(lat-lat0) * metersPerDegree
}

function lonToLocal(lon){
	return (lon-lon0) * metersPerDegree * lonScale
}

function heightToLocal(h){
	return h - height0
}

function mix(a,b,f){
	return (1-f)*a+f*b
}

function setPosition(group, lat, lon, height, rot){
	group.position.set(lonToLocal(lon), heightToLocal(height||0), latToLocal(lat))
	group.rotation.set(0, (rot||0)*degreesToRad, 0)
}

const terrainImage = new Image()
terrainImage.src = 'images/map/h750.png'
terrainImage.onload = () => {
	// I (Antonio) had to guess the coordinates, so an offset is possible
	// the Abbeanum is correct now, the Saale is no longer; maybe we can correct is using these two points;
	// but: it isn't final anyways
	var dx = -0.0005
	var dy = +0.00023
	var minLat = 50.9186171 + dy
	var minLon = 11.5628571 + dx
	var maxLat = 50.9463458 + dy
	var maxLon = 11.6035806 + dx
	var img = terrainImage
	var width = img.width
	var height = img.height
	var canvas = document.createElement('canvas')
	canvas.width = img.width
	canvas.height = img.height
	canvas.getContext('2d').drawImage(img, 0, 0, width, height)
	var data = canvas.getContext('2d').getImageData(0, 0, width, height).data
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
			vertices.push(lonToLocal(xi), heightToLocal(h), latToLocal(yi))
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
	const texture = textureLoader.load('images/map/c900.jpg') // color: 0x808877, 
	const mesh = window.terrainMesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ map: texture }))
	mesh.name = 'Terrain'
	scene.add(mesh)
}

window.camera = camera
window.scene = scene

// temporary sky color as long as we don't have a HDR for that
scene.background = new THREE.Color(0x768ca1)

// sun light from above
// can support shadows, but we need a ground to project them onto, and we need to configure them (best depending on the hardware capabilities)
const sun = window.sun = new THREE.DirectionalLight({ color: { r: 0.8, g: 0.8, b: 0.8 }});
sun.position.set(0.8,0.7,1) // the sun has its default target at 0,0,0
scene.add(sun)
scene.add(sun.target) // needs to be added, if we want to change the suns target


// ambient light from below
const ambient = new THREE.HemisphereLight(0x222222, 0x222222);
scene.add(ambient)

glTFLoader.load('models/samples/Abbeanum (teils texturiert).glb',
	(gltf) => {
		const model = window.abbeanum = gltf.scene
		model.name = 'Abbeanum'
		setPosition(model, 50.9339769, 11.5804391, 182, +15)
		var scale = 2.8 // a guess
		model.scale.set(scale, scale, scale)
		scene.add(model)
	}, undefined, printError
)


////////////////////////////////
// listeners for interactions //
////////////////////////////////

// Antonio wants to use them ^^
if(localStorage.orbitControls){
	const controls = new OrbitControls(camera, renderer.domElement)
	controls.target.set(0, 1, 0) // orbit center
	controls.update()// compute transform for 1st frame
}

// adjust the aspect ratio as needed:
window.addEventListener("resize", (event) => {
	camera.aspect = window.innerWidth / window.innerHeight
	camera.updateProjectionMatrix()
	renderer.setSize(window.innerWidth, window.innerHeight)
})

// Keyboard listeners
window.addEventListener('keydown', keyDown)
window.addEventListener('keyup', keyUp)


function keyDown(event){
	keyboard[event.keyCode] = true 
}

function keyUp(event){
	keyboard[event.keyCode] = false
}

// todo webxr button & support

// todo top-down map?

// GPS input to show where we are on the map
// source: https://www.w3schools.com/html/html5_geolocation.asp
function getGPSLocation(callback){
	if (navigator.geolocation) {
		// calls callback(GeolocationPosition {coords: GeolocationCoordinates {latitude: 1.23, longitude: 3.45}})
		navigator.geolocation.getCurrentPosition(callback)
	} else callback(null) // e.g. when the browser does not support it
}

// currently only used for debugging :)
getGPSLocation(console.log)

// for debugging: fps/frame-time/memory usage
// browsers are typically locked at the screen refresh rate, so 60 fps (in my case) is perfect

// helper functions for the animation loop
function handleKeyboardState(){
	/**
	 * Helper function for updating the camera controls in the animation loop.
	*/
	if(keyboard[37]){ // left arrow pressed
		camera.rotation.y += user.turnSpeed
	}
	if(keyboard[39]){ // right arrow pressed
		camera.rotation.y -= user.turnSpeed
	}
	if(keyboard[38] || keyboard[87]){ // up arrow or w pressed
		camera.position.x += -Math.sin(camera.rotation.y) * user.speed
		camera.position.z += -Math.cos(camera.rotation.y) * user.speed
	}
	if(keyboard[40] || keyboard[83]){ // down arrow  or s pressed
		camera.position.x -= -Math.sin(camera.rotation.y) * user.speed
		camera.position.z -= -Math.cos(camera.rotation.y) * user.speed
	}

	if(keyboard[65]){
		camera.position.x -= Math.sin(camera.rotation.y + Math.PI / 2) * user.speed
		camera.position.z -= Math.cos(camera.rotation.y + Math.PI / 2) * user.speed
	}

	if(keyboard[68]){
		camera.position.x += Math.sin(camera.rotation.y + Math.PI / 2) * user.speed
		camera.position.z += Math.cos(camera.rotation.y + Math.PI / 2) * user.speed
	}


}

const stats = Stats()
document.body.appendChild(stats.dom)

function mainLoop(){
	
	// animation / physics stuff goes here
	handleKeyboardState()
	stats.update()
	if(window.envMap){
		window.envMap.position.set(camera.position.x,camera.position.y,camera.position.z) // normally the environment map is fixed in place automatically, but I didn't find the correct map yet (1 texture for all sides combined)
	}
	renderer.render(scene, camera)
}
renderer.setAnimationLoop(mainLoop) // requestAnimationFrame funktioniert nicht für WebXR, aber die hier funktioniert für mit und ohne :)
