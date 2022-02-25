import { inInventory } from './Interactions.js'
import { interactables, lockElement, unlockElement } from './Interactions.js'
import { audio, audioStory, doNow, isPlaying, playAudioTrack, playStoryTrack, showLoadinOverlay } from '../UserInterface.js'
import { updateOnce, updateStory, setMissionText } from './Story.js'
import { findElement, printInventory } from "./InteractionUtils/AuxiliaryFunctions.js";

//boolean for infoObject audios
let playedOnce = false

class Interactable {
	constructor(name, unlocked) {
		this.name = name
		this.interactionRadius = 3
		// in ms
		this.interactionInterval = 300
		//this.unlocked = unlocked // tried commenting it out and declare in subclasses, worked for doors, NOT for inventory objects 
	}
	
	canInteract(currentScene, camera, lastInteractionTime) {
		// whether the object is unlocked (next part of the story)
		if (!this.unlocked)
			return false
		// check for ix cooldown
		if(Date.now() - lastInteractionTime < this.interactionInterval)
			return false
		// check if we are in the right scene
		if (this.scene !== currentScene)
			return false
		// whether we are close enough to interact
		if (camera.position.distanceTo(this.position) > this.interactionRadius)
			return false
		return true
	}
	
	// helper function to set the interactable model of an interactable
	// (temporarily) necessary to have persistent interactables as part of the story
	setInteractableModel(interactableModel, scene){
		if (this.interactableModel || !interactableModel) return
		this.scene = scene
		this.interactableModel = interactableModel
		this.position = this.interactableModel.position
		interactableModel.userData.interact = (s,c) => this.interact(s,c)
	}
	
	// interact is a facade to the individual interaction implementations of inheriting classes
	interact() {
		console.log('Interacting with ' + this.interactableModel.name)
	}
}

class Door extends Interactable {
	constructor(name, sceneName, entryPoint) {
		super(name)
		// the player gets teleported to entryPoint upon interacting with this door
		this.entryPoint = entryPoint
		this.unlocked = true
		this.sceneName = sceneName
	}
	
	#openDoor(currentScene, camera){
		window.scene = window[this.sceneName]
		playAudioTrack('audio/door_1_open.mp3');
		showLoadinOverlay(150)
		camera.position.copy(this.entryPoint)
	}
	
	interact(currentScene, camera){
		super.interact()
		this.#openDoor(currentScene, camera)
	}
}


class InventoryObject extends Interactable {
	constructor(name, audioTrack=undefined, missionText=undefined,unlock=undefined,updateOnce=false) {
		super(name)
		this.unlocked = false
		this.audioTrack = audioTrack
		this.missionText = missionText
		this.unlock = unlock
		this.updateOnce = updateOnce
	}

	#takeObject(){
		if(this.updateOnce) updateOnce()
		if(this.missionText) setMissionText(this.missionText)
		if(this.audioTrack) playStoryTrack(this.audioTrack)
		if(this.unlock) unlockElement(this.unlock)
		
		if(!inInventory.includes(this.interactableModel.name)){
			//maybe remove object instead?
			this.unlocked = false // apparently now works
			this.interactableModel.visible = false
			inInventory.push(this.interactableModel.name)
			printInventory()
		} else {
			console.log('already stored')
		}
	}

	interact(){
		super.interact()
		this.#takeObject()
	}	
}


class InfoObject extends Interactable {
	constructor(name) {
		super(name)
		this.unlocked = true
	}
	
	interact(){
		super.interact()
		this.#getInfo()
	}
	
	#getInfo(){
	   
	}
}


class CustomInteractable extends Interactable {
	constructor(name, interactionFunction){
		super(name)
		// custom interaction function
		this.interactionFunction = interactionFunction
		this.unlocked = false
	}
	interact(){
		super.interact()
		this.interactionFunction()
	}
}

export { Interactable, Door, InfoObject, InventoryObject, CustomInteractable }
