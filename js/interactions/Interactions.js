
import * as THREE from 'https://cdn.skypack.dev/three@0.135.0'
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.135.0/examples/jsm/controls/OrbitControls.js'
import { VRButton } from 'https://cdn.skypack.dev/three@0.135.0/examples/jsm/webxr/VRButton.js'
import { getHeightOnTerrain } from '../environment/Terrain.js'
import { clamp } from '../Maths.js'
import { playAudioTrack } from '../UserInterface.js'
import { xToLon, yToHeight, zToLat } from '../environment/Coordinates.js'
import { updateSparkles } from '../environment/Sparkles.js'
import {Door, InventoryObject, InfoObject} from './Interactable.js'

// what exactly does that do? / how does it work?
// eher etwas für die #InteractionsGruppe
// import { XRControllerModelFactory } from 'https://cdn.skypack.dev/three@0.135.0/examples/jsm/webxr/XRControllerModelFactory.js'

// the keyboard
const keyboard = window.keyboard = {}

// the user
let user = { height: 1.7, eyeHeight: 1.6, speed: 1.3, turnSpeed: 0.03, insideSpeed: 0.7, outsideSpeed: 1.3, isIntersecting: false, }
const distanceToWalls = 1
let lastInteractionTime = Date.now()
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
	
	function formatNumber(x, digits){
		x = Math.round(x * Math.pow(10, digits)) + ''
		return x.substr(0, x.length-digits)+'.'+x.substr(x.length-digits)
	}
	
	function keyDown(event){
		keyboard[event.key] = event.timeStamp
		keyboard[event.keyCode] = event.timeStamp
		switch(event.key){
			case 'z': 
				// a simple audio test: press z to play the audio
				playAudioTrack('audio/springTestSound.wav');
				break;
			case 'h': 
				// print the current camera position in world coordinates
				// can be used to place objects
				console.log(
					camera.position,
					formatNumber(zToLat(camera.position.z), 8) + ", " +
					formatNumber(xToLon(camera.position.x), 8) + ", " +
					formatNumber(yToHeight(camera.position.y), 3)
				);
				break;
		}
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

const forward = new THREE.Vector3(0,0,-1)
const right = new THREE.Vector3(1,0,0)

const up = new THREE.Vector3(0,1,0)
const down = new THREE.Vector3(0,-1,0)

// left/right, up/down, forward/backward
var rayChecks = [
	new THREE.Vector3( 0.0, 0.0, 0.0),
	new THREE.Vector3(+0.2, 0.0, 0.0),
	new THREE.Vector3(-0.2, 0.0, 0.0),
	new THREE.Vector3( 0.0,-0.2, 0.0),
	new THREE.Vector3( 0.0,+0.2, 0.0),
	new THREE.Vector3( 0.0, 0.0,-0.2),
	new THREE.Vector3( 0.0, 0.0,+0.2),
]

const hs1DoorPosition  = new THREE.Vector3(-14.2, 3.8, -36.4)
const abbeanumDoorPosition = new THREE.Vector3(2.84, 1.67, -20.35)
const doorInteractionRadius = 3

var couldInteract = false

// helper functions for the animation loop
function handleInteractions(scene, camera, raycaster, time, dt, outlinepass = null){

	
	
	// get the models - maybe move to not do this every frame
	const abbeanum = scene.getObjectByName('Abbeanum')
	const abbeanumInside = scene.getObjectByName('ScannedAbbeanumInside')
	const abbeanumFlurCollisions = scene.getObjectByName('AbbeanumFlurCollisions')
	const abbeanumGround = scene.getObjectByName('AbbeanumGround')
	const abbeanumHS1 = scene.getObjectByName('AbbeanumHS1')
	

	const abbeanumDoor = scene.getObjectByName('AbbeanumDoor')
	const abbeanumDoorInteractable = 
			window.abbeanumDoorInteractable =
			abbeanumDoor ?
			new Door(abbeanumDoor.children[2], abbeanumDoorPosition, [flurScene, outsideScene]) :
			undefined
	
	const hs1Door = scene.getObjectByName('HS1Door')
	const hs1DoorInteractable = hs1Door ? new Door(hs1Door.children[2], hs1DoorPosition, [flurScene, hs1Scene]) : undefined

	const cityCenter = scene.getObjectByName('City Center')
	const terrain = scene.getObjectByName('Terrain')

	const trashcan = window.trashcan = scene.getObjectByName('Trashcan')
	// inventory object? where?
	const trashcanInteractable = trashcan ?
											new InventoryObject(trashcan.children[2], trashcan.position, [flurScene]) :
											undefined
	
	const stick = scene.getObjectByName('Stick')
	const stickInteractable = stick ?
										new InventoryObject(stick.children[2], stick.position, [flurScene]) :
										undefined

	const laptop = scene.getObjectByName('Laptop')
	const laptopInteractable = laptop ?
										new InventoryObject(laptop.children[2], laptop.position, [flurScene]) :
										undefined
	
	const laptop2 = scene.getObjectByName('Laptop2')
	const laptop2Interactable = laptop ? 
										new InventoryObject(laptop2.children[2], laptop2.position, [flurScene]) :
										undefined

	const blackboards = scene.getObjectByName('Blackboards')
	const blackboardsInteractable = blackboards ? 
									new InventoryObject(blackboards.children[2], blackboards.position, [flurScene]) :
									undefined

	const interactables = [abbeanumDoorInteractable, hs1DoorInteractable, laptopInteractable, stickInteractable,
							trashcanInteractable, laptop2Interactable, blackboardsInteractable]
	if(scene != outsideScene){
		user.speed = user.insideSpeed;
	}
	else {
		user.speed = user.outsideSpeed
	}

	// set to city center so it's less likely someone notices when accidentally pressing one of the buttons :D
	const debuggedObject = laptop2

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

	// placing a debug object
	if(keyboard.l) debuggedObject.position.z -= dt // model front
	if(keyboard.i) debuggedObject.position.x -= dt // model left
	if(keyboard.j) debuggedObject.position.z += dt // model back
	if(keyboard.k) debuggedObject.position.x += dt // model right
	if(keyboard.o) debuggedObject.rotation.y += dt * 5 * user.turnSpeed // model rot left
	if(keyboard.u) debuggedObject.rotation.y -= dt * 5 * user.turnSpeed // model rot right
	if(keyboard.n) debuggedObject.position.y -= dt // model down
	if(keyboard.m) debuggedObject.position.y += dt // model up
	


	// ---------------------------------------------- INTERACTION CHECKERS -------------------------------------------------
	// we are only looking for all interactable objects in our interactable array
	// we will choose the closest for interaction.
	// if that does not work, it might have to be changed to the closest one that we look at.
	const currentInteractables = interactables.filter(interactable => 
							 interactable != undefined && interactable.canInteract(scene, camera, lastInteractionTime))
	const sparkleTargets = currentInteractables.map(o => o.position)
	const canInteract = (currentInteractables != undefined && currentInteractables.length > 0)

	
	if(couldInteract != canInteract){
		couldInteract = canInteract
		controlHints.innerHTML = canInteract ? 'WASD walk<br>LEFT/RIGHT turn<br>E interact' : 'WASD walk<br>LEFT/RIGHT turn'
	}
	// we could create an "Interactable" class, which does this, and could generalize pickups with that
	// check for general entrances - this can be made more generic
	if((keyboard.e || keyboard.Enter) && 
		currentInteractables != undefined &&
		currentInteractables.length > 0
	)
	{	
		// sort interactables, such that the closest element will be interacted with
		currentInteractables.sort((e1,e2) => {
							if(camera.position.distanceTo(e1.position) > camera.position.distanceTo(e2.position)){
								return 1
							}
							else{
								return -1
							}
						})
				
		currentInteractables[0].interact(scene)
		lastInteractionTime = Date.now()
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
		
		// we cant check whole scene (too big) maybe copy the important objects from scene then do raycasting collision check
		const collidables = ( 
			scene == outsideScene ? [abbeanum, abbeanumGround] :
			scene == flurScene ? [abbeanumFlurCollisions] :
			scene == hs1Scene ? [] :
			[]
		).filter(model => !!model)
		
		var isIntersecting = false
		raycaster.near = 0 
		raycaster.far  = velocity.length() + distanceToWalls
		const cameraSpaceRight = new THREE.Vector3(-velocity.z, 0, velocity.x).normalize()
		for(var i=0;i<rayChecks.length;i++){
			const rayCheck = rayChecks[i]
			const position = camera.position.clone()
			position.addScaledVector(cameraSpaceRight, rayCheck.x)
			position.addScaledVector(up, rayCheck.y)
			position.addScaledVector(velocity, rayCheck.z / velocity.length())
			raycaster.set(position, velocity)
			const intersections = raycaster.intersectObjects(collidables)
			if(intersections && intersections.length > 0){
				
				isIntersecting = true
				
				// we can do this slowing-down for every closest intersection
				// this will prevent clipping through edges
				const intersection = intersections[0]
				const object = intersection.object
				const normal = intersection.face.normal.clone()
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
		}
		
		user.isIntersecting = isIntersecting
		
		// theoretisch müsste es addScaledVector(velocity, dt) sein, aber damit klippe ich irgendwie immer durch die Wand
		camera.position.add(velocity)
		
		raycaster.set(camera.position, down)
		raycaster.near = 0
		raycaster.far  = user.eyeHeight + 2
		var noneY = -123
		var intersection = raycaster.intersectObjects(collidables)
		var floorY = intersection && intersection.length > 0 ? intersection[0].point.y : noneY
		if(scene == outsideScene){
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
	updateSparkles(scene, camera, sparkleTargets, time, dt)
	
}

export { createInteractions, handleInteractions }
