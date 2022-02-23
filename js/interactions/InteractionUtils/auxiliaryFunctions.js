// find object in interactables array we are looking for
import {inInventory, interactables, inventoryOpen, isBlocked} from "../Interactions.js";

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
    inventoryOpen = false
}

//functions to toggle user input
function blockUserInput() {
    isBlocked = true
    controlHints.style.visibility = 'hidden'
}

function allowUserInput() {
    isBlocked = false
    controlHints.style.visibility = 'visible'
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
