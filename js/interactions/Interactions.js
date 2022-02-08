
import * as THREE from 'https://cdn.skypack.dev/three@0.135.0'
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.135.0/examples/jsm/controls/OrbitControls.js'
import { VRButton } from 'https://cdn.skypack.dev/three@0.135.0/examples/jsm/webxr/VRButton.js'

import { clamp, degToRad } from '../Maths.js'
import { playAudioTrack } from '../UserInterface.js'
import { xToLon, yToHeight, zToLat } from '../environment/Coordinates.js'
import { updateSparkles } from '../environment/Sparkles.js'
import { Door, InventoryObject, InfoObject, CustomInteractable } from './Interactable.js'
import { sendMultiplayerMessage } from '../environment/Multiplayer.js'
import { JoyStick } from '../libs/joystick/joy.min-2.js'
import { handleKeyBoardMovementInteractionsInteraction } from './InteractionUtils/MovementInteractions.js'
import { checkCollision } from './InteractionUtils/CollisionCheck.js'
import { Constants } from './Constants.js'

// what exactly does that do? / how does it work?
// eher etwas für die #InteractionsGruppe
// import { XRControllerModelFactory } from 'https://cdn.skypack.dev/three@0.135.0/examples/jsm/webxr/XRControllerModelFactory.js'

// the keyboard
const keyboard = window.keyboard = {}
let debuggedObject

//boolean for raycasting check
let wasClicked = false
//boolean for inventory
let inventoryOpen = false;
//boolean overlay
let overlayActive = false

///COUNTER FOR STORY (we'll see if it works that way or if it's to simple) /////
let story = 0
//array für alle modelle die wir einsammeln
const inInventory = ["Handy", "USB Stick"]
inventory.innerHTML += "Handy <br> USB Stick"

// the user
// block user for cutscenes 
let user = { height: 1.7, eyeHeight: 1.6, speed: 1.3, turnSpeed: 0.03, insideSpeed: 0.7, outsideSpeed: 1.3, isIntersecting: false, }
//const distanceToWalls = 1
let lastInteractionTime = Date.now()

var keyWasPressed = false

const jumpDuration = Constants.jumpDuration
const jumpHeight = Constants.jumpHeight

var jumpTime = Constants.jumpTime

function clampCameraRotation(){
	camera.rotation.x = clamp(camera.rotation.x, -60*degToRad, +60*degToRad)
}


// https://stackoverflow.com/a/4819886/4979303
function isTouchDevice() {
	return (('ontouchstart' in window) ||
		(navigator.maxTouchPoints > 0) ||
		(navigator.msMaxTouchPoints > 0));
}

// Entry points for the scenes
const OutsideEntryPointFromAbbeanum = new THREE.Vector3(2.8885, 1.6634, -20.2698)
const CorridorEntryPointFromHS1 = new THREE.Vector3(-16.9378, 3.8484, -34.7462)
const CorridorEntryPointFromOutside = new THREE.Vector3(1.4122, 1.4596, -20.0527)
const HS1EntryPointFromCorridor = new THREE.Vector3(-15.5154, 3.8484, -35.038)

const abbeanumDoorEntranceInteractable = 
	new Door(undefined, undefined, CorridorEntryPointFromOutside)

const abbeanumDoorExitInteractable = 
	new Door(undefined, undefined, OutsideEntryPointFromAbbeanum)

const hs1DoorEntranceInteractable =
	new Door(undefined, undefined, HS1EntryPointFromCorridor)

const hs1DoorExitInteractable =
	new Door(undefined, undefined, CorridorEntryPointFromHS1)

const trashcanInteractable =
	new InventoryObject(undefined, undefined)

const stickInteractable =
	new InventoryObject(undefined, undefined)

const laptopInteractable =
	new CustomInteractable(undefined, undefined, undefined)

const laptop2Interactable =
	new InventoryObject(undefined, undefined)

const blackboardsInteractable = 
	new InventoryObject(undefined, undefined)

const cupInteractable =
	new InventoryObject(undefined, undefined)

const beamerInteractable =
	new CustomInteractable(undefined, undefined, undefined)

const abbeanumInfoBoardInteractable =
	new InfoObject(undefined, undefined)

const tvCuboidInteractable =
	new CustomInteractable(undefined, undefined, () => {
		scene.getObjectByName('AbbeanumInside').getObjectByName('Fernseher_aus').visible = true
		scene.getObjectByName('AbbeanumInside').getObjectByName('Fernseher_an').visible = false
		
	})

const HS2DoorDummyInteractable =
	new CustomInteractable(undefined, undefined)

const preproomDoorDummyInteractable = 
	new CustomInteractable(undefined, undefined)

const bathroomDoorDummyBasementInteractable =
	new CustomInteractable(undefined, undefined)

const bathroomDoorDummyUpstairsInteractable =
	new CustomInteractable(undefined, undefined)

const coffeeMachineInteractable =
	new CustomInteractable(undefined, undefined)

function createInteractions(scene, camera, renderer, mouse){

	
	//OVERLAY//
	const overlay = document.getElementById('overlay');
	overlay.addEventListener('click', closeText);

    function openText(){
        //document.getElementById("infoPicture").classList.add("active");
        document.getElementById("overlay").classList.add("active");
		overlayActive = true
    }

    function closeText(){
        //document.getElementById("infoPicture").classList.remove("active");
        document.getElementById("overlay").classList.remove("active");
		overlayActive = false
    }

	// change to a more intuitive rotation order
	camera.rotation.order = 'YXZ'
	
	renderer.xr.enabled = true
	document.body.appendChild(VRButton.createButton(renderer))
	
	camera.position.set(7.2525284107715935, 0.949415911263972, -21.716083277168504)
	
	// create joysticks,
	// maybe only if we are on a phone
	// todo: if we have phone controls, stuff needs to work with touch-clickes as well
	if(isTouchDevice() || localStorage.isTouchDevice){
		// doesn't work :/
		// document.body.requestFullscreen()
		const jsSize = window.innerWidth > window.innerHeight ? '30vh' : '30vw'
		motionJoyStick.style.display = 'block'
		motionJoyStick.style.width = jsSize
		motionJoyStick.style.height = jsSize
		turningJoyStick.style.display = 'block'
		turningJoyStick.style.width = jsSize
		turningJoyStick.style.height = jsSize
		const joyStickColors = { 
			internalFillColor: '#fff0',
			internalStrokeColor: '#fff',
			externalStrokeColor: '#fff'
		}
		new JoyStick('motionJoyStick', joyStickColors, data => {
			keyboard.MotionX = data.x/100
			keyboard.MotionY = data.y/100
		})
		new JoyStick('turningJoyStick', joyStickColors, data => { 
			keyboard.TurningX = data.x/100
			keyboard.TurningY = data.y/100
		})
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
		keyWasPressed = true
		keyboard[event.key] = event.timeStamp
		keyboard[event.keyCode] = event.timeStamp
		switch(event.key){
			case ' ':// space for jumping
				if(jumpTime <= 0.0 || jumpTime >= jumpDuration * 0.75){
					jumpTime = 0.0
				}
				break;
			case 'z': 
				// a simple audio test: press z to play the audio
				playAudioTrack('audio/springTestSound.wav');
				if(overlayActive == false){ 
					openText()
				} else {
					closeText()
				}
				break;
			case 'h': 
				// print the current camera position in world coordinates
				// can be used to place objects
				console.log('player')
				console.log(
					camera.position,
					formatNumber(zToLat(camera.position.z), 8) + ", " +
					formatNumber(xToLon(camera.position.x), 8) + ", " +
					formatNumber(yToHeight(camera.position.y), 3)
				);
				if(debuggedObject)
				{
				console.log('\n')
				console.log(debuggedObject.name)
				console.log(
					formatNumber(zToLat(debuggedObject.position.z), 8) + ", " +
					formatNumber(xToLon(debuggedObject.position.x), 8) + ", " +
					formatNumber(yToHeight(debuggedObject.position.y), 3) + "\n" +
					debuggedObject.position.x + ' ' + debuggedObject.position.y + ' ' + debuggedObject.position.z 
				)
				}
				break;
			case 'q':
				// opens inventory
				if(inventoryOpen == false){
					playAudioTrack('audio/inventorySound.mp3');
					document.getElementById("inventory").style.visibility = 'visible';
					inventoryOpen = true
				} else {
					document.getElementById("inventory").style.visibility = 'hidden';
					inventoryOpen = false
				}
				break;
			case 't':
				var message = window.prompt('Message to send:')
				if(message){
					message = message.trim()
					if(message.length > 0){
						sendMultiplayerMessage(message)
					}
				}
				break
		}
	}
	
	function keyUp(event){
		keyWasPressed = true
		delete keyboard[event.key]
		delete keyboard[event.keyCode]
	}
	
	// for debugging: fps/frame-time/memory usage
	// browsers are typically locked at the screen refresh rate, so 60 fps (in my case) is perfect

	////////////////////
	//MOUSE LISTENERS///
	////////////////////
	
	window.addEventListener('mousemove', (event) => {
		mouse.x =   (event.clientX / window.innerWidth ) * 2 - 1
		mouse.y = - (event.clientY / window.innerHeight) * 2 + 1
		if(keyboard.rightMouseButton){
			var mouseSpeed = 4 / window.innerHeight
			camera.rotation.y += mouseSpeed * (event.movementX || 0)
			camera.rotation.x += mouseSpeed * (event.movementY || 0)
			clampCameraRotation()
		}
	}, false );
	
	var mouseButtonNames = ['leftMouseButton', 'middleMouseButton', 'rightMouseButton']
	
	// event listener mouse click
	window.addEventListener('mousedown', (event) => {
		if(event.button == 0) wasClicked = true // left mouse button only
		mouse.x =   ( event.clientX / window.innerWidth  ) * 2 - 1;
		mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
   		console.log("mouse position: (" + mouse.x + ", "+ mouse.y + ")");
		keyboard[mouseButtonNames[event.button]] = 1
	}, false)
	
	window.addEventListener('mouseup', (event) => {
		delete keyboard[mouseButtonNames[event.button]]
	}, false)
	
	// prevent the context menu to be opened on right click,
	// so the user can turn with his mouse without being interupted
	window.addEventListener('contextmenu', (event) => {
		event.preventDefault()
	})

}


var velocity = new THREE.Vector3(0,0,0)
var acceleration = new THREE.Vector3(0,0,0)

var couldInteract = false

// helper functions for the animation loop
function handleInteractions(scene, camera, raycaster, mousecaster, mouse, time, dt, outlinepass = null){
	
	// get the models - maybe move to not do this every frame
	//const abbeanum = scene.getObjectByName('Abbeanum')
	const abbeanumInside = scene.getObjectByName('AbbeanumInside')
	const constabbeanumCorridorCollisions = scene.getObjectByName('AbbeanumCorridorCollisions')
//	const abbeanumGround = scene.getObjectByName('AbbeanumGround')
	const cityCenter = scene.getObjectByName('City Center')
	const terrain = scene.getObjectByName('Terrain')
	const abbeanumHS1 = scene.getObjectByName('AbbeanumHS1')
	const wetFloor = scene.getObjectByName('WetFloorSign')
	
	const abbeanumDoorEntrance = scene.getObjectByName('AbbeanumDoorEntrance')
	if(abbeanumDoorEntrance){
		abbeanumDoorEntranceInteractable.setInteractableModel(abbeanumDoorEntrance)
		abbeanumDoorEntranceInteractable.scene = flurScene
	} 
		
	const abbeanumDoorExit = scene.getObjectByName('AbbeanumDoorExit')
	if(abbeanumDoorExit) {
		abbeanumDoorExitInteractable.setInteractableModel(abbeanumDoorExit)
		abbeanumDoorExitInteractable.scene = outsideScene
	}
		
	const hs1DoorEntrance = scene.getObjectByName('HS1DoorEntrance')
	if(hs1DoorEntrance) {
		hs1DoorEntranceInteractable.setInteractableModel(hs1DoorEntrance)
		hs1DoorEntranceInteractable.scene = hs1Scene
	}

	const hs1DoorExit = scene.getObjectByName('HS1DoorExit')
	if(hs1DoorExit) {
		hs1DoorExitInteractable.setInteractableModel(hs1DoorExit)
		hs1DoorExitInteractable.scene = flurScene
	}

	const trashcan = window.trashcan = scene.getObjectByName('Trashcan')
	if(trashcan){
		trashcanInteractable.setInteractableModel(trashcan)	
		trashcanInteractable.scene = flurScene
	}

	const stick = scene.getObjectByName('Stick')
	if(stick){
	stickInteractable.setInteractableModel(stick)
	stickInteractable.scene = outsideScene
	}

	// the laptops need more verbose names
	const laptop = scene.getObjectByName('Laptop')
	if(laptop){
		laptopInteractable.setInteractableModel(laptop)
		laptopInteractable.scene = hs1Scene
	}
	
	const laptop2 = scene.getObjectByName('Laptop with Backup') //Laptop2 originally
	if(laptop2){
		laptop2Interactable.setInteractableModel(laptop2)
		laptop2Interactable.scene = flurScene
	}

	const blackboards = scene.getObjectByName('Blackboards')
	if(blackboards){
		blackboardsInteractable.setInteractableModel(blackboards)
		blackboardsInteractable.scene = hs1Scene
	}
	const cup = scene.getObjectByName('Cup')
	if(cup) {
		cupInteractable.setInteractableModel(cup)
		cupInteractable.scene = hs1Scene
	}
								
	const beamer = scene.getObjectByName('Beamer')
	if(beamer){
		beamerInteractable.setInteractableModel(beamer)
		beamerInteractable.scene = hs1Scene
		// vertically below the beamer, so we can interact from the ground
		beamerInteractable.position = new THREE.Vector3(-7.065151656086955, 3.1155215629228477, -35.33847308541997)
	}
	const abbeanumInfoBoard = scene.getObjectByName('64Tafel')
	if(beamer){
		beamerInteractable.setInteractableModel(abbeanumInfoBoard)
		beamerInteractable.scene = outsideScene
	}

	const tvCuboid = scene.getObjectByName('TvCuboid')
	if(tvCuboid){
		tvCuboidInteractable.setInteractableModel(tvCuboid)
		tvCuboidInteractable.scene = flurScene
	}

	const HS2DoorDummy = scene.getObjectByName('HS2DoorDummy')
	if(HS2DoorDummy){
		HS2DoorDummyInteractable.setInteractableModel(HS2DoorDummy)
		HS2DoorDummyInteractable.scene = flurScene
	}

	const preproomDoorDummy = scene.getObjectByName('PreproomDoorDummy')
	if(preproomDoorDummy){
		preproomDoorDummyInteractable.setInteractableModel(HS2DoorDummy)
		preproomDoorDummyInteractable.scene = flurScene
	}


	const bathroomDoorDummyBasement = scene.getObjectByName('BathroomDoorDummyBasement')
	if(bathroomDoorDummyBasement){
		bathroomDoorDummyBasementInteractable.setInteractableModel(bathroomDoorDummyBasement)
		bathroomDoorDummyBasementInteractable.scene = flurScene
	}

	
	const bathroomDoorDummyUpstairs = scene.getObjectByName('BathroomDoorDummyUpstairs')
	if(bathroomDoorDummyUpstairs){
		bathroomDoorDummyUpstairsInteractable.setInteractableModel(bathroomDoorDummyUpstairs)
		bathroomDoorDummyUpstairsInteractable.scene = flurScene
	}
	const coffeeMachine = scene.getObjectByName('CoffeeMachine')
	if(coffeeMachine){
		coffeeMachineInteractable.setInteractableModel(coffeeMachine)
		coffeeMachineInteractable.scene = flurScene
	}

	const dumpsterGreen = scene.getObjectByName('DumpsterGreen')

	const interactables = window.interactables = [abbeanumDoorEntranceInteractable, abbeanumDoorExitInteractable, 
							hs1DoorEntranceInteractable, hs1DoorExitInteractable, 
						 	laptopInteractable, stickInteractable,
							trashcanInteractable, laptop2Interactable, blackboardsInteractable, cupInteractable,
							beamerInteractable, tvCuboidInteractable, HS2DoorDummyInteractable,
							preproomDoorDummyInteractable, bathroomDoorDummyBasementInteractable,
							bathroomDoorDummyUpstairsInteractable, abbeanumInfoBoardInteractable,
							coffeeMachineInteractable]
							.filter(interactable => interactable.interactableModel)


	// set to city center so it's less likely someone notices when accidentally pressing one of the buttons :D
	debuggedObject = window.debuggedObject = dumpsterGreen 

	acceleration.set(0,0,0)
	var dtx = clamp(dt * 10, 0, 1) // the lower this number is, the smoother is the motion
	
	/**
	 * Helper function for updating the camera controls in the animation loop.
	 */
	handleKeyBoardMovementInteractionsInteraction(acceleration, debuggedObject, user, dt)

	// ---------------------------------------------- INTERACTION CHECKERS -------------------------------------------------
	// we are only looking for all interactable objects in our interactable array
	// we will choose the closest for interaction.
	// if that does not work, it might have to be changed to the closest one that we look at.
	/////ADD A FILTER TO CHECK WHETHER 'currentInteractables[i].interactableModel.name' is already in 'inInventory' array //////
	const currentInteractables = window.currentInteractables = interactables.filter(interactable => 
							 interactable != undefined && interactable.canInteract(scene, camera, lastInteractionTime))
	const sparkleTargets = currentInteractables.map(o => o.interactableModel.position)
	//calculate box sizes of the interactables, so we can decide on which area the particles can spawn
	var box = new THREE.Box3()
	const sparkleTarget = currentInteractables.map(o=> box=new  THREE.Box3().setFromObject(o.interactableModel)) 
	var targetSizes=[
		box.max.x - box.min.x,
		box.max.y - box.min.y,
		box.max.z - box.min.z];
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
	) {	
		// sort interactables, such that the closest element will be interacted with
		currentInteractables.sort((e1,e2) => {
			if(camera.position.distanceTo(e1.position) > camera.position.distanceTo(e2.position)){
				return +1
			} else{
				return -1
			}
		})
		
		currentInteractables[0].interact(scene, camera)
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
	
	checkCollision(velocity, user, keyWasPressed, jumpTime, dt)
	
	jumpTime += dt
	
	updateSparkles(scene, camera, targetSizes, sparkleTargets, time, dt)

	/*To do:
	Find out how to completely disable keyboard input during voice lines*/

	////////////////////////
	/// MISSION TEXT BOX ///
	///////////////////////
	if(scene == flurScene && story == 0){
		missionText.innerHTML = "Gehe zum Hörsaal 1"
		story = 1
	}
	if(scene == hs1Scene && story == 1){
		missionText.innerHTML = "Gehe zum Beameranschluss bei der Tafel"
		story = 1
	}

	/////////////////////////////
	/////MOUSE INTERACTIONS//////
	////////////////////////////
	if(wasClicked == true){
		if(abbeanumDoorEntrance) abbeanumDoorEntrance.visible = true

		mousecaster.setFromCamera( mouse, camera );

		//////Array of clickable objects
		const clickableObjects = (
			scene == outsideScene ? [abbeanumDoorEntrance] :
			scene == flurScene ? [abbeanumDoorExit, trashcan, , hs1DoorEntrance] :
			scene == hs1Scene ? [hs1DoorExit, laptop, stick, laptop2, blackboards, cup, beamer] :
			[]
		).filter(model => !!model)

		const mouseIntersects = mousecaster.intersectObjects(clickableObjects);
		for ( let i = 0; i < mouseIntersects.length; i ++ ) {
		
			//mainly needed for debugging
			if(clickableObjects != undefined && clickableObjects.length > 0){
				clickableObjects.sort((e1,e2) => {
					if(camera.position.distanceTo(e1.position) > camera.position.distanceTo(e2.position)){
						return +1
					} else {
						return -1
					}
				})
				//console.log('Using: ', currentInteractables[0].interactableModel.name) //another way of adressing
				currentInteractables[0].interact(scene, camera)
			}
		}

		/*Just checks one object
		const mouseIntersects = mousecaster.intersectObject(abbeanumDoor);
		if(mouseIntersects.length>0){
			console.log('clicked on object')
		}*/
	
		if(abbeanumDoorEntrance) abbeanumDoorEntrance.visible = false;
		wasClicked = false
	}
	
	keyWasPressed = false
	
}


//prints everything in inventory-array to inventory-textbox
function printInventory(){
	inventory.innerHTML = inInventory.join("<br/>")
}

export { createInteractions, handleInteractions, inInventory, printInventory }
