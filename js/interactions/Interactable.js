import {inInventory} from './Interactions.js'
import {printInventory} from './Interactions.js'

class Interactable {
    constructor(interactableModel, position, scenes, unlocked=true) {
        this.interactableModel = interactableModel
        this.position = position
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
        if (!this.scenes.includes(currentScene)) 
            return false
        if (camera.position.distanceTo(this.position) > this.interactionRadius) 
            return false
        return true
    }

    // interact is a facade to the individual interaction implementations of inheriting classes
    interact() {
        //console.log('YES')
        console.log('Interacting with ' + this.interactableModel.name)
    }
}

class Door extends Interactable {
    constructor(interactableModel, position, scenes) {
        super(interactableModel, position, scenes)
    }

    #openDoor(currentScene){
        //const new_scene = this.scenes.find(scn => {scn!=currentScene})
        // for some reason that (🔼 ) doesnt work?
        const new_scene = this.scenes[0] == currentScene ? this.scenes[1] : this.scenes[0]
        currentScene = window.scene = new_scene
    }

    interact(currentScene){
        super.interact()
        this.#openDoor(currentScene)
    }
}


class InventoryObject extends Interactable {
    constructor(interactableModel, position, scenes) {
        super(interactableModel, position, scenes)
    }

    #takeObject(){
        //console.log('Inventory: ', inInventory)
        if(!inInventory.includes(this.interactableModel.name)){
            inInventory.push(this.interactableModel.name)
            printInventory()
            //maybe remove object instead?
            this.interactableModel.visible = false
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
    constructor(interactableModel, position, scenes) {
        super(interactableModel, position, scenes)
    }

    interact(){
        super.interact()
        this.#getInfo()
    }

    #getInfo(){

    }
}

export {Interactable, Door, InfoObject, InventoryObject}