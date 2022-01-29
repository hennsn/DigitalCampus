import {inInventory} from './Interactions.js'
import {printInventory} from './Interactions.js'
import { playAudioTrack } from '../UserInterface.js'

class Interactable {
    constructor(interactableModel, scenes, unlocked=true) {
        this.interactableModel = interactableModel
        this.position = this.interactableModel.position
        // as long as we don't have one interactable model for each scene,
        // we need a list of !! exactly 2 !! scenes for scene changes
        this.scenes = scenes
        // taken from interaction.js
        this.interactionRadius = 3
        // in ms
        this.interactionInterval = 300
        this.unlocked = unlocked  
    }

    canInteract(currentScene, camera, lastInteractionTime) {
        if (!this.unlocked)
            return false
        if(Date.now() - lastInteractionTime < this.interactionInterval)
            return false
        if (!this.scenes === currentScene) 
            return false
        if (camera.position.distanceTo(this.position) > this.interactionRadius) 
            return false
        return true
    }

    // interact is a facade to the individual interaction implementations of inheriting classes
    interact() {
        console.log('Interacting with ' + this.interactableModel.name)
    }
}

class Door extends Interactable {
    constructor(interactableModel, scenes, entryPoint) {
        super(interactableModel, scenes)
        // the player gets teleported to entryPoint upon interacting with this door
        this.entryPoint = entryPoint
    }

    #openDoor(currentScene, camera){
        //const new_scene = this.scenes.find(scn => {scn!=currentScene})
        // for some reason that (🔼 ) doesnt work?
        const new_scene = this.scenes[0]
        currentScene = window.scene = new_scene
        playAudioTrack('audio/door-1-open.mp3');
        camera.position.copy(this.entryPoint)
    }

    interact(currentScene, camera){
        super.interact()
        this.#openDoor(currentScene, camera)
    }
}


class InventoryObject extends Interactable {
    constructor(interactableModel, scenes) {
        super(interactableModel, scenes)
    }

    #takeObject(){
        //console.log('Inventory: ', inInventory)
        if(!inInventory.includes(this.interactableModel.name)){
            inInventory.push(this.interactableModel.name)
            printInventory()
            //maybe remove object instead?
            this.interactableModel.visible = false
            this.unlocked = false // for some reason does not worrk //
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
    constructor(interactableModel, scenes) {
        super(interactableModel, scenes)
    }

    interact(){
        super.interact()
        this.#getInfo()
    }

    #getInfo(){

    }
}

export {Interactable, Door, InfoObject, InventoryObject}