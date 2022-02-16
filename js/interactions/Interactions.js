
import * as THREE from 'https://cdn.skypack.dev/three@0.135.0'
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.135.0/examples/jsm/controls/OrbitControls.js'
import { VRButton } from 'https://cdn.skypack.dev/three@0.135.0/examples/jsm/webxr/VRButton.js'

import { clamp, degToRad } from '../Maths.js'
import { audio, audioStory, isPlaying, playAudioTrack, playStoryTrack, stopAudioTrack } from '../UserInterface.js'
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

//boolean for raycasting check
let wasClicked = false
//boolean for inventory
let inventoryOpen = false
//boolean overlay
let overlayActive = false

///COUNTER FOR STORY (we'll see if it works that way or if it's to simple) /////
let story = 0
let once = 0
//array für alle modelle die wir einsammeln
const inInventory = ["Handy", "USB Stick"]
inventory.innerHTML += "Handy <br> USB Stick"

//overlay//
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


// the user
// block user for cutscenes 
let user = { height: 1.7, eyeHeight: 1.6, speed: 1.3, turnSpeed: 0.03, insideSpeed: 0.7, outsideSpeed: 1.3, isIntersecting: false, }
//const distanceToWalls = 1
let lastInteractionTime = Date.now()

var keyWasPressed = false

const jumpDuration = Constants.jumpDuration
const jumpHeight = Constants.jumpHeight

var jumpTime = Constants.jumpTime

var lastTimeWWasPressed = 0

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

//DOORS//
const abbeanumDoorEntranceInteractable = 
	new Door(undefined, undefined, CorridorEntryPointFromOutside)

const abbeanumDoorExitInteractable = 
	new Door(undefined, undefined, OutsideEntryPointFromAbbeanum)

const hs1DoorEntranceInteractable =
	new Door(undefined, undefined, HS1EntryPointFromCorridor)

const hs1DoorExitInteractable =
	new Door(undefined, undefined, CorridorEntryPointFromHS1)

//INVENTORY ONBJECTS//
const stickInteractable =
	new InventoryObject(undefined, undefined)

const cupInteractable =
	new InventoryObject(undefined, undefined)

//NOT REALLY NEEDED//
const blackboardsInteractable = 
	new InventoryObject(undefined, undefined)

const trashcanInteractable =
	new InventoryObject(undefined, undefined)

//CUSTOMS//
const laptopInteractable =
	new CustomInteractable(undefined, undefined, () => {
		console.log('laptop1 was clicked')
		if(once == 2){
			playStoryTrack('audio/003_Falscher_Stick.mp3');
			once = 1
			story = 2
		}
		interactables[4].unlocked = false
		inventory.innerHTML = "Handy <br> *falscher* USB Stick"
	})

const laptop2Interactable =
	new CustomInteractable(undefined, undefined, () => {
		console.log('laptopt2 was clicked')
	})

const coffeeMachineInteractable =
	new CustomInteractable(undefined, undefined, () => {
		console.log('coffee machine was clicked')
	})

const beamerInteractable =
	new CustomInteractable(undefined, undefined, () => {
		console.log('beamer was clicked')
	})

const abbeanumInfoBoardInteractable =
	new InfoObject(undefined, undefined)

const tvCuboidInteractable =
	new CustomInteractable(undefined, undefined, () => {
		scene.getObjectByName('AbbeanumInside').getObjectByName('Fernseher_aus').visible = true
		scene.getObjectByName('AbbeanumInside').getObjectByName('Fernseher_an').visible = false
	})

const HS2DoorDummyInteractable =
	new CustomInteractable(undefined, undefined, () => {
		console.log('hs2door was clicked')
		if(story == 3 && isPlaying == false){
			if(once == 2){
				playStoryTrack('audio/creaking-door-2.mp3') //just dummy placeholder
				while(isPlaying == true){
					openText() //opens overlay
				}
				story = 4
				once = 1
			}	
			interactables[11].unlocked = false //locks hs2 door
			inventory.innerHTML = "Handy <br> *falscher* USB Stick "
		}
	})

const preproomDoorDummyInteractable = 
	new CustomInteractable(undefined, undefined, () => {
		console.log('preproom was clicked')
	})


const bathroomDoorDummyBasementInteractable =
	new CustomInteractable(undefined, undefined, () => {
		console.log('bathroom basement was clicked')
	})

const bathroomDoorDummyUpstairsInteractable =
	new CustomInteractable(undefined, undefined, () => {
		console.log('bathroom upstairs was clicked')
	})


function createInteractions(scene, camera, renderer, mouse){

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
			case 'w':
			case 'W':// tap w twice to run
				user.isRunning = event.timeStamp - lastTimeWWasPressed < 300
				break;
			case 's':
			case 'S':
				user.isRunning = false
				break;
			case ' ':// space for jumping
				if(jumpTime <= 0.0 || jumpTime >= jumpDuration * 0.75){
					jumpTime = 0.0
				}
				break;
			case 'z':
			case 'Z':
				// MAI'S DEBUGGING KEY
				console.log('story: ', story) //test where in story we are
				console.log('once: ', once) //teste once variable 
				console.log('isPlaying: ', isPlaying)
				/*if(overlayActive == false){ 
					openText()
				} else {
					closeText()
				}*/
				break;
			case 'h': 
			case 'H':
				// print the current camera position in world coordinates
				// can be used to place objects
				console.log('player')
				console.log(
					camera.position,
					formatNumber(zToLat(camera.position.z), 8) + ", " +
					formatNumber(xToLon(camera.position.x), 8) + ", " +
					formatNumber(yToHeight(camera.position.y), 3)
				);
				if(window.debuggedObject)
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
			case 'Q':
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
			case 'T':
				var message = window.prompt('Message to send:')
				if(message){
					message = message.trim()
					if(message.length > 0){
						sendMultiplayerMessage(message)
					}
				}
				break
			case 'ö':
				story ++
				break
			case 'ä':
				story --
			case 'ü':
				if(once == 1){
					once =2
				}else{
					once = 1 
				}
				break
		}
	}
	
	function keyUp(event){
		keyWasPressed = true
		switch(event.key){
			case 'w':
			case 'W':
				lastTimeWWasPressed = keyboard[event.key]
				break
		}
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

const dumpsterTmpPos = new THREE.Vector3() // temporary variable

// helper functions for the animation loop
function handleInteractions(scene, camera, raycaster, mousecaster, mouse, time, dt, outlinepass = null){
	
	
	// get the models - maybe move to not do this every frame
	//const abbeanum = scene.getObjectByName('Abbeanum')
	const abbeanumInside = scene.getObjectByName('AbbeanumInside')
	const constabbeanumCorridorCollisions = scene.getObjectByName('AbbeanumCorridorCollisions')
	//const abbeanumGround = scene.getObjectByName('AbbeanumGround')
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
		preproomDoorDummyInteractable.setInteractableModel(preproomDoorDummy)
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

	const dumpsterGreen  = scene.getObjectByName('DumpsterGreen')
	const dumpsterBlue   = scene.getObjectByName('DumpsterBlue')
	const dumpsterYellow = scene.getObjectByName('DumpsterYellow')

	const interactables = window.interactables = [abbeanumDoorEntranceInteractable, abbeanumDoorExitInteractable, 
							hs1DoorEntranceInteractable, hs1DoorExitInteractable, 
						 	laptopInteractable, stickInteractable,
							trashcanInteractable, laptop2Interactable, blackboardsInteractable, cupInteractable,
							beamerInteractable, tvCuboidInteractable, HS2DoorDummyInteractable,
							preproomDoorDummyInteractable, bathroomDoorDummyBasementInteractable,
							bathroomDoorDummyUpstairsInteractable, abbeanumInfoBoardInteractable,
							coffeeMachineInteractable]
							.filter(interactable => interactable.interactableModel)	
	acceleration.set(0,0,0)
	var dtx = clamp(dt * 10, 0, 1) // the lower this number is, the smoother is the motion
	
	/**
	 * Helper function for updating the camera controls in the animation loop.
	 */
	handleKeyBoardMovementInteractionsInteraction(acceleration, window.debuggedObject, user, dt)
	
	/* Dumpster interactions ^^ */
	const dumpsters = [dumpsterGreen, dumpsterBlue, dumpsterYellow]
	dumpsters.forEach(dumpster => {// Cube002.parent is the rotatable part of the mesh
		if(dumpster){
			var dist = dumpster.getWorldPosition(dumpsterTmpPos).distanceTo(camera.position)
			dumpster.getObjectByName('Cube002').parent.rotation.set(0, 0, -clamp(3-dist, 0, 1)*15*degToRad)
		}
	})

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
	const sparkleTarget = currentInteractables.map(o => box = new THREE.Box3().setFromObject(o.interactableModel)) 
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
	if(scene == outsideScene && story == 0 && keyWasPressed == true || wasClicked == true){
		if(once == 0){
			playStoryTrack('audio/001_Einleitung_Spawn.mp3')
			once = 1
		}
		//block Abbeanum door?
	}
	if(once == 1 && scene == outsideScene && isPlaying == false){
		missionText.innerHTML = "Gehe ins Abbeanum"
		//unlock abbeanum door?
	}
	if(scene == flurScene && story == 0){
		missionText.innerHTML = "Gehe zum Hörsaal 1"
		story = 1
	}
	if(scene == hs1Scene && story == 1){
		missionText.innerHTML = "Gehe zum Laptop und teste deine Powerpoint"
		if(once == 1){
			//HIER NOCH BILD ÖFFNEN
			playStoryTrack('audio/002_Hier_Laptop.mp3')
			once = 2
		}
		interactables[3].unlocked = false //locks player in hs1
		interactables[4].unlocked = true //unlocks laptop
	}
	if(scene == hs1Scene && story == 2 && isPlaying == false){
		missionText.innerHTML = "Ruf Lisa an"
		document.getElementById("button").classList.add("active")
		button.addEventListener('click', () =>{
			if(once == 1){
				playStoryTrack("audio/004_Telefonat.mp3")
				missionText.innerHTML = ""
				document.getElementById("button").classList.remove("active")
				once = 2
			}
		})
		if(once == 2){
			story = 3
			document.getElementById("button").classList.remove("active")
			interactables[3].unlocked = true //unlocks hs1 exit
		}
	}
	if(story == 3){
		missionText.innerHTML = "Gehe Kai, Henrik und Jan um einen Laptop anflehen"
		interactables[11].unlocked = true
	}
	
	/////////////////////////////
	/////MOUSE INTERACTIONS//////
	////////////////////////////
	if(wasClicked == true){
		if(abbeanumDoorEntrance) abbeanumDoorEntrance.visible = true
		//console.log(interactables[5].unlocked) //just for debugging reasons, do not click outside

		mousecaster.setFromCamera( mouse, camera );

		//////Array of clickable objects
		const clickableObjects = (
			scene == outsideScene ? [abbeanumDoorEntrance, stick] :
			scene == flurScene ? [abbeanumDoorExit, trashcan, hs1DoorEntrance, coffeeMachine, HS2DoorDummy] :
			scene == hs1Scene ? [hs1DoorExit, laptop, laptop2, cup, beamer] :
			[]
		).filter(model => !!model)

		const mouseIntersects = mousecaster.intersectObjects(clickableObjects);
		for ( let i = 0; i < mouseIntersects.length; i ++ ) {
		
			//ordnet clickableObjects
			if(clickableObjects != undefined && clickableObjects.length > 0){
				clickableObjects.sort((e1,e2) => {
					if(camera.position.distanceTo(e1.position) > camera.position.distanceTo(e2.position)){
						return +1
					} else {
						return -1
					}
				})
				if(currentInteractables.length > 0 && clickableObjects[0].name == currentInteractables[0].interactableModel.name){
					currentInteractables[0].interact(scene, camera)
				}else{
					
				}	
			}
		}

		//DEBUGGING
		/*
		if(currentInteractables.length >= 1 && clickableObjects.length > 0){
			console.log('currentInteractables: ', currentInteractables[0].interactableModel.name)
			console.log('clicakable: ', clickableObjects[0].name)
			console.log('all clickable: ', clickableObjects)
			
		}*/
		

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
