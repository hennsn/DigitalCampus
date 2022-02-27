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
	tvCuboidInteractable,
	wetFloorInteractable
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

let wetFloorAudio = ['audio/017a_gewischt.mp3', 'audio/017b_hier_nicht_lang.mp3', 'audio/017c_you_shall_not_pass.mp3']

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
	coffeeMachineInteractable, infoboardCorridorInteractable, infoboardOutside, wetFloorInteractable
]

window.interactables = interactables

function unlockElement(name){
	findElement(name).unlocked = true
}
function lockElement(name){
	findElement(name).unlocked = false
}

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
	
	
	//AUTOMATICALLY CLOSE PICTURE WHEN WALKING AWAY
	if(infoPictureOpen==true){
		lockElement('AbbeanumDoorEntrance')
		if(scene == abbeanumCorridorScene){
			let distance = camera.position.distanceTo(infoboardCorridorInteractable.position)
			if(distance > 2 && distance <= 3){
				close_image('leImage')
			}
		}
		if(scene == outsideScene){
			let distance = camera.position.distanceTo(infoboardOutside.position)
			if(distance > 2 && distance <= 3){
				close_image('leImage')
			}
		}	
	}else{
		unlockElement('AbbeanumDoorEntrance')
	}

	//play audios near wet floor sign
	if(scene == abbeanumCorridorScene){
		if(camera.position.distanceTo(wetFloorInteractable.position) <= 2 && !isPlaying){
			console.log('working')
			playStoryTrack(wetFloorAudio[0])
			let first = wetFloorAudio.shift();
    		wetFloorAudio.push(first);
		}
	}
	
	//////////////////////////////
	///// MOUSE INTERACTIONS /////
	//////////////////////////////
	//ehemals hier array; jetzt überflüssig da pointer auf currentInteractables gespeichert werden
	if(changableInteractionState.wasClicked && !changableInteractionState.isBlocked){
		if(abbeanumDoorEntrance) abbeanumDoorEntrance.visible = true

		mousecaster.setFromCamera(mouse, camera)
		
		const mouseIntersects = mousecaster.intersectObjects(currentInteractables.map(ci => ci.interactableModel)) //currentIntersctables bildet auf die Modelle ab
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
		//in case one clicks on submesh of a parent mesh
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
