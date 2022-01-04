
import * as THREE from 'https://cdn.skypack.dev/three@0.135.0'
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.135.0/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'https://cdn.skypack.dev/three@0.135.0/examples/jsm/loaders/DRACOLoader.js'
import { HDRCubeTextureLoader } from 'https://cdn.skypack.dev/three@0.135.0/examples/jsm/loaders/HDRCubeTextureLoader.js';
import { RGBELoader } from "https://cdn.skypack.dev/three@0.135.0/examples/jsm/loaders/RGBELoader.js";
import Stats from 'https://cdn.skypack.dev/three@0.135.0/examples/jsm/libs/stats.module'

import { clamp }  from './Maths.js'
import { createSky }  from './environment/Sky.js'
import { createLighting } from './environment/Lighting.js'
import { fillScene } from './environment/Scene.js'
import { createTerrain } from './environment/Terrain.js'
import { handleUserInterface } from './UserInterface.js'
import { createInteractions, handleInteractions } from './interactions/Interactions.js'


////////////
// camera //
////////////

const near = 0.1  // near clipping plane: closer pixels are invisible
const far  = 1e5 // far clipping plane: farther pixels/objects are invisible
const fov  = 75   // fov in degrees, on the y axis
const camera = window.camera = new THREE.PerspectiveCamera(fov, window.innerWidth/window.innerHeight, near, far)
//////////////
// renderer //
//////////////

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

/////////////
// loaders //
/////////////

const textureLoader = window.textureLoader = new THREE.TextureLoader().setPath('./images/') // png, jpg, bmp, ...
const hdrLoader = window.hdrLoader = new RGBELoader().setPath('./images/environment/') // hdr, e.g. for environment maps

// Configure and create Draco decoder.
const dracoLoader = window.dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('js/libs/draco/')
// who can get this working over the CDN? current error message: "Uncaught SyntaxError: Unexpected token 'export'"
// dracoLoader.setDecoderPath('https://cdn.skypack.dev/three@0.135.0/examples/js/libs/draco/')
dracoLoader.setDecoderConfig({ type: 'js' })
const glTFLoader = window.glTFLoader = new GLTFLoader()
glTFLoader.setDRACOLoader(dracoLoader)

///////////
// scene //
///////////

const scene = window.scene = new THREE.Scene()
createSky(scene)
createLighting(scene)
createTerrain(scene)
fillScene(scene)

///////////
// raycaster //
///////////
const raycaster = new THREE.Raycaster()
raycaster.far = 8

// adjust the aspect ratio as needed:
window.addEventListener('resize', (event) => {
	camera.aspect = window.innerWidth / window.innerHeight
	camera.updateProjectionMatrix()
	renderer.setSize(window.innerWidth, window.innerHeight)
})

// define interactions
createInteractions(scene, camera, renderer)

// todo webxr button & support

// todo top-down map?

const stats = Stats()
document.body.appendChild(stats.dom)

var lastTime = new Date().getTime()

function mainLoop(){
	
	const time = new Date().getTime()
	const deltaTime = clamp((time-lastTime)/1e3, 1e-3, 1.0)
	lastTime = time

	// animation / physics stuff goes here
	handleInteractions(scene, camera, raycaster, deltaTime)
	handleUserInterface(deltaTime)
	stats.update()
	
	// todo we should be able to register event listeners for mainLoop, and do our stuff inside of them
	if(window.envMap){
		window.envMap.position.set(camera.position.x,camera.position.y,camera.position.z) // normally the environment map is fixed in place automatically, but I didn't find the correct map yet (1 texture for all sides combined)
	}
	
	renderer.render(scene, camera)
	
}

renderer.setAnimationLoop(mainLoop) // requestAnimationFrame funktioniert nicht für WebXR, aber die hier funktioniert für mit und ohne :)
