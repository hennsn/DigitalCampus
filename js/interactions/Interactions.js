
import * as THREE from 'https://cdn.skypack.dev/three@0.135.0'
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.135.0/examples/jsm/controls/OrbitControls.js'
import { VRButton } from 'https://cdn.skypack.dev/three@0.135.0/examples/jsm/webxr/VRButton.js'
import { getHeightOnTerrain } from '../environment/Terrain.js'
import { clamp } from '../Maths.js'
import { playAudioTrack } from '../UserInterface.js'
import { xToLon, yToHeight, zToLat } from '../environment/Coordinates.js'

// what exactly does that do? / how does it work?
// eher etwas für die #InteractionsGruppe
// import { XRControllerModelFactory } from 'https://cdn.skypack.dev/three@0.135.0/examples/jsm/webxr/XRControllerModelFactory.js'

// the keyboard
const keyboard = window.keyboard = {}

//boolean for raycasting check
let wasClicked = false
//boolean for inventory
let inventoryOpen = false;

///COUNTER FOR STORY (we'll see if it works that way or if it's to simple) /////
let story = 0

// the user
const user = { height: 1.7, eyeHeight: 1.6, speed: 2, turnSpeed: 0.03, isIntersecting: false }
const distanceToWalls = 1
const enterInterval = 300 // milli seconds
let lastEnter = Date.now()
function createInteractions(scene, camera, renderer, mouse){
	
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
			case 'q':
				//opens inventory
				if(inventoryOpen == false){
					playAudioTrack('audio/inventorySound.mp3');
					document.getElementById("inventory").style.visibility = 'visible';
					inventoryOpen = true
				}else{
					document.getElementById("inventory").style.visibility = 'hidden';
					inventoryOpen = false
				}
				
				break;
		}
	}
	
	function keyUp(event){
		delete keyboard[event.key]
		delete keyboard[event.keyCode]
	}
	
	// for debugging: fps/frame-time/memory usage
	// browsers are typically locked at the screen refresh rate, so 60 fps (in my case) is perfect

	////////////////////
	//MOUSE LISTENERS///

	/*
	//updates mouse on move, not really necessary
	//window.addEventListener( 'mousemove', onMouseMove, false );
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
const mainDoorPosition = new THREE.Vector3(2.84, 1.67, -20.35)
const doorInteractionRadius = 3

var couldInteract = null

// helper functions for the animation loop
function handleInteractions(scene, camera, raycaster, mousecaster, mouse, dt){
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
	
	var debuggedObject = trashcan

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
	
	var canInteract = 
		(scene != outsideScene && camera.position.distanceTo(hs1DoorPosition) < doorInteractionRadius) ||
		(abbeanumDoor && camera.position.distanceTo(mainDoorPosition) < doorInteractionRadius)
	
	if(couldInteract != canInteract || couldInteract == null){
		couldInteract = canInteract
		controlHints.innerHTML = canInteract ? 'WASD walk<br>LEFT/RIGHT turn<br>E interact' : 'WASD walk<br>LEFT/RIGHT turn'
	}

	// check for general entrances - this can be made more generic
	if((keyboard.e || keyboard.Enter) && 
		Date.now() - lastEnter > enterInterval
	){
		if(scene != outsideScene && camera.position.distanceTo(hs1DoorPosition) < doorInteractionRadius){
			lastEnter = Date.now()
			window.scene = scene = (scene == flurScene) ? hs1Scene : flurScene
		} else if(camera.position.distanceTo(mainDoorPosition) < doorInteractionRadius){
			lastEnter = Date.now()
			window.scene = scene = (scene == outsideScene) ? flurScene : outsideScene
		}
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

	/*To do:
	objects in the array that are inside that abbeanum are undefined
	either two array for inside/outside objects, or only add objects to array when we enter the building */

	////////////////
	/// MISSION TEXT BOX ///
	////////////////
	if(scene == flurScene && story == 0){
		missionText.innerHTML = "Gehe zum Hörsaal 1"
		story = 1
	}
	if(scene == hs1Scene && story == 1){
		missionText.innerHTML = "Gehe zum Beameranschluss bei der Tafel"
		story = 1
	}


	/////MOUSE INTERACTIONS//////
	//CLICK EVENTS
	if(wasClicked == true){
		if(abbeanumDoor) abbeanumDoor.visible = true
		//we probably don't need these:
		//if(laptop) laptop.visible = true
		//if(stick) stick.visible = true

		mousecaster.setFromCamera( mouse, camera );

		//////Array of clickable objects	
		const clickableObjects = (
			scene == outsideScene ? [abbeanumDoor] :
			scene == flurScene ? [laptop, stick] :
			scene == hs1Scene ? [] :
			[]
		).filter(model => !!model)
		
		//clicked object
		const first = clickableObjects[0]

		console.log(clickableObjects)

		const mouseIntersects = mousecaster.intersectObjects(clickableObjects); //vs intersectObjects(scene.children)
		//check array for ray hits
		for ( let i = 0; i < mouseIntersects.length; i ++ ) {
			console.log(clickableObjects)
			console.log('clicked on object: ', first.name)

			//makes laptop invisible when clicked
			if(first == laptop){
				if(laptop) laptop.visible = false
			}
		}

		/*//Just checks one object
		const mouseIntersects = mousecaster.intersectObject(abbeanumDoor);
		if(mouseIntersects.length>0){
			console.log('clicked on object')
		}*/

	
		if(abbeanumDoor) abbeanumDoor.visible = false;
		//if(laptop) laptop.visible = false //actually makes the whole laptop disappear if we click ANYWHERE IN THE SCENE
		//if(stick) stick.visible = false //guess same?
		wasClicked = false
	}
}

export { createInteractions, handleInteractions }
