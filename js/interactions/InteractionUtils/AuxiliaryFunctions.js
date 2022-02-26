// find object in interactables array we are looking for
import {inInventory, interactables, changableInteractionState} from "../Interactions.js";
import {clamp, degToRad} from "../../Maths.js";

function findElement(lookingFor) {
    const index = interactables.findIndex(interactable => interactable.name == lookingFor || (interactable.interactableModel && interactable.interactableModel.name == name))
    return interactables[index]
}

//prints everything in inventory-array to inventory-textbox
function printInventory() {
    inventory.innerHTML = inInventory.join("<br/>")
}

export function printInteractables() {
    for (let i = 0; i < interactables.length; i++) {
        console.log(interactables[i].name)
    }
    console.log(interactables)
}

//hide inventory
function hideInventory() {
    document.getElementById("inventory").style.visibility = 'hidden'
    changableInteractionState.inventoryOpen = false
}

//functions to toggle user input
function blockUserInput() {
    changableInteractionState.isBlocked = true
    controlHints.style.visibility = 'hidden'
}

function allowUserInput() {
    changableInteractionState.isBlocked = false
    controlHints.style.visibility = 'visible'
}

//Bildanzeige (derzeit über p)
function display_image(src) {
    infoPictureOpen = true
    document.getElementById("infoPicture").style.visibility = 'visible'
    var a = document.createElement("img")
    a.src = src
    a.style.height = "calc(100vh - 100px)" //dynamic picture size // LEERZEICHEN UM MINUS IMPORTANT!!
    a.id = 'leImage'
    a.style.margin = "0 auto"
    document.getElementById("dispImage").appendChild(a)
}

function close_image(imgID) {
    infoPictureOpen = false
    document.getElementById("infoPicture").style.visibility = 'hidden'
    var imgID = imgID
    var b = document.getElementById(imgID)
    b.parentNode.removeChild(b)
}

export {close_image};
export {display_image};
export {allowUserInput};
export {blockUserInput};
export {hideInventory};
export {printInventory};
export {findElement};

export function clampCameraRotation() {
    camera.rotation.x = clamp(camera.rotation.x, -60 * degToRad, +60 * degToRad)
}
