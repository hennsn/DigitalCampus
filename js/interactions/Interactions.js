
import * as THREE from 'https://cdn.skypack.dev/three@0.135.0'
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.135.0/examples/jsm/controls/OrbitControls.js'
import { VRButton } from 'https://cdn.skypack.dev/three@0.135.0/examples/jsm/webxr/VRButton.js'
import { getHeightOnTerrain } from '../environment/Terrain.js'

// what exactly does that do? / how does it work?
// eher etwas für die #InteractionsGruppe
// import { XRControllerModelFactory } from 'https://cdn.skypack.dev/three@0.135.0/examples/jsm/webxr/XRControllerModelFactory.js'

// the keyboard
const keyboard = {}

// the user
const user = { height: 1.8, speed: 2, turnSpeed: 0.03, isIntersecting: false }

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

var velocity = new THREE.Vector3(0,0,0)
var acceleration = new THREE.Vector3(0,0,0)

var forward = new THREE.Vector3(0,0,-1)
var right = new THREE.Vector3(1,0,0)

// helper functions for the animation loop
function handleInteractions(scene, camera, raycaster){
	
	acceleration.set(0,0,0)
	var dt = 1/60
	var dtx = dt * 10
	
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
		acceleration.add(forward)
	}
	if(keyboard[40] || keyboard[83]){ // down arrow or s pressed
		acceleration.sub(forward)
	}
	
	if(keyboard[65]){
		acceleration.sub(right)
	}
	
	if(keyboard[68]){
		acceleration.add(right)
	}
	
	velocity.multiplyScalar(1-dtx)
	
	// transform the input from camera space into world space
	var accelerationLength = acceleration.length()
	if(accelerationLength > 0){
		var frictionMultiplier = user.isIntersecting ? 0.5 : 1.0
		acceleration.transformDirection(camera.matrixWorld) // normalizes the result
		acceleration.multiplyScalar(accelerationLength) // restore length
		velocity.add(acceleration.multiplyScalar(dt * user.speed * frictionMultiplier))
	}
	
	// check if there is something in the way
	if(velocity.length() > 1e-3 * user.speed){// we're in motion
		
		raycaster.set(camera.position, velocity)
		// we cant check whole scene (too big) maybe copy the important objects from scene then do raycasting collision check
		const abbeanum = scene.getObjectByName('Abbeanum')
		const intersections = abbeanum ? raycaster.intersectObjects(abbeanum.children) : null
		
		user.isIntersecting = intersections && intersections.length > 0
		if(user.isIntersecting){// first one is closest
			var intersection = intersections[0]
			var face = intersection.face
			var normal = face.normal.clone()
			var object = intersection.object
			// transform normal from object space to world space
			normal.transformDirection(object.matrixWorld)
			// remove the projection
			normal.multiplyScalar(velocity.dot(normal))
			if(normal.dot(velocity) < 0){// ensure we don't get accelerated by negative walls
				velocity.add(normal)
			} else {
				velocity.sub(normal)
			}
		}
		
		camera.position.add(velocity)
		camera.position.y = getHeightOnTerrain(camera.position.x, camera.position.z) + user.height
		
	}
	
	
}

export { createInteractions, handleInteractions }