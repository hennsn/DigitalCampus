class Interactable {
    constructor(interactableMesh, position, scenes) {
        this.interactableMesh = interactableMesh
        this.position = position
        // as long as we don't have one interactable model for each scene,
        // we need a list of !! exactly 2 !! scenes for scene changes
        this.scenes = scenes
        // taken from interaction.js
        this.interactionRadius = 3
        // in ms
        this.interactionInterval = 300
    }

    canInteract(currentScene, camera, lastInteractionTime) {
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
    }
}

class Door extends Interactable {
    constructor(interactableMesh, position, scenes) {
        super(interactableMesh, position, scenes)
    }

    #openDoor(currentScene){
        //const new_scene = this.scenes.find(scn => {scn!=currentScene})
        // for some reason that (🔼 ) doesnt work?
        const new_scene = this.scenes[0] == currentScene ? this.scenes[1] : this.scenes[0]
        currentScene = window.scene = new_scene
    }

    interact(currentScene){
        this.#openDoor(currentScene)
    }
}


class InventoryObject extends Interactable {
    constructor(interactableMesh, position, scenes) {
        super(interactableMesh, position, scenes)
    }

    interact(){
        this.#takeObject()
    }

    #takeObject(){

    }
}


class InfoObject extends Interactable {
    constructor(interactableMesh, position, scenes) {
        super(interactableMesh, position, scenes)
    }

    interact(){
        this.#getInfo()
    }

    #getInfo(){

    }
}

export {Interactable, Door, InfoObject, InventoryObject}