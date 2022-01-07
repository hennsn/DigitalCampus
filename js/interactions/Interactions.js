
import * as THREE from 'https://cdn.skypack.dev/three@0.135.0'
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.135.0/examples/jsm/controls/OrbitControls.js'
import { VRButton } from 'https://cdn.skypack.dev/three@0.135.0/examples/jsm/webxr/VRButton.js'
import { getHeightOnTerrain } from '../environment/Terrain.js'
import { clamp } from '../Maths.js'

// what exactly does that do? / how does it work?
// eher etwas für die #InteractionsGruppe
// import { XRControllerModelFactory } from 'https://cdn.skypack.dev/three@0.135.0/examples/jsm/webxr/XRControllerModelFactory.js'

// the keyboard
const keyboard = window.keyboard = {}

//boolean for raycasting check
let wasClicked = false

// the user
const user = { height: 1.8, eyeHeight: 1.7, speed: 2, turnSpeed: 0.03, isIntersecting: false }
const distanceToWalls = 1
const enterInterval = 300 // milli seconds
let lastEnter = Date.now()
function createInteractions(scene, camera, renderer){
	
	renderer.xr.enabled = true
	document.body.appendChild(VRButton.createButton(renderer))
	
	camera.position.set(7.2525284107715935, 0.949415911263972, -21.716083277168504)
	
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
		keyboard[event.key] = event.timeStamp
		keyboard[event.keyCode] = event.timeStamp
	}
	
	function keyUp(event){
		delete keyboard[event.key]
		delete keyboard[event.keyCode]
	}
	
	// for debugging: fps/frame-time/memory usage
	// browsers are typically locked at the screen refresh rate, so 60 fps (in my case) is perfect

	////////////////////
	//MOUSE LISTENERS///

	//window.addEventListener( 'mousemove', onMouseMove, false );
	/*
	function onMouseMove(event){
		mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
		//console.log("mouse position: (" + window.mouse.x + ", "+ window.mouse.y + ")");
	}*/
	
	//event listener mouse click//////
	window.addEventListener('click', onMouseClick, false);

	function onMouseClick(event){
		wasClicked = true;
		mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
   		console.log("mouse position: (" + mouse.x + ", "+ mouse.y + ")");
	}
}

var velocity = new THREE.Vector3(0,0,0)
var acceleration = new THREE.Vector3(0,0,0)

var forward = new THREE.Vector3(0,0,-1)
var right = new THREE.Vector3(1,0,0)

var up = new THREE.Vector3(0,1,0)
var down = new THREE.Vector3(0,-1,0)

var isInside = false

// helper functions for the animation loop
function handleInteractions(scene, camera, raycaster, dt){
	// get the models - maybe move to not do this every frame
	const abbeanum = scene.getObjectByName('Abbeanum')
	const abbeanumInside = scene.getObjectByName('AbbeanumInside')
	const abbeanumFlurCollisions = scene.getObjectByName('AbbeanumFlurCollisions')
	const abbeanumGround = scene.getObjectByName('AbbeanumGround')
	const abbeanumDoor = scene.getObjectByName('AbbeanumDoor')
	const cityCenter = scene.getObjectByName('City Center')
	const terrain = scene.getObjectByName('Terrain')
	acceleration.set(0,0,0)
	var dtx = clamp(dt * 10, 0, 1) // the lower this number is, the smoother is the motion
	
	/**
	 * Helper function for updating the camera controls in the animation loop.
	 */
	if(keyboard.ArrowLeft){
		camera.rotation.y += user.turnSpeed
	}
	if(keyboard.ArrowRight){
		camera.rotation.y -= user.turnSpeed
	}
	if(keyboard.w || keyboard.ArrowUp){
		acceleration.add(forward)
	}
	if(keyboard.s || keyboard.ArrowDown){
		acceleration.sub(forward)
	}
	
	if(keyboard.a) acceleration.sub(right)
	if(keyboard.d) acceleration.add(right)

	// check for general entrances - this can be made more generic
	if((keyboard.e || keyboard.Enter) && Date.now() - lastEnter > enterInterval && camera.position.distanceTo(abbeanumDoor.position) < 30){ // e - enter
		lastEnter = Date.now()
		isInside = !isInside
		abbeanum.visible = !isInside
		abbeanumGround.visible = !isInside
		abbeanumInside.visible = isInside
		cityCenter.visible = !isInside
		terrain.visible = !isInside
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
		
		if(abbeanumFlurCollisions) abbeanumFlurCollisions.visible = true
		
		raycaster.set(camera.position, velocity)
		
		// set the raycaster distance: we're not going any farther anyways
		// todo: we probably should check a little left and right as well, because our player should
		// have the feeling that he is a box/ellipsoid, not a line
		// we also should check a little lower and above, so he has to really fit below/above objects
		raycaster.near = 0
		raycaster.far  = velocity.length() + distanceToWalls
		
		// we cant check whole scene (too big) maybe copy the important objects from scene then do raycasting collision check
		const collidables = ( isInside ? 
			[abbeanumFlurCollisions] :
			[abbeanum, abbeanumGround]
		).filter(model => !!model)
		const intersections = window.intersections = raycaster.intersectObjects(collidables)

		user.isIntersecting = intersections && intersections.length > 0 && intersections[0].object.parent.visible
		if(user.isIntersecting){

			// there is an intersection -> adjust the walking direction
			// we adjust the walking direction by removing the collision component = face normal (n) from the velocity (v)
			// this can be done by calculating v_new = v - n * dot(n, v) (Gram-Schmidt Process)
			
			// the first intersection is the closest
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
		
		// theoretisch müsste es addScaledVector(velocity, dt) sein, aber damit klippe ich irgendwie immer durch die Wand
		camera.position.add(velocity)
		
		raycaster.set(camera.position, down)
		raycaster.near = 0
		raycaster.far  = user.eyeHeight + 2
		var noneY = -123
		var intersection = raycaster.intersectObjects(collidables)
		var floorY = intersection && intersection.length > 0 ? intersection[0].point.y : noneY
		if(!isInside){
			// add terrain as intersection
			var groundY = getHeightOnTerrain(camera.position.x, camera.position.z)
			floorY = Math.max(floorY, groundY)
		}
		if(floorY > noneY){
			camera.position.y = floorY + user.eyeHeight
		} else {
			// teleport player back in?
			// camera.position.y = getHeightOnTerrain(camera.position.x, camera.position.z) + user.eyeHeight
		}
		
		if(abbeanumFlurCollisions) abbeanumFlurCollisions.visible = false
		
	}


	/////MOUSE INTERACTIONS//////
	const abbeanumDoor = scene.getObjectByName('AbbeanumDoor')

	//CLICK EVENTS
	if(wasClicked == true){
		if(abbeanumDoor) abbeanumDoor.visible = true
		mousecaster.setFromCamera( mouse, camera );

		//////Array of clickable objects
		const clickableObjects = [abbeanumDoor]
		const mouseIntersects = mousecaster.intersectObjects(clickableObjects); //vs intersectObjects(scene.children)
		
		//check array for ray hits
		for ( let i = 0; i < mouseIntersects.length; i ++ ) {
			console.log('clicked on object')
		}

		/*//Just checks one object
		const mouseIntersects = mousecaster.intersectObject(abbeanumDoor);
		if(mouseIntersects.length>0){
			console.log('clicked on object')
		}*/

		if(abbeanumDoor) abbeanumDoor.visible = false;
		wasClicked = false
	}
}

export { createInteractions, handleInteractions }
