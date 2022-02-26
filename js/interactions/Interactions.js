import * as THREE from 'https://cdn.skypack.dev/three@0.135.0'

import {clamp, degToRad} from '../Maths.js'
import {isPlaying, playStoryTrack, stopStoryTrack} from '../UserInterface.js'
import {xToLon, yToHeight, zToLat, latLonToXYZ} from '../environment/Coordinates.js'
import {updateSparkles} from '../environment/Sparkles.js'
import {handleKeyBoardMovementInteractionsInteraction} from './InteractionUtils/MovementInteractions.js'
import {checkCollision} from './InteractionUtils/CollisionCheck.js'
import {Constants} from './Constants.js'
import {
	abbeanumDoorEntranceInteractable,
	abbeanumDoorExitInteractable,
	abbeanumInfoBoardInteractable,
	bathroomDoorDummyBasementInteractable,
	bathroomDoorDummyUpstairsInteractable,
	beamerInteractable,
	//unused
	//blackboardsInteractable,
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
import {close_image, findElement} from "./InteractionUtils/AuxiliaryFunctions.js";

// the keyboard
const keyboard = window.keyboard = {}


//boolean for inventory
//export let inventoryOpen = false
//boolean for user input
//export let isBlocked = false
//boolean for picture display
window.infoPictureOpen = false;

//triggers interactions when in range
window.closeEnough = 0

//array für alle modelle die wir einsammeln
let inInventory = ["Handy", "USB Stick"]
inventory.innerHTML += "Handy <br> USB Stick"

// the user
// block user for cutscenes 
export let user = { height: 1.7, eyeHeight: 1.6, speed: 1.3, turnSpeed: 0.03, insideSpeed: 0.7, outsideSpeed: 1.3, isIntersecting: false, isBlocked: false } //add let isBlocked to block user input
//const distanceToWalls = 1
let lastInteractionTime = Date.now()

export let changableInteractionState = {
	keyWasPressed: false,
	//boolean for raycasting check
	wasClicked: false,
	jumpTime: Constants.jumpTime,
	keyboard: keyboard,
	isBlocked: false,
	inventoryOpen: false
}

//export const changeKeyPressed = newValue => keyWasPressed = newValue;





const interactables = [
	abbeanumDoorEntranceInteractable, abbeanumDoorExitInteractable, 
	hs1DoorEntranceInteractable, hs1DoorExitInteractable, 
	laptopInteractable, stickInteractable,
	trashcanInteractable, laptop2Interactable, cupInteractable, //blackboardsInteractable, unused
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

//CUSTOMS//
/*const trashcanInteractable =
	new CustomInteractable(undefined, undefined, () => {
		if(inInventory.includes("altes VGA Kabel")){
			playAudioTrack('audio/020_VGA_Wegwerfen.mp3')
			inInventory = inInventory.filter(e => e !== 'altes VGA Kabel');
			printInventory()
			interactables[findElement("Trashcan")].unlocked = false
		}
	})

const laptopInteractable =
	new CustomInteractable(undefined, undefined, () => {
		console.log('laptop1 was clicked')
		if(once == 2){
			updateOnce() //once to 3
			updateStory() //story to 2
			interactables[findElement("Laptop")].unlocked = false
			interactables[findElement("HS1DoorExit")].unlocked = false  
			playStoryTrack('audio/003_Falscher_Stick.mp3')
			blockUserInput()
			setTimeout(function(){
				openText()
				display_image('images/wrongUsb.png')
			}, 18000)
			setTimeout(function(){
				closeText()
				close_image('leImage')
			}, 34000)
		}
		if(story == 4 && once == 5){
			updateOnce() //to 6
			updateStory() //to 5
			inInventory.pop()
			printInventory()
			//laptop tausch:
			hs1Scene.getObjectByName("Laptop2").visible = true
			hs1Scene.getObjectByName("Laptop").visible = false
			playStoryTrack('audio/006_Kein_HDMI.mp3')//('audio/springTestSound.wav')
			interactables[findElement("Laptop")].unlocked = false 
			if(!inInventory.includes('altes VGA Kabel')){
				inInventory.push('altes VGA Kabel')
				interactables[findElement("Trashcan")].unlocked = true
			}
			printInventory()
		}
	})

const laptop2Interactable =
	new CustomInteractable(undefined, undefined, () => {
		console.log('laptopt2 was clicked')
		if(once == 11 && story == 7){
			updateOnce() //to 12
			inInventory.pop()
			printInventory()
			interactables[findElement("Laptop2")].unlocked = false 
			interactables[findElement("HS1DoorExit")].unlocked = false 
			playStoryTrack('audio/011_Physische_Intervention_Geplant.mp3')
			missionText.innerHTML = "Sei entrüstet"
			setTimeout(function(){
				interactables[findElement("HS1DoorExit")].unlocked = true 
				interactables[findElement("Stock")].unlocked = true 
				missionText.innerHTML = "Finde einen Stock"
			}, 17000)
		}
	})

const coffeeMachineInteractable =
	new CustomInteractable(undefined, undefined, () => {
		console.log('coffee machine was clicked')
		if(once==8){
			updateOnce() //to 9
			updateStory() //to 7
			blockUserInput()
			inInventory.pop()
			printInventory()
			interactables[findElement("CoffeeMachine")].unlocked = false
			playStoryTrack('audio/009_Zu_Viel_Kaffee.mp3')
			interactables[findElement("BathroomDoorDummyBasement")].unlocked = true 
			interactables[findElement("BathroomDoorDummyUpstairs")].unlocked = true 
			setTimeout(function(){
				allowUserInput()
				missionText.innerHTML = "Finde die Toiletten - und zwar schnell!"
			}, 12000)
		}
	})

const beamerInteractable =
	new CustomInteractable(undefined, undefined, () => {
		console.log('beamer was clicked')
		if(once == 13 && story == 7){
			updateOnce() //to 14
			updateStory() //to 8
			interactables[findElement("Beamer")].unlocked = false 
			blockUserInput()
			playStoryTrack('audio/013_Verfehlt.mp3')
			setTimeout(function(){
				allowUserInput()
				interactables[findElement("Beamer")].unlocked = true 
				missionText.innerHTML = "Mach ihn fertig!"
			}, 3000)
		}
		if(once == 14 && story == 8 && isPlaying == false){
			updateOnce() //to 15
			interactables[findElement("Beamer")].unlocked = false 
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

const abbeanumInfoBoardInteractable =
	new CustomInteractable(undefined, undefined, () => {
		if(closeEnough == 0 && isPlaying == false && once == 1){
			closeEnough = 1
			playStoryTrack('audio/018_Geschichte_Abb.mp3')
			setTimeout(function(){
				interactables[findElement("AbbeanumDoorEntrance")].unlocked = true
			}, 1500)
        }
	})

const tvCuboidInteractable =
	new CustomInteractable(undefined, undefined, () => {
		if(once == 6 && isPlaying == false){
			interactables[findElement("TvCuboid")].unlocked = false 
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
			setTimeout(function(){
				allowUserInput()
			}, 5500)
		}
	})

const HS2DoorDummyInteractable =
	new CustomInteractable(undefined, undefined, () => {
		console.log('hs2door was clicked')
		if(story == 3 && isPlaying == false){
			interactables[findElement("HS2DoorDummy")].unlocked = false 
			if(once == 4){
				updateOnce() //to 5
				updateStory() //to 4
				playStoryTrack('audio/005_Laptop_Holen.mp3') 
				openText()
				display_image('images/hs2.jpg')
				setTimeout(function(){
					closeText()
					close_image('leImage')
				}, 35000)
			}	
		}
	})

const bathroomDoorDummyBasementInteractable =
	new CustomInteractable(undefined, undefined, () => {
		console.log('bathroom basement was clicked')
		if((once == 10 || once == 9) && story == 7){
			if(once == 9) updateOnce() //to 10
			updateOnce() //to 11
			openText()
			display_image('images/standBy.jpg');
			interactables[findElement("BathroomDoorDummyBasement")].unlocked = false
			interactables[findElement("BathroomDoorDummyUpstairs")].unlocked = false 
			interactables[findElement("Laptop2")].unlocked = true
			playStoryTrack('audio/010_Toilettengang.mp3')
			missionText.innerHTML = ""
			setTimeout(function(){
				missionText.innerHTML = "Beweise deine Informatik Kenntnisse: Schließ das HDMI-Kabel an!"
				closeText()
				close_image('leImage');
			}, 12000)
		}
	})

const bathroomDoorDummyUpstairsInteractable =
	new CustomInteractable(undefined, undefined, () => {
		console.log('bathroom upstairs was clicked')
		if(once == 9 && story == 7){
			updateOnce() //to 10
			interactables[findElement("BathroomDoorDummyUpstairs")].unlocked = false 
			playStoryTrack('audio/010a_Damentoiletten.mp3')
			setTimeout(function(){
				missionText.innerHTML = "DIE RICHTIGEN TOILETTEN"
			}, 2000)
		}
	})

const flyerInteractable = 
	new CustomInteractable(undefined, undefined, () => {
		console.log(quizOpen)
		if(openOnce == false){
			openOnce_True()
			if(quizOpen == false){
				document.getElementById("abbeanum-quiz").style.visibility = 'visible';
				quizOpen_True()
				interactables[findElement("Flyer")].unlocked = false
				if(openOnce == true) blockUserInput()
			}else{
				document.getElementById("abbeanum-quiz").style.visibility = 'hidden';
				quizOpen_False()
			}
		}
	})

const infoboardCorridorInteractable = 
	new CustomInteractable(undefined, undefined, () => {
		if(!openOnce){
			openOnce_True() //alows picture to open for the first time
			if(infoPictureOpen == false){
				display_image('images/history.jpg'); // image height relates to browser-window height
				setTimeout(function(){
					openOnce_False() //allows picture to close
				}, 200)
			}else{
				close_image('leImage');
				setTimeout(function(){
					openOnce_False() //allows picture to open again
				}, 200)
			}
		}
	})

let interactables = []

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
	})*/

var velocity = new THREE.Vector3(0,0,0)
var acceleration = new THREE.Vector3(0,0,0)

var couldInteract = false

const dumpsterTmpPos = new THREE.Vector3() // temporary variable
const beamerInteractionPosition = latLonToXYZ(50.93424916, 11.580621134635106, 185.12)

// helper functions for the animation loop
function handleInteractions(scene, camera, mousecaster, mouse, time, dt, outlinepass = null){
	
	// get the models for all interactables, where missing
	// theoretically only needed if a mesh changes
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
			playStoryTrack('audio/018_geschichte_abb.mp3')
			unlockElement("AbbeanumDoorEntrance")
		} 
	}
	
	// check for key-presses, which try to interact
	if((changableInteractionState.keyboard.e || changableInteractionState.keyboard.enter) &&
		changableInteractionState.keyWasPressed && !changableInteractionState.isBlocked &&
		currentInteractables &&
		currentInteractables.length > 0
	) keyPressInteract(camera, currentInteractables)
	
	var dtx = clamp(dt * 10, 0, 1) // the lower this number is, the smoother is the motion
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
	checkCollision(velocity, user, changableInteractionState.keyWasPressed, changableInteractionState.jumpTime, dt)
	
	// progress jump forward in time
	changableInteractionState.jumpTime += dt
	
	updateSparkles(scene, camera, targetSizes, sparkleTargets, time, dt)
	
	// AUTOMATICALLY CLOSE PICTURE WHEN WALKING AWAY
	/*if(infoPictureOpen){
		const infoboard1 = infoboardCorridorInteractable.interactableModel
		const infoboard2 = infoboardOutside.interactableModel
		const distance = Math.min(
			infoboard1 && infoboard1.position ? camera.position.distanceTo(infoboard1.position) : 0,
			infoboard2 && infoboard2.position ? camera.position.distanceTo(infoboard2.position) : 0
		)
		if(distance > 2){
		}*/
	//AUTOMATICALLY CLOSE PICTURE WHEN WALKING AWAY
	if(infoPictureOpen==true && scene == flurScene){
		let distance = camera.position.distanceTo(infoboardCorridor.position)
		if(distance > 2 && distance <= 3){
			close_image('leImage')
		}
	}
	
	//////////////////////////////
	///// MOUSE INTERACTIONS /////
	//////////////////////////////
	if(changableInteractionState.wasClicked && !changableInteractionState.isBlocked){
		if(abbeanumDoorEntrance) abbeanumDoorEntrance.visible = true

		mousecaster.setFromCamera(mouse, camera)
		
		const mouseIntersects = mousecaster.intersectObjects(currentInteractables.map(ci => ci.interactableModel))
		rayInteract(mouseIntersects)
	
		if(abbeanumDoorEntrance) abbeanumDoorEntrance.visible = false;
		
	}
	
	changableInteractionState.wasClicked = false
	changableInteractionState.keyWasPressed = false
	
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

function filterInventory(exp){
	inInventory = inInventory.filter(exp);
}
export { handleInteractions, inInventory, filterInventory, interactables, lockElement, unlockElement}
