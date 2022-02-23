// Doors
import * as THREE from 'https://cdn.skypack.dev/three@0.135.0'
import {latLonToXYZ} from "../environment/Coordinates.js"
import {CustomInteractable, Door, InventoryObject} from "./Interactable.js";
import {closeText, once, openText, story, updateOnce, updateStory} from "./Story.js";
import {isPlaying, playStoryTrack} from "../UserInterface.js";
import {openOnce, openOnce_False, openOnce_True, quizOpen, quizOpen_False, quizOpen_True} from "./Quiz.js";
import {allowUserInput, blockUserInput, inInventory, lockElement, printInventory, unlockElement, display_image, close_image } from "./Interactions.js";

// Entry points for the scenes
const OutsideEntryPointFromAbbeanum = latLonToXYZ(50.9341135282, 11.580763350135289, 183.6634)
const CorridorEntryPointFromHS1     = latLonToXYZ(50.9342438158, 11.580480214404881, 185.8484)
const CorridorEntryPointFromOutside = latLonToXYZ(50.9341115743, 11.580742267367510, 183.4596)
const HS1EntryPointFromCorridor     = latLonToXYZ(50.9342464420, 11.580500527436710, 185.8484)

export const abbeanumDoorEntranceInteractable = new Door('AbbeanumDoorEntrance', 'flurScene', CorridorEntryPointFromOutside)
export const abbeanumDoorExitInteractable     = new Door('AbbeanumDoorExit', 'outsideScene', OutsideEntryPointFromAbbeanum)
export const hs1DoorEntranceInteractable      = new Door('HS1DoorEntrance', 'hs1Scene', HS1EntryPointFromCorridor)
export const hs1DoorExitInteractable          = new Door('HS1DoorExit', 'flurScene', CorridorEntryPointFromHS1)
// Inventory Objects
export const stickInteractable = new InventoryObject('Stock')
export const cupInteractable = new InventoryObject('Kaffeetasse')
// NOT REALLY NEEDED
export const blackboardsInteractable = new InventoryObject('Blackboards')
// Custom Objects
export const trashcanInteractable = new CustomInteractable('Trashcan', () => {
    if (inInventory.includes("altes VGA Kabel")) {
        inInventory = inInventory.filter(e => e !== 'altes VGA Kabel');
        printInventory()
        lockElement("Trashcan")
    }
})
export const laptopInteractable = new CustomInteractable('Laptop', () => {
    console.log('laptop1 was clicked')
    if (once == 2) {
        updateOnce() //once to 3
        updateStory() //story to 2
        lockElement("Laptop")
        lockElement("HS1DoorExit")
        playStoryTrack('audio/003_Falscher_Stick.mp3')//('audio/springTestSound.wav')
        blockUserInput()
        setTimeout(openText, 18000)
        setTimeout(closeText, 34000)
    } else if (story == 4 && once == 5) {
        updateOnce() //to 6
        updateStory() //to 5
        inInventory.pop()
        printInventory()
        // laptop tausch:
        hs1Scene.getObjectByName("Laptop2").visible = true
        hs1Scene.getObjectByName("Laptop").visible = false
        playStoryTrack('audio/006_Kein_HDMI.mp3')//('audio/springTestSound.wav')
        lockElement("Laptop")
        if (!inInventory.includes('altes VGA Kabel')) {
            inInventory.push('altes VGA Kabel')
            unlockElement("Trashcan")
        }
        printInventory()
    }
})
export const laptop2Interactable = new CustomInteractable('Laptop2', () => {
    console.log('laptopt2 was clicked')
    if (once == 11 && story == 7) {
        updateOnce() //to 12
        inInventory.pop()
        printInventory()
        lockElement("Laptop2")
        lockElement("HS1DoorExit")
        playStoryTrack('audio/011_Physische_Intervention_Geplant.mp3')
        missionText.innerHTML = "Sei entrüstet"
        setTimeout(function () {
            unlockElement("HS1DoorExit")
            unlockElement("Stock")
            missionText.innerHTML = "Finde einen Stock"
        }, 17000)
    }
})
export const coffeeMachineInteractable = new CustomInteractable('CoffeeMachine', () => {
    console.log('coffee machine was clicked')
    if (once == 8) {
        updateOnce() //to 9
        updateStory() //to 7
        blockUserInput()
        inInventory.pop()
        printInventory()
        lockElement("CoffeeMachine")
        playStoryTrack('audio/009_Zu_Viel_Kaffee.mp3')
        unlockElement("BathroomDoorDummyBasement")
        unlockElement("BathroomDoorDummyUpstairs")
        setTimeout(function () {
            allowUserInput()
            missionText.innerHTML = "Finde die Toiletten - und zwar schnell!"
        }, 12000)
    }
})
export const beamerInteractable = new CustomInteractable('Beamer', () => {
    console.log('beamer was clicked')
    if (once == 13 && story == 7) {
        updateOnce() //to 14
        updateStory() //to 8
        lockElement("Beamer")
        blockUserInput()
        playStoryTrack('audio/013_Verfehlt.mp3')
        setTimeout(function () {
            allowUserInput()
            unlockElement("Beamer")
            missionText.innerHTML = "Mach ihn fertig!"
        }, 3000)
    } else if (once == 14 && story == 8 && !isPlaying) {
        updateOnce() //to 15
        lockElement("Beamer")
        blockUserInput()
        playStoryTrack('audio/014_Clonk_Beamer.mp3')
        inInventory.pop()
        printInventory()
        setTimeout(function () {
            allowUserInput()
            missionText.innerHTML = "Geschafft - nimm deinen rechtmäßigen Platz am Pult ein"
        }, 3000)
    }
})
export const abbeanumInfoBoardInteractable = new CustomInteractable('AbbeanumInfoBoard', () => {
    if (closeEnough == 0 && !isPlaying && once == 1) {
        closeEnough = 1
        playStoryTrack('audio/018_Geschichte_Abb.mp3')
        setTimeout(function () {
            unlockElement("AbbeanumDoorEntrance")
        }, 1500)
    }
})
export const tvCuboidInteractable = new CustomInteractable('TvCuboid', () => {
    if (once == 6 && !isPlaying) {
        lockElement("TvCuboid")
        blockUserInput()
        updateOnce() //to 7
        updateStory() //to 6
        playStoryTrack('audio/007_Kabel_Gefunden_kaffee.mp3')
        setTimeout(function () {
            scene.getObjectByName('AbbeanumInside').getObjectByName('Fernseher_aus').visible = true
            scene.getObjectByName('AbbeanumInside').getObjectByName('Fernseher_an').visible = false
            if (!inInventory.includes('brandneues HDMI-Kabel')) {
                inInventory.push('brandneues HDMI-Kabel')
            }
            missionText.innerHTML = "Schnell weg - du warst nie hier!"
            printInventory()
        }, 5000)
        setTimeout(allowUserInput, 5500)
    }
})
export const HS2DoorDummyInteractable = new CustomInteractable('HS2DoorDummy', () => {
    console.log('hs2door was clicked')
    if (story == 3 && !isPlaying) {
        lockElement("HS2DoorDummy")
        if (once == 4) {
            updateOnce() //to 5
            updateStory() //to 4
            playStoryTrack('audio/creaking-door-2.mp3') //just dummy placeholder
            openText() //should stop input at some point
        }
    }
})
export const bathroomDoorDummyBasementInteractable = new CustomInteractable('BathroomDoorDummyBasement', () => {
    console.log('bathroom basement was clicked')
    if ((once == 10 || once == 9) && story == 7) {
        if (once == 9) updateOnce() //to 10
        updateOnce() //to 11
        openText()
        lockElement("BathroomDoorDummyBasement")
        lockElement("BathroomDoorDummyUpstairs")
        unlockElement("Laptop2")
        playStoryTrack('audio/010_Toilettengang.mp3')
        missionText.innerHTML = ""
        setTimeout(function () {
            missionText.innerHTML = "Beweise deine Informatik Kenntnisse: Schließ das HDMI-Kabel an!"
            closeText()
        }, 12000)
    }
})
export const bathroomDoorDummyUpstairsInteractable = new CustomInteractable('BathroomDoorDummyUpstairs', () => {
    console.log('bathroom upstairs was clicked')
    if (once == 9 && story == 7) {
        updateOnce() //to 10
        lockElement("BathroomDoorDummyUpstairs")
        playStoryTrack('audio/springTestSound.wav')
        setTimeout(function () {
            missionText.innerHTML = "DIE RICHTIGEN TOILETTEN"
        }, 2000)
    }
})
export const flyerInteractable = new CustomInteractable('Flyer', () => {
    console.log(quizOpen)
    if (openOnce == false) {
        openOnce_True()
        if (quizOpen == false) {
            document.getElementById("abbeanum-quiz").style.visibility = 'visible';
            quizOpen_True()
            lockElement("Flyer")
            if (openOnce == true) blockUserInput()
        } else {
            document.getElementById("abbeanum-quiz").style.visibility = 'hidden';
            quizOpen_False()
        }
    }
})
export const infoboardCorridorInteractable = new CustomInteractable('InfoboardCorridor', () => {
    if (!openOnce) {
        openOnce_True() // allows picture to open for the first time
        if (window.infoPictureOpen) {
            close_image('leImage');
            setTimeout(openOnce_False, 200) // allows picture to open again
        } else {
            display_image('images/history.jpg'); // image height relates to browser-window height
            setTimeout(openOnce_False, 200) //allows picture to close
        }
    }
})


export const infoboardOutside = new CustomInteractable('HistoryBoard', () => {
	if(!openOnce){
		openOnce_True() // allows picture to open for the first time
		if(window.infoPictureOpen){
			close_image('leImage');
			setTimeout(openOnce_False, 200) // allows picture to open again
		} else {
			display_image('images/history.jpg'); // image height relates to browser-window height
			setTimeout(openOnce_False, 200) // allows picture to close
		}
	}
})

infoboardOutside.unlocked = true