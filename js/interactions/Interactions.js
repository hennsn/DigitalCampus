

import { OrbitControls } from 'https://cdn.skypack.dev/three@0.135.0/examples/jsm/controls/OrbitControls.js'
import { VRButton } from 'https://cdn.skypack.dev/three@0.135.0/examples/jsm/webxr/VRButton.js'

// what exactly does that do? / how does it work?
// eher etwas für die #InteractionsGruppe
// import { XRControllerModelFactory } from 'https://cdn.skypack.dev/three@0.135.0/examples/jsm/webxr/XRControllerModelFactory.js'

// the keyboard
const keyboard = {}

// the user
const user = { height: 1.8, speed: 0.2, turnSpeed: 0.03 }

function createInteractions(scene, camera, renderer, mouse){
	
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

	////////////////////
	//MOUSE LISTENERS///
	window.addEventListener( 'mousemove', onMouseMove, false );
	
	function onMouseMove(event){
		mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
		//console.log("mouse position: (" + window.mouse.x + ", "+ window.mouse.y + ")");
	}
	
	//event listener mouse click//////
	window.addEventListener('click', onMouseDown, false);

	function onMouseDown(event){
   		console.log("mouse position: (" + mouse.x + ", "+ mouse.y + ")");
	}
}

// helper functions for the animation loop
function handleInteractions(scene, camera, raycaster, mouse){

	//event listener auf fenster, raycaster for determination which object has been clicked
	
	raycaster.setFromCamera(camera.position, camera)
	//we cant check whole scene (too big) maybe copy the important objects from scene then do raycasting collision check
	const abbeanum = scene.getObjectByName('Abbeanum')
	const intersections = abbeanum ? raycaster.intersectObjects(scene.children) : null //abbeanum.children changed to scene.children
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

	/*
	hierhin maus raycaster; eiegntlich kein zweiter raycaster nötig
	const mouse in main is okay

	letzte zeile renderer nicht nötig, macht main

	// window. ist globaler namensraum

	window event listener triggered, then check with raycaster
	*/

	/////mouse tracking/////

	function render() {

		// update the picking ray with the camera and mouse position
		raycaster.setFromCamera( mouse, camera );
	
		// calculate objects intersecting the picking ray
		const intersects = raycaster.intersectObjects( scene.children );
	
		for ( let i = 0; i < intersects.length; i ++ ) {
	
			intersects[ i ].object.material.color.set( 0xff0000 );
	
		}
	
		//renderer.render( scene, camera );
	
	}

}

export { createInteractions, handleInteractions }