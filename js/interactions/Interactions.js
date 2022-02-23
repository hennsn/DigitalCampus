import * as THREE from 'https://cdn.skypack.dev/three@0.135.0'

import {clamp, degToRad} from '../Maths.js'
import {isPlaying, playAudioTrack, playStoryTrack, stopStoryTrack} from '../UserInterface.js'
import {xToLon, yToHeight, zToLat} from '../environment/Coordinates.js'
import {updateSparkles} from '../environment/Sparkles.js'
import {sendMultiplayerMessage} from '../environment/Multiplayer.js'
import {JoyStick} from '../libs/joystick/joy.min-2.js'
import {handleKeyBoardMovementInteractionsInteraction} from './InteractionUtils/MovementInteractions.js'
import {checkCollision} from './InteractionUtils/CollisionCheck.js'
import {Constants} from './Constants.js'
import {once, story, updateOnce, updateStory} from './Story.js'
import {openOnce, quizOpen} from './Quiz.js'
import {
	abbeanumDoorEntranceInteractable,
	abbeanumDoorExitInteractable,
	abbeanumInfoBoardInteractable,
	bathroomDoorDummyBasementInteractable,
	bathroomDoorDummyUpstairsInteractable,
	beamerInteractable,
	blackboardsInteractable,
	coffeeMachineInteractable,
	cupInteractable,
	flyerInteractable,
	hs1DoorEntranceInteractable,
	hs1DoorExitInteractable,
	HS2DoorDummyInteractable,
	infoboardCorridorInteractable,
	infoboardOutside,
	laptop2Interactable,
	laptopInteractable,
	stickInteractable,
	trashcanInteractable,
	tvCuboidInteractable
} from "./InteractableInstances.js";

// the keyboard
const keyboard = window.keyboard = {}

//boolean for raycasting check
let wasClicked = false
//boolean for inventory
let inventoryOpen = false
//boolean for user input
let isBlocked = false
//boolean for picture display
window.infoPictureOpen = false;

//triggers interactions when in range
window.closeEnough = 0

//array für alle modelle die wir einsammeln
let inInventory = ["Handy", "USB Stick"]
inventory.innerHTML += "Handy <br> USB Stick"

// the user
// block user for cutscenes 
let user = { height: 1.7, eyeHeight: 1.6, speed: 1.3, turnSpeed: 0.03, insideSpeed: 0.7, outsideSpeed: 1.3, isIntersecting: false, isBlocked: false } //add let isBlocked to block user input
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

const interactables = [
	abbeanumDoorEntranceInteractable, abbeanumDoorExitInteractable, 
	hs1DoorEntranceInteractable, hs1DoorExitInteractable, 
	laptopInteractable, stickInteractable,
	trashcanInteractable, laptop2Interactable, blackboardsInteractable, cupInteractable,
	beamerInteractable, tvCuboidInteractable, HS2DoorDummyInteractable,
	flyerInteractable, bathroomDoorDummyBasementInteractable,
	bathroomDoorDummyUpstairsInteractable, abbeanumInfoBoardInteractable,
	coffeeMachineInteractable, infoboardCorridorInteractable, infoboardOutside
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
	
	// There are no VR controls, so we don't need a button for it
	// renderer.xr.enabled = true
	// document.body.appendChild(VRButton.createButton(renderer))
	
	camera.position.set(7.2525, 0.9494, -21.7161)
	camera.rotation.set(0, 65 * degToRad, 0)
	
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
			var key = event.key.toLowerCase()
			keyWasPressed = true
			keyboard[key] = event.timeStamp
			keyboard[event.keyCode] = event.timeStamp
			switch(key){
				case 'w':// tap w twice to run
					user.isRunning = event.timeStamp - lastTimeWWasPressed < 300
					lastTimeWWasPressed = event.timeStamp
					break;
				case 's':
					user.isRunning = false
					break;
				case ' ':// space for jumping
					if(jumpTime <= 0.0 || jumpTime >= jumpDuration * 0.75){
						jumpTime = 0.0
					}
					break
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
					if(window.multiplayerIsEnabled){
						var message = window.prompt('Message to send:')
						if(message){
							message = message.trim()
							if(message.length > 0){
								sendMultiplayerMessage(message)
							}
						}
					}
				case 'c':
					// skip audio
					stopStoryTrack()
					break
				// MAI'S DEBUGGING SIDE KEYS
				case 'ö':
					updateStory() //story ++
					break
				case 'ä':
					printInteractables() //story --
					break
				case 'ü':
					updateOnce() //once ++
					break
				case 'z':
					// MAI'S DEBUGGING MAIN KEY
					console.log('story: ', story) //test where in story we are
					console.log('once: ', once) //teste once variable 
					//console.log('isPlaying: ', isPlaying)
					console.log('openOnce: ', openOnce)
					console.log('infoPictureOpen: ', infoPictureOpen)
					//console.log('inventory: ', inInventory)
					//console.log(findElement())
					console.log(closeEnough)
					break
			}
		}
	}
	
	function keyUp(event){
		if(!isBlocked) keyWasPressed = true
		delete keyboard[event.key.toLowerCase()]
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
		if(keyboard.leftMouseButton || keyboard.middleMouseButton || keyboard.rightMouseButton){
			var mouseSpeed = -4 / window.innerHeight
			camera.rotation.y += mouseSpeed * (event.movementX || 0)
			camera.rotation.x += mouseSpeed * (event.movementY || 0)
			clampCameraRotation()
		}
	}, false )
	
	var mouseButtonNames = ['leftMouseButton', 'middleMouseButton', 'rightMouseButton']
	
	// event listener mouse click
	window.addEventListener('mousedown', (event) => {
		if(event.button == 0) wasClicked = true // left mouse button only
		mouse.x =   ( event.clientX / window.innerWidth  ) * 2 - 1
		mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1
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
const beamerInteractionPosition = new THREE.Vector3(-7.07, 3.12, -35.34)

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
	if((keyboard.e || keyboard.enter) && 
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
	
	// apply velocity on position as far as reasonably possible
	checkCollision(velocity, user, keyWasPressed, jumpTime, dt)
	
	// progress jump forward in time
	jumpTime += dt
	
	updateSparkles(scene, camera, targetSizes, sparkleTargets, time, dt)
	
	// AUTOMATICALLY CLOSE PICTURE WHEN WALKING AWAY
	if(infoPictureOpen){
		const infoboard1 = infoboardCorridorInteractable.interactableModel
		const infoboard2 = infoboardOutside.interactableModel
		const distance = Math.min(
			infoboard1 && infoboard1.position ? camera.position.distanceTo(infoboard1.position) : 0,
			infoboard2 && infoboard2.position ? camera.position.distanceTo(infoboard2.position) : 0
		)
		if(distance > 2){
			close_image('leImage')
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
	document.getElementById("inventory").style.visibility = 'hidden'
	inventoryOpen = false
}

//Bildanzeige (derzeit über p)
function display_image(src) {
	infoPictureOpen = true
	document.getElementById("infoPicture").style.visibility = 'visible'
	var a = document.createElement("img")
	a.src = src
	a.id = 'leImage'
	a.style.margin = "0 auto"
	a.style.height = "calc(100vh - 100px)"
	document.getElementById("dispImage").appendChild(a)
}
function close_image(imgID){
	infoPictureOpen = false
	document.getElementById("infoPicture").style.visibility = 'hidden'
	var imgID = imgID
	var b = document.getElementById(imgID)
	b.parentNode.removeChild(b)
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


export { createInteractions, handleInteractions, inInventory, printInventory, hideInventory, interactables, keyWasPressed, wasClicked, blockUserInput, allowUserInput, findElement, lockElement, unlockElement, display_image, close_image }
