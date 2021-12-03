
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
const far  = 2000 // far clipping plane: farther pixels/objects are invisible
const fov  = 75   // fov in degrees, on the y axis

function printError(err){
	console.log(err)
}

// camera
const camera = new THREE.PerspectiveCamera(fov, window.innerWidth/window.innerHeight, near, far)
camera.position.y = 1
camera.position.z = 5

// renderer
const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.xr.enabled = true
document.body.appendChild(renderer.domElement)
document.body.appendChild(VRButton.createButton(renderer))

////////////////////////////
// scene + sample objects //
////////////////////////////

const scene = new THREE.Scene()
// Configure and create Draco decoder.
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('js/libs/draco/')
// who can get this working over the CDN? current error message: "Uncaught SyntaxError: Unexpected token 'export'"
// dracoLoader.setDecoderPath('https://cdn.skypack.dev/three@0.134.0/examples/js/libs/draco/')
dracoLoader.setDecoderConfig({ type: 'js' })
const glTFLoader = new GLTFLoader()
glTFLoader.setDRACOLoader(dracoLoader)

const hdrLoader = new RGBELoader()
	.setPath('./images/environment/')
	
const whiteMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

const scale = far * 0.707 // slightly less than 1/sqrt(2)
const envCube = new THREE.BoxGeometry(scale, scale, scale)
const envMap = new THREE.Mesh(envCube, whiteMaterial)


hdrLoader.setDataType(THREE.HalfFloatType) // alt: UnsignedByteType/FloatType/HalfFloatType
hdrLoader.load(['kloofendal_38d_partly_cloudy_2k.hdr'], (tex, texData) => {
	const envMat = new THREE.ShaderMaterial({
		uniforms: { tex: { value: tex }, exposure: { value: 5 } }, side: THREE.DoubleSide,
		vertexShader: 'varying vec3 v_pos; void main(){ v_pos = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1); }',
		fragmentShader: 'varying vec3 v_pos; uniform float exposure; uniform sampler2D tex; void main(){ vec3 n = normalize(v_pos); vec3 c = texture(tex, vec2(atan(n.x, n.z)*'+(0.5/Math.PI)+'+.5, n.y*.5+.5)).rgb * exposure; gl_FragColor = vec4(c/(1.0+c), 1); }' // x/(1+x) is equal to Reinhard tonemapping (as long as we don't render in HDR)
	})
	tex.magFilter = THREE.LinearFilter
	tex.needsUpdate = true
	envMap.material = envMat
	scene.add(envMap)
})

window.camera = camera
window.scene = scene

// temporary sky color as long as we don't have a HDR for that
scene.background = new THREE.Color(0x768ca1)

const geometry = new THREE.BoxGeometry()
const material = new THREE.MeshBasicMaterial({ color: 0x77ff33 })
const cube = new THREE.Mesh(geometry, material)
scene.add(cube)

// sun light from above
// can support shadows, but we need a ground to project them onto, and we need to configure them (best depending on the hardware capabilities)
const sun = new THREE.DirectionalLight(0xffffff);
sun.rotation.x = -30*3.14/180
scene.add(sun)

// ambient light from below
const ambient = new THREE.HemisphereLight(0xffffff, 0x444444);
scene.add(ambient)

// works, but somehow the materials are lost :/
glTFLoader.load('models/samples/draco-monkey.glb',
	(gltf) => {
		const model = gltf.scene
		model.position.y = 1.5
		scene.add(model)
	}, undefined, printError
)

glTFLoader.load('models/samples/dice-compressed.glb',
	(gltf) => {
		const model = gltf.scene
		model.position.set(2,0,0)
		model.scale.set(.5,.5,.5)
		scene.add(model)
	}, undefined, printError
)

////////////////////////////////
// listeners for interactions //
////////////////////////////////

const controls = new OrbitControls(camera, renderer.domElement)
controls.target.set(0, 1, 0) // orbit center
controls.update()// compute transform for 1st frame

// adjust the aspect ratio as needed:
window.addEventListener("resize", (event) => {
	camera.aspect = window.innerWidth / window.innerHeight
	camera.updateProjectionMatrix()
	renderer.setSize(window.innerWidth, window.innerHeight)
})

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
const stats = Stats()
document.body.appendChild(stats.dom)

function mainLoop(){
	
	// animation / physics stuff goes here
	
	stats.update()
	envMap.position.set(camera.position.x,camera.position.y,camera.position.z) // normally the environment map is fixed in place automatically, but I didn't find the correct map yet (1 texture for all sides combined)
	renderer.render(scene, camera)
}
renderer.setAnimationLoop(mainLoop) // requestAnimationFrame funktioniert nicht für WebXR, aber die hier funktioniert für mit und ohne :)
