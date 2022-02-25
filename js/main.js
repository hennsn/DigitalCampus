
import * as THREE from 'https://cdn.skypack.dev/three@0.135.0'
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.135.0/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'https://cdn.skypack.dev/three@0.135.0/examples/jsm/loaders/DRACOLoader.js'
import { FBXLoader } from 'https://cdn.skypack.dev/three@0.135.0/examples/jsm/loaders/FBXLoader.js'


import { OutlinePass } from 'https://cdn.skypack.dev/three@0.135.0/examples/jsm/postprocessing/OutlinePass.js'
import { EffectComposer } from 'https://cdn.skypack.dev/three@0.135.0/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'https://cdn.skypack.dev/three@0.135.0/examples/jsm/postprocessing/RenderPass.js'

import { RGBELoader } from "https://cdn.skypack.dev/three@0.135.0/examples/jsm/loaders/RGBELoader.js";


import { clamp }  from './Maths.js'
import { createSky }  from './environment/Sky.js'
import { createLighting, createInsideLighting } from './environment/Lighting.js'
import { fillOutsideScene } from './environment/scenes/OutsideScene.js'
import { fillAbbeanumHS1Scene } from './environment/scenes/AbbeanumHS1Scene.js'
import { fillAbbeanumCorridorScene } from './environment/scenes/AbbeanumCorridorScene.js'
import { createTerrain } from './environment/Terrain.js'
import { handleUserInterface } from './UserInterface.js'
import { handleInteractions } from './interactions/Interactions.js'
import { startStory } from './interactions/Story.js'
import { updateMultiplayer } from './environment/Multiplayer.js'
import { createInteractions } from "./interactions/InteractionUtils/CreateInteractions.js";


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
outsideScene.name = 'Outside'

var abbeanumCorridorScene = window.abbeanumCorridorScene = new THREE.Scene()
abbeanumCorridorScene.name = 'AbbeanumCorridor'

var abbeanumHS1Scene = window.abbeanumHS1Scene = new THREE.Scene()
abbeanumHS1Scene.name = 'AbbeanumHS1'

createInsideLighting(abbeanumCorridorScene)

createInsideLighting(abbeanumHS1Scene)

fillOutsideScene()
fillAbbeanumCorridorScene()
fillAbbeanumHS1Scene()


createSky(outsideScene)
createLighting(outsideScene)
createTerrain(outsideScene)


// ----------------------------- OUTLINE PASS AND RENDERPASS FOR EFFECTIVE OUTLINE -------------------------------
// NOT WORKING YET, SO NOT NEEDED, but when deleting please mind, that the outlinepass is given to the handle interactions funcion
var composer = window.composer = new EffectComposer(renderer)
var outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), outsideScene, camera);



// ?
window.mixers = []





// start location
window.scene = outsideScene

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

// debugging information
// const stats = Stats()
// document.body.appendChild(stats.dom)

var lastTime = new Date().getTime()

function mainLoop(){

	const scene = window.scene

	const time = new Date().getTime()
	const deltaTime = clamp((time-lastTime)/1e3, 1e-3, 1.0)
	lastTime = time

	startStory(scene, mousecaster)
	// animation / physics stuff goes here
	handleInteractions(scene, camera, mousecaster, mouse, time, deltaTime, outlinePass)
	handleUserInterface(deltaTime)
	updateMultiplayer(scene, time, deltaTime, camera)
	// stats.update()

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
