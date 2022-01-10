
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

// the user
const user = { height: 1.7, eyeHeight: 1.6, speed: 2, turnSpeed: 0.03, isIntersecting: false }
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
	
	
}

var velocity = new THREE.Vector3(0,0,0)
var acceleration = new THREE.Vector3(0,0,0)

var forward = new THREE.Vector3(0,0,-1)
var right = new THREE.Vector3(1,0,0)

var up = new THREE.Vector3(0,1,0)
var down = new THREE.Vector3(0,-1,0)

var isInside = false


// helper functions for the animation loop
function handleInteractions(scene, camera, raycasterList, dt){
	// get the models - maybe move to not do this every frame
	const abbeanum = scene.getObjectByName('Abbeanum')
	const abbeanumInside = scene.getObjectByName('ScannedAbbeanumInside')
	const abbeanumFlurCollisions = scene.getObjectByName('AbbeanumFlurCollisions')
	const abbeanumGround = scene.getObjectByName('AbbeanumGround')
	const abbeanumDoor = scene.getObjectByName('AbbeanumDoor')
	const cityCenter = scene.getObjectByName('City Center')
	const terrain = scene.getObjectByName('Terrain')
	const abbeanumHS1 = scene.getObjectByName('AbbeanumHS1')

	const trashcan = window.trashcan = scene.getObjectByName('Trashcan')
	const stick = scene.getObjectByName('Stick')
	const laptop = scene.getObjectByName('Laptop')

	acceleration.set(0,0,0)
	var dtx = clamp(dt * 10, 0, 1) // the lower this number is, the smoother is the motion
	
	/**
	 * Helper function for updating the camera controls in the animation loop.
	 */
	if(keyboard.ArrowLeft){
		camera.rotation.y -= user.turnSpeed
	}
	if(keyboard.ArrowRight){
		camera.rotation.y += user.turnSpeed
	}
	if(keyboard.w || keyboard.ArrowUp){
		acceleration.add(forward)
	}
	if(keyboard.s || keyboard.ArrowDown){
		acceleration.sub(forward)
	}
	
	if(keyboard.a) acceleration.sub(right)
	if(keyboard.d) acceleration.add(right)


	if(keyboard.l) trashcan.position.z -= 0.1 //model front
	if(keyboard.i) trashcan.position.x -= 0.1//modeul left
	if(keyboard.j) trashcan.position.z += 0.1//model back
	if(keyboard.k) trashcan.position.x += 0.1//model right
	if(keyboard.o) trashcan.rotation.y += 0.5 * user.turnSpeed //model rot left
	if(keyboard.u) trashcan.rotation.y -= 0.5 * user.turnSpeed//model rot right
	if(keyboard.n) trashcan.position.y -= 0.1//model down
	if(keyboard.m) trashcan.position.y += 0.1//model up

	// check for general entrances - this can be made more generic
	if((keyboard.e || keyboard.Enter) && Date.now() - lastEnter > enterInterval && camera.position.distanceTo(abbeanumDoor.position) < 30){ // e - enter
		lastEnter = Date.now()
		isInside = !isInside
		abbeanum.visible = !isInside
		abbeanumGround.visible = !isInside
		abbeanumInside.visible = isInside
		abbeanumHS1.visible = isInside
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
		
		//how wide around the player we want to check?
		const cameraLeft = new THREE.Vector3(camera.position.x-1.5, camera.position.y, camera.position.z)
		const cameraRight  = new THREE.Vector3(camera.position.x+1.5, camera.position.y, camera.position.z)

		//initialize the rays for front, left side and right side
		raycasterList[0].set(camera.position, velocity)
		raycasterList[1].set(cameraLeft, velocity)
		raycasterList[2].set(cameraRight, velocity)
		
		// set the raycaster distance: we're not going any farther anyways
		// todo: we probably should check a little left and right as well, because our player should
		// have the feeling that he is a box/ellipsoid, not a line
		// we also should check a little lower and above, so he has to really fit below/above objects
		// just set all the same near and far
		for(var i=0; i<raycasterList.length; i++)
		{
			raycasterList[i].near = 0
			raycasterList[i].far  = velocity.length() + distanceToWalls
		}

		
		// we cant check whole scene (too big) maybe copy the important objects from scene then do raycasting collision check
		const collidables = ( isInside ? 
			[abbeanumFlurCollisions] :
			[abbeanum, abbeanumGround]
		).filter(model => !!model)
		// get intersections of left and right ray also
		const intersections = window.intersections = raycasterList[0].intersectObjects(collidables)
		const intersectionsLeft = window.intersections = raycasterList[1].intersectObjects(collidables)
		const intersectionsRight = window.intersections = raycasterList[2].intersectObjects(collidables)
		
		user.isIntersecting = intersections && intersections.length> 0&& intersections[0].object.parent.visible ||
		intersectionsLeft && intersectionsLeft.length> 0&& intersectionsLeft[0].object.parent.visible ||
		intersectionsRight && intersectionsRight.length> 0&& intersectionsRight[0].object.parent.visible
		if(user.isIntersecting){

			// there is an intersection -> adjust the walking direction
			// we adjust the walking direction by removing the collision component = face normal (n) from the velocity (v)
			// this can be done by calculating v_new = v - n * dot(n, v) (Gram-Schmidt Process)
			if(intersections[0]!=null){
				var intersection=intersections[0]
			}
			//check if left object is colliding
			if(intersectionsLeft[0]!=null){
				var intersection=intersectionsLeft[0]
			}
			//check if right object is coilliding
			if(intersectionsRight[0]!=null){
				var intersection=intersectionsRight[0]
			}

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
		
		raycasterList[0].set(camera.position, down)
		raycasterList[0].near = 0
		raycasterList[0].far  = user.eyeHeight + 2
		var noneY = -123
		var intersection = raycasterList[0].intersectObjects(collidables)
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
	
}

export { createInteractions, handleInteractions }
