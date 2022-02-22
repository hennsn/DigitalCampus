
import * as THREE from 'https://cdn.skypack.dev/three@0.135.0'
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.135.0/examples/jsm/controls/OrbitControls.js'
import { VRButton } from 'https://cdn.skypack.dev/three@0.135.0/examples/jsm/webxr/VRButton.js'

import { clamp, degToRad } from '../Maths.js'
import { audio, audioStory, isPlaying, playAudioTrack, playStoryTrack, stopStoryTrack, queueAudioEvent, doNow } from '../UserInterface.js'
import { xToLon, yToHeight, zToLat } from '../environment/Coordinates.js'
import { updateSparkles } from '../environment/Sparkles.js'
import { Door, InventoryObject, InfoObject, CustomInteractable } from './Interactable.js'
import { sendMultiplayerMessage } from '../environment/Multiplayer.js'
import { JoyStick } from '../libs/joystick/joy.min-2.js'
import { handleKeyBoardMovementInteractionsInteraction } from './InteractionUtils/MovementInteractions.js'
import { checkCollision } from './InteractionUtils/CollisionCheck.js'
import { Constants } from './Constants.js'
import {story, once, openText, closeText, overlayActive, updateStory, updateOnce} from './Story.js'
import {openOnce, quizOpen, openOnce_True, openOnce_False, quizOpen_True, quizOpen_False} from './Quiz.js'

// the keyboard
const keyboard = window.keyboard = {}

//boolean for raycasting check
let wasClicked = false
//boolean for inventory
let inventoryOpen = false
//boolean for user input
let isBlocked = false
//boolean for picture display
let infoPictureOpen = false;

//triggers interactions when in range
let closeEnough = 0

//array für alle modelle die wir einsammeln
let inInventory = ["Handy", "USB Stick"]
inventory.innerHTML += "Handy <br> USB Stick"

// the user
// block user for cutscenes 
let user = { height: 1.7, eyeHeight: 1.6, speed: 1.3, turnSpeed: 0.03, insideSpeed: 0.7, outsideSpeed: 1.3, isIntersecting: false, isBlocked: false} //add let isBlocked to block user input
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

// Doors
const abbeanumDoorEntranceInteractable = new Door('AbbeanumDoorEntrance', 'flurScene', CorridorEntryPointFromOutside)
const abbeanumDoorExitInteractable = new Door('AbbeanumDoorExit', 'outsideScene', OutsideEntryPointFromAbbeanum)
const hs1DoorEntranceInteractable = new Door('HS1DoorEntrance', 'hs1Scene', HS1EntryPointFromCorridor)
const hs1DoorExitInteractable = new Door('HS1DoorExit', 'flurScene', CorridorEntryPointFromHS1)

// Inventory Objects
const stickInteractable = new InventoryObject('Stock')
const cupInteractable = new InventoryObject('Kaffeetasse')

// NOT REALLY NEEDED
const blackboardsInteractable = new InventoryObject('Blackboards')

// Custom Objects
const trashcanInteractable = new CustomInteractable('Trashcan', () => {
	if(inInventory.includes("altes VGA Kabel")){
		inInventory = inInventory.filter(e => e !== 'altes VGA Kabel');
		printInventory()
		lockElement("Trashcan")
	}
})

const laptopInteractable = new CustomInteractable('Laptop', () => {
	console.log('laptop1 was clicked')
	if(once == 2){
		updateOnce() //once to 3
		updateStory() //story to 2
		lockElement("Laptop")
		lockElement("HS1DoorExit")
		playStoryTrack('audio/003_Falscher_Stick.mp3')//('audio/springTestSound.wav')
		blockUserInput()
		setTimeout(openText, 18000)
		setTimeout(closeText, 34000)
	} else if(story == 4 && once == 5){
		updateOnce() //to 6
		updateStory() //to 5
		inInventory.pop()
		printInventory()
		// laptop tausch:
		hs1Scene.getObjectByName("Laptop2").visible = true
		hs1Scene.getObjectByName("Laptop").visible = false
		playStoryTrack('audio/006_Kein_HDMI.mp3')//('audio/springTestSound.wav')
		lockElement("Laptop")
		if(!inInventory.includes('altes VGA Kabel')){
			inInventory.push('altes VGA Kabel')
			unlockElement("Trashcan")
		}
		printInventory()
	}
})

const laptop2Interactable = new CustomInteractable('Laptop2', () => {
	console.log('laptopt2 was clicked')
	if(once == 11 && story == 7){
		updateOnce() //to 12
		inInventory.pop()
		printInventory()
		lockElement("Laptop2")
		lockElement("HS1DoorExit")
		playStoryTrack('audio/011_Physische_Intervention_Geplant.mp3')
		missionText.innerHTML = "Sei entrüstet"
		setTimeout(function(){
			unlockElement("HS1DoorExit")
			unlockElement("Stock")
			missionText.innerHTML = "Finde einen Stock"
		}, 17000)
	}
})

const coffeeMachineInteractable = new CustomInteractable('CoffeeMachine', () => {
	console.log('coffee machine was clicked')
	if(once == 8){
		updateOnce() //to 9
		updateStory() //to 7
		blockUserInput()
		inInventory.pop()
		printInventory()
		lockElement("CoffeeMachine")
		playStoryTrack('audio/009_Zu_Viel_Kaffee.mp3')
		unlockElement("BathroomDoorDummyBasement")
		unlockElement("BathroomDoorDummyUpstairs")
		setTimeout(function(){
			allowUserInput()
			missionText.innerHTML = "Finde die Toiletten - und zwar schnell!"
		}, 12000)
	}
})

const beamerInteractable = new CustomInteractable('Beamer', () => {
		console.log('beamer was clicked')
		if(once == 13 && story == 7){
			updateOnce() //to 14
			updateStory() //to 8
			lockElement("Beamer")
			blockUserInput()
			playStoryTrack('audio/013_Verfehlt.mp3')
			setTimeout(function(){
				allowUserInput()
				unlockElement("Beamer")
				missionText.innerHTML = "Mach ihn fertig!"
			}, 3000)
		} else if(once == 14 && story == 8 && !isPlaying){
			updateOnce() //to 15
			lockElement("Beamer")
			blockUserInput()
			playStoryTrack('audio/014_Clonk_Beamer.mp3')
			inInventory.pop()
			printInventory()
			setTimeout(function(){
				allowUserInput()
				missionText.innerHTML = "Geschafft - nimm deinen rechtmäßigen Platz am Pult ein"
			}, 3000)
		}
	})

const abbeanumInfoBoardInteractable = new CustomInteractable('AbbeanumInfoBoard', () => {
	if(closeEnough == 0 && !isPlaying && once == 1){
		closeEnough = 1
		playStoryTrack('audio/018_Geschichte_Abb.mp3')
		setTimeout(function(){
			unlock("AbbeanumDoorEntrance")
		}, 1500)
	}
})

const tvCuboidInteractable = new CustomInteractable('TvCuboid', () => {
	if(once == 6 && !isPlaying){
		lockElement("TvCuboid")
		blockUserInput()
		updateOnce() //to 7
		updateStory() //to 6
		playStoryTrack('audio/007_Kabel_Gefunden_kaffee.mp3')
		setTimeout(function(){
			scene.getObjectByName('AbbeanumInside').getObjectByName('Fernseher_aus').visible = true
			scene.getObjectByName('AbbeanumInside').getObjectByName('Fernseher_an').visible = false
			if(!inInventory.includes('brandneues HDMI-Kabel')){
				inInventory.push('brandneues HDMI-Kabel')
			}
			missionText.innerHTML = "Schnell weg - du warst nie hier!"
			printInventory()
		}, 5000)
		setTimeout(allowUserInput, 5500)
	}
})

const HS2DoorDummyInteractable = new CustomInteractable('HS2DoorDummy', () => {
	console.log('hs2door was clicked')
	if(story == 3 && !isPlaying){
		lockElement("HS2DoorDummy")
		if(once == 4){
			updateOnce() //to 5
			updateStory() //to 4
			playStoryTrack('audio/creaking-door-2.mp3') //just dummy placeholder
			openText() //should stop input at some point
		}	
	}
})

const bathroomDoorDummyBasementInteractable = new CustomInteractable('BathroomDoorDummyBasement', () => {
	console.log('bathroom basement was clicked')
	if((once == 10 || once == 9) && story == 7){
		if(once == 9) updateOnce() //to 10
		updateOnce() //to 11
		openText()
		lockElement("BathroomDoorDummyBasement")
		lockElement("BathroomDoorDummyUpstairs")
		unlockElement("Laptop2")
		playStoryTrack('audio/010_Toilettengang.mp3')
		missionText.innerHTML = ""
		setTimeout(function(){
			missionText.innerHTML = "Beweise deine Informatik Kenntnisse: Schließ das HDMI-Kabel an!"
			closeText()
		}, 12000)
	}
})

const bathroomDoorDummyUpstairsInteractable = new CustomInteractable('BathroomDoorDummyUpstairs', () => {
	console.log('bathroom upstairs was clicked')
	if(once == 9 && story == 7){
		updateOnce() //to 10
		lockElement("BathroomDoorDummyUpstairs")
		playStoryTrack('audio/springTestSound.wav')
		setTimeout(function(){
			missionText.innerHTML = "DIE RICHTIGEN TOILETTEN"
		}, 2000)
	}
})

const flyerInteractable = new CustomInteractable('Flyer', () => {
	console.log(quizOpen)
	if(openOnce == false){
		openOnce_True()
		if(quizOpen == false){
			document.getElementById("abbeanum-quiz").style.visibility = 'visible';
			quizOpen_True()
			lockElement("Flyer")
			if(openOnce == true) blockUserInput()
		} else {
			document.getElementById("abbeanum-quiz").style.visibility = 'hidden';
			quizOpen_False()
		}
	}
})

const infoboardCorridorInteractable = new CustomInteractable('InfoboardCorridor', () => {
	if(!openOnce){
		openOnce_True() // allows picture to open for the first time
		if(infoPictureOpen){
			close_image('leImage');
			setTimeout(openOnce_False, 200) // allows picture to open again
		} else {
			display_image('images/history.jpg'); // image height relates to browser-window height
			setTimeout(openOnce_False, 200) //allows picture to close
		}
	}
})

const interactables = [
	abbeanumDoorEntranceInteractable, abbeanumDoorExitInteractable, 
	hs1DoorEntranceInteractable, hs1DoorExitInteractable, 
	laptopInteractable, stickInteractable,
	trashcanInteractable, laptop2Interactable, blackboardsInteractable, cupInteractable,
	beamerInteractable, tvCuboidInteractable, HS2DoorDummyInteractable,
	flyerInteractable, bathroomDoorDummyBasementInteractable,
	bathroomDoorDummyUpstairsInteractable, abbeanumInfoBoardInteractable,
	coffeeMachineInteractable, infoboardCorridorInteractable
]

window.interactables = interactables

function unlockElement(name){
	findElement(name).unlocked = true
}

function lockElement(name){
	findElement(name).unlocked = false
}

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
		if(!isBlocked){
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
					// MAI'S DEBUGGING MAIN KEY
					console.log('story: ', story) //test where in story we are
					console.log('once: ', once) //teste once variable 
					//console.log('isPlaying: ', isPlaying)
					console.log('openOnce: ', openOnce)
					console.log('infoPictureOpen: ', infoPictureOpen)
					//console.log('inventory: ', inInventory)
					//console.log(findElement())
					console.log(closeEnough)
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
				//MAI'S DEBUGGING SIDE KEYS
				case 'ö':
					updateStory() //story ++
					break
				case 'ä':
					printInteractables()//story --
					break
				case 'ü':
					updateOnce() //once ++
					break
				
				//display picture (vorerst hierüber)
				case 'p':
					if(infoPictureOpen == false){
						document.getElementById("infoPicture").style.visibility = 'visible';
						display_image('images/history.jpg'); // image height relates to browser-window height
						infoPictureOpen = true;
					}else{
						document.getElementById("infoPicture").style.visibility = 'hidden';
						close_image('leImage');
						infoPictureOpen = false;
					}
					break;

				case '.':	// display Abbeanum-Quiz (vorerst hierüber)
					if(quizOpen == false){
						document.getElementById("abbeanum-quiz").style.visibility = 'visible';
						quizOpen = true;
					}else{
						document.getElementById("abbeanum-quiz").style.visibility = 'hidden';
						quizOpen = false;
					}
					break;
			}
		}
	}
	
	function keyUp(event){
		if(!isBlocked) keyWasPressed = true
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
const beamerInteractionPosition = new THREE.Vector3(-7.065151656086955, 3.1155215629228477, -35.33847308541997)

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
	
	interactables.forEach(interactable => {
		if(interactable.name && !interactable.interactableModel){
			const model = scene.getObjectByName(interactable.name)
			if(model){
				interactable.setInteractableModel(model, scene)
			}
		}
	})
	
	var abbeanumDoorEntrance = abbeanumDoorEntranceInteractable.interactableModel
	
	// vertically below the beamer, so we can interact from the ground
	beamerInteractable.position = beamerInteractionPosition
	
	const dumpsterGreen  = scene.getObjectByName('DumpsterGreen')
	const dumpsterBlue   = scene.getObjectByName('DumpsterBlue')
	const dumpsterYellow = scene.getObjectByName('DumpsterYellow')
	const bathroomM = scene.getObjectByName('BathroomM')

	/**
	 * Helper function for updating the camera controls in the animation loop.
	 */
	acceleration.set(0,0,0)
	handleKeyBoardMovementInteractionsInteraction(acceleration, window.debuggedObject, user, dt)
	
	/* Dumpster interactions ^^ */
	const dumpsters = [dumpsterGreen, dumpsterBlue, dumpsterYellow]
	dumpsters.forEach(dumpster => {// Cube002.parent is the rotatable part of the mesh
		if(dumpster){
			var dist = dumpster.getWorldPosition(dumpsterTmpPos).distanceTo(camera.position)
			dumpster.getObjectByName('Cube002').parent.rotation.set(0, 0, -clamp(3-dist, 0, 1)*15*degToRad)
		}
	})
	
	var dtx = clamp(dt * 10, 0, 1) // the lower this number is, the smoother is the motion

	// ---------------------------------------------- INTERACTION CHECKERS -------------------------------------------------
	// we are only looking for all interactable objects in our interactable array
	// we will choose the closest for interaction.
	// if that does not work, it might have to be changed to the closest one that we look at.
	/////ADD A FILTER TO CHECK WHETHER 'currentInteractables[i].interactableModel.name' is already in 'inInventory' array //////
	const currentInteractables = window.currentInteractables = interactables.filter(interactable => !!interactable && interactable.interactableModel && interactable.canInteract(scene, camera, lastInteractionTime))
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
		controlHints.innerHTML = canInteract ? 'WASD laufen<br>LEFT/RIGHT drehen<br>Q Inventar<br>E interagieren' : 'WASD walk<br>LEFT/RIGHT turn<br>Q Inventar'
		//play the abbeanumInfoboard audio
		if(closeEnough == 0 && !isPlaying && once == 1){
			closeEnough = 1
			playStoryTrack('audio/018_Geschichte_Abb.mp3')
			unlockElement("AbbeanumDoorEntrance")
		} 
	}
	
	// check for key-presses, which try to interact
	if((keyboard.e || keyboard.E || keyboard.Enter) && 
		keyWasPressed && !isBlocked &&
		currentInteractables &&
		currentInteractables.length > 0
	) keyPressInteract(camera, currentInteractables)
	
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
	
	//AUTOMATICALLY CLOSE PICTURE WHEN WALKING AWAY
	if(infoPictureOpen){
		const infoboardCorridor = infoboardCorridorInteractable.interactableModel
		const distance = camera.position.distanceTo(infoboardCorridor.position)
		if(distance > 2){
			close_image('leImage')
			//console.log('TOO FAR')
		}
	}
	
	//////////////////////////////
	///// MOUSE INTERACTIONS /////
	//////////////////////////////
	if(wasClicked && !isBlocked){
		if(abbeanumDoorEntrance) abbeanumDoorEntrance.visible = true

		mousecaster.setFromCamera(mouse, camera)
		
		const mouseIntersects = mousecaster.intersectObjects(currentInteractables.map(ci => ci.interactableModel))
		rayInteract(mouseIntersects)
	
		if(abbeanumDoorEntrance) abbeanumDoorEntrance.visible = false;
		
	}
	
	wasClicked = false
	keyWasPressed = false
	
}

// find object in interactables array we are looking for
function findElement(lookingFor){
	const index = interactables.findIndex(interactable => interactable.name == lookingFor || (interactable.interactableModel && interactable.interactableModel.name == name))
	return interactables[index]
}

//prints everything in inventory-array to inventory-textbox
function printInventory(){
	inventory.innerHTML = inInventory.join("<br/>")
}
function printInteractables(){
	for(let i=0; i<interactables.length; i++){
		console.log(interactables[i].name)
	}
	console.log(interactables)
}
//functions to toggle user input
function blockUserInput(){
	isBlocked = true
	controlHints.style.visibility = 'hidden'
}
function allowUserInput(){
	isBlocked = false
	controlHints.style.visibility = 'visible'
}


//hide inventory
function hideInventory(){
	document.getElementById("inventory").style.visibility = 'hidden';
	inventoryOpen = false
}

//Bildanzeige (derzeit über p)
function display_image(src) {
	infoPictureOpen = true
	document.getElementById("infoPicture").style.visibility = 'visible'; //new
	var a = document.createElement("img");
	a.src = src;
	//a.width = width;
	a.height = window.innerHeight-100;
	a.id = 'leImage';
	a.style.margin = "0 auto";
	document.getElementById("dispImage").appendChild(a);  
}
function close_image(imgID){
	infoPictureOpen = false
	document.getElementById("infoPicture").style.visibility = 'hidden'; //new
	var imgID = imgID;
	var b = document.getElementById(imgID);
	b.parentNode.removeChild(b);
}

// temporary variables
const interactTmp1 = new THREE.Vector3() 
const interactTmp2 = new THREE.Vector3()

// key presses only give a guess on what should be interacted with,
// so we choose the closest available object, which matches the current
// view direction the best
function keyPressInteract(camera, currentInteractables){
	const maxDistance = 5
	const cameraDirection = interactTmp1
	const objectDirection = interactTmp2
	// find out the camera direction
	cameraDirection.set(0,0,1)
	cameraDirection.transformDirection(camera.matrixWorld)
	// find the best match
	var best = null
	var bestScore = 1e300
	for(var i=0;i<currentInteractables.length;i++){
		const ci = currentInteractables[i]
		objectDirection.copy(camera.position).sub(ci.position)
		const dot = objectDirection.dot(cameraDirection)
		if(dot > 0){
			// proportional to length, and inversely proportional to the direction
			const score = objectDirection.lengthSq() / dot
			if(score < bestScore){
				best = ci
				bestScore = score
			}
		}
	}
	if(best) best.interact(scene, camera)
}

function rayInteract(rayIntersects){
	// just use the closest one;
	// the list is already sorted by Three.js
	if(rayIntersects.length > 0){
		// search trough hierarchy for first interactable
		var mesh = rayIntersects[0].object
		while(mesh){
			if(mesh.userData && mesh.userData.interact){
				mesh.userData.interact(scene, camera)
				return
			} else mesh = mesh.parent
		}
	}
}


export { createInteractions, handleInteractions, inInventory, printInventory, hideInventory, interactables, keyWasPressed, wasClicked, blockUserInput, allowUserInput, findElement, lockElement, unlockElement }
