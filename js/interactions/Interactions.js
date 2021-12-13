

import { OrbitControls } from 'https://cdn.skypack.dev/three@0.135.0/examples/jsm/controls/OrbitControls.js'
import { VRButton } from 'https://cdn.skypack.dev/three@0.135.0/examples/jsm/webxr/VRButton.js'

// what exactly does that do? / how does it work?
// eher etwas für die #InteractionsGruppe
// import { XRControllerModelFactory } from 'https://cdn.skypack.dev/three@0.135.0/examples/jsm/webxr/XRControllerModelFactory.js'

// the keyboard
const keyboard = {}

// the user
const user = { height: 1.8, speed: 0.2, turnSpeed: 0.03 }

function createInteractions(scene, camera, renderer){
	
	renderer.xr.enabled = true
	document.body.appendChild(VRButton.createButton(renderer))
	
	camera.position.set(0, user.height, 15)
	
	// Antonio wants to use them for debugging
	if(localStorage.orbitControls){
		const controls = new OrbitControls(camera, renderer.domElement)
		controls.target.set(0, 1, 0) // orbit center
		controls.update()// compute transform for 1st frame
	}
	
	////////////////////////////////
	// listeners for interactions //
	////////////////////////////////

	
	// Keyboard listeners
	window.addEventListener('keydown', keyDown)
	window.addEventListener('keyup', keyUp)
	
	
	function keyDown(event){
		keyboard[event.keyCode] = true 
	}
	
	function keyUp(event){
		keyboard[event.keyCode] = false
	}
	
	// for debugging: fps/frame-time/memory usage
	// browsers are typically locked at the screen refresh rate, so 60 fps (in my case) is perfect
	
	
	
}

// helper functions for the animation loop
function handleInteractions(scene, camera, raycaster){
	
	raycaster.setFromCamera(camera.position, camera)
	//we cant check whole scene (too big) maybe copy the important objects from scene then do raycasting collision check
	const abbeanum = scene.getObjectByName('Abbeanum')
	const intersections = abbeanum ? raycaster.intersectObjects(abbeanum.children) : null
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
		//test if there is an collision in front of us
		if(intersections.length<1){
		camera.position.x += -Math.sin(camera.rotation.y) * user.speed
		camera.position.z += -Math.cos(camera.rotation.y) * user.speed
		}	
	}
	if(keyboard[40] || keyboard[83]){ // down arrow  or s pressed
		camera.position.x -= -Math.sin(camera.rotation.y) * user.speed
		camera.position.z -= -Math.cos(camera.rotation.y) * user.speed
	}
	
	if(keyboard[65]){
		if(intersections.length<1){
		camera.position.x -= Math.sin(camera.rotation.y + Math.PI / 2) * user.speed
		camera.position.z -= Math.cos(camera.rotation.y + Math.PI / 2) * user.speed
		}
	}
	
	if(keyboard[68]){
		if(intersections.length<1){
		camera.position.x += Math.sin(camera.rotation.y + Math.PI / 2) * user.speed
		camera.position.z += Math.cos(camera.rotation.y + Math.PI / 2) * user.speed
		}
	}
	
}

export { createInteractions, handleInteractions }