import {inInventory} from './Interactions.js'
import {printInventory} from './Interactions.js'
import { playAudioTrack, showLoadinOverlay } from '../UserInterface.js'

class Interactable {
    constructor(interactableModel, scene, unlocked=true) { //merge changed scenes to scene
        this.interactableModel = interactableModel
        this.position = interactableModel ? interactableModel.position : undefined
        this.scene = scene
        // taken from interaction.js
        this.interactionRadius = 3
        // in ms
        this.interactionInterval = 300
        this.unlocked = unlocked //tried commenting it out and declare in subclasses, worked for doors, NOT for inventory objects 
    }

    canInteract(currentScene, camera, lastInteractionTime) {
        // whether the object is unlocked (next part of the story)
        if (!this.unlocked){
            return false
        }
        // check for ix cooldown
        if(Date.now() - lastInteractionTime < this.interactionInterval){
            return false
        }
        // check if we are in the right scene / we are not a door
        // the scene of doors is the target scene; for others it's the containing scene
        // pls use polymorphism
        if ((this.scene !== currentScene && !this instanceof Door) || (this.scene === currentScene && this instanceof Door)){
            return false
        }
        // whether we are close enough to interact
        if (camera.position.distanceTo(this.position) > this.interactionRadius) {
            return false
        }
        return true
    }

    // helper function to set the interactable model of an interactable
    // (temporarily) necessary to have persistent interactables as part of the story
    setInteractableModel(interactableModel)
    {
        if (this.interactableModel) return
        this.interactableModel = interactableModel
        this.position = this.interactableModel.position
    }

    // interact is a facade to the individual interaction implementations of inheriting classes
    interact() {
        console.log('Interacting with ' + this.interactableModel.name)
    }
}

class Door extends Interactable {
    constructor(interactableModel, scene, entryPoint) {
        super(interactableModel, scene)
        // the player gets teleported to entryPoint upon interacting with this door
        this.entryPoint = entryPoint
        //this.unlocked = true
    }

    #openDoor(currentScene, camera){
        //const new_scene = this.scene.find(scn => {scn!=currentScene})
        // for some reason that (🔼 ) doesnt work?
        currentScene = window.scene = this.scene
        playAudioTrack('audio/door-1-open.mp3');
        showLoadinOverlay(150)

        camera.position.copy(this.entryPoint)
    }

    interact(currentScene, camera){
        super.interact()
        this.#openDoor(currentScene, camera)
    }
}


class InventoryObject extends Interactable {
    constructor(interactableModel, scene) {
        super(interactableModel, scene)
    }

    #takeObject(){
        //console.log('Inventory: ', inInventory)
        if(!inInventory.includes(this.interactableModel.name)){
            inInventory.push(this.interactableModel.name)
            printInventory()
            //maybe remove object instead?
            this.interactableModel.visible = false
            //this.unlocked = false // for some reason does not worrk //
        }else{
            console.log('already stored')
        }
    }

    interact(){
        super.interact()
        this.#takeObject()
    }    
}


class InfoObject extends Interactable {
    constructor(interactableModel, scene) {
        super(interactableModel, scene)
    }

    interact(){
        super.interact()
        this.#getInfo()
    }

    #getInfo(){

    }
}


class CustomInteractable extends Interactable {
    constructor(interactableModel, scene, interactionFunction){
        super(interactableModel, scene)
        // custom interaction function
        this.interactionFunction = interactionFunction
    }

    interact(){
        super.interact()
        this.interactionFunction()
    }
}

export {Interactable, Door, InfoObject, InventoryObject, CustomInteractable}