
import * as THREE from 'https://cdn.skypack.dev/three@0.135.0'
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.135.0/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'https://cdn.skypack.dev/three@0.135.0/examples/jsm/loaders/DRACOLoader.js'
import { FBXLoader } from 'https://cdn.skypack.dev/three@0.135.0/examples/jsm/loaders/FBXLoader.js'


import { OutlinePass } from 'https://cdn.skypack.dev/three@0.135.0/examples/jsm/postprocessing/OutlinePass.js'
import { EffectComposer } from 'https://cdn.skypack.dev/three@0.135.0/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'https://cdn.skypack.dev/three@0.135.0/examples/jsm/postprocessing/RenderPass.js'
import { SAOPass } from 'https://cdn.skypack.dev/three@0.135.0/examples/jsm/postprocessing/SAOPass.js'

import { HDRCubeTextureLoader } from 'https://cdn.skypack.dev/three@0.135.0/examples/jsm/loaders/HDRCubeTextureLoader.js';
import { RGBELoader } from "https://cdn.skypack.dev/three@0.135.0/examples/jsm/loaders/RGBELoader.js";
import Stats from 'https://cdn.skypack.dev/three@0.135.0/examples/jsm/libs/stats.module'


import { clamp }  from './Maths.js'
import { createSky }  from './environment/Sky.js'
import { createLighting, createInsideLighting } from './environment/Lighting.js'
import { fillScene } from './environment/Scene.js'
import { createTerrain } from './environment/Terrain.js'
import { handleUserInterface } from './UserInterface.js'
import { createInteractions, handleInteractions } from './interactions/Interactions.js'
import {startStory} from './interactions/Story.js'
import { updateMultiplayer } from './environment/Multiplayer.js'


//const scene = outsideScene
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

const fbxLoader = window.fbxLoader = new FBXLoader()


///////////
// scene //
///////////

var outsideScene = window.outsideScene = new THREE.Scene()
outsideScene.name = 'outside'





// ----------------------------- OUTLINE PASS AND RENDERPASS FOR EFFECTIVE OUTLINE -------------------------------
// NOT WORKING YET, SO NOT NEEDED, but when deleting please mind, that the outlinepass is given to the handle interactions funcion
var composer = window.composer = new EffectComposer(renderer)
const renderPass = new RenderPass(outsideScene, camera)
composer.addPass(renderPass)
var outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), outsideScene, camera);
composer.addPass(outlinePass)
var saoPass = window.saoPass = new SAOPass(outsideScene, camera, false, true)
composer.addPass(saoPass) // screen space ambient occlusion



createSky(outsideScene)
createLighting(outsideScene)
createTerrain(outsideScene)
fillScene(outsideScene)




var flurScene = window.flurScene = new THREE.Scene()
flurScene.name = 'flur'
createInsideLighting(flurScene)
// todo define lighting
// todo add objects

var hs1Scene = window.hs1Scene = new THREE.Scene()
hs1Scene.name = 'hs1'
createInsideLighting(hs1Scene)
// todo define lighting
// todo add objects

// start location
window.scene = outsideScene


///////////////
// raycaster //
//////////////
const raycaster = window.raycaster = new THREE.Raycaster()
raycaster.far = 8
const mousecaster = new THREE.Raycaster() //new raycaster for mouse
mousecaster.far = 3

////mouse/////
const mouse = new THREE.Vector2();

// adjust the aspect ratio as needed:
window.addEventListener('resize', (event) => {
	camera.aspect = window.innerWidth / window.innerHeight
	camera.updateProjectionMatrix()
	renderer.setSize(window.innerWidth, window.innerHeight)
	composer.setSize(window.innerWidth, window.innerHeight)
})

// define interactions
createInteractions(scene, camera, renderer, mouse)

// todo webxr button & support

// todo top-down map?

const stats = Stats()
document.body.appendChild(stats.dom)

var lastTime = new Date().getTime()
let i = 1;

function mainLoop(){

	const scene = window.scene

	const time = new Date().getTime()
	const deltaTime = clamp((time-lastTime)/1e3, 1e-3, 1.0)
	lastTime = time

	startStory(scene)
	// animation / physics stuff goes here
	handleInteractions(scene, camera, raycaster, mousecaster, mouse, time, deltaTime, outlinePass)
	handleUserInterface(deltaTime)
	updateMultiplayer(scene, time, deltaTime, camera)
	stats.update()
	
	// todo we should be able to register event listeners for mainLoop, and do our stuff inside of them
	if(window.envMap){
		// normally the environment map is fixed in place automatically, but I didn't find the correct map yet (1 texture for all sides combined)
		window.envMap.position.set(camera.position.x, camera.position.y, camera.position.z)
	}
	
	if(window.mixers){
		mixers.forEach(mixer => mixer.update(deltaTime))
	}
	
	renderer.render(scene, camera)
}

renderer.setAnimationLoop(mainLoop) // requestAnimationFrame funktioniert nicht für WebXR, aber die hier funktioniert für mit und ohne :)

//export {scene}