import { audio, audioStory, doNow, isPlaying, playAudioTrack, playStoryTrack } from '../UserInterface.js'
import { interactables, changableInteractionState, inInventory, lockElement, unlockElement } from './Interactions.js'
import {
	allowUserInput,
	blockUserInput,
	findElement,
	hideInventory,
	printInventory
} from "./InteractionUtils/AuxiliaryFunctions.js";

//boolean overlay
let overlayActive = false
///COUNTER FOR STORY (we'll see if it works that way or if it's to simple) /////
window.story = 0
window.once = 0

function updateStory(){
	story++
}
function updateOnce(){
	once++
}

//overlay//
const overlay = document.getElementById('overlay');
//overlay.addEventListener('click', closeText);

function openText(){
	document.getElementById("overlay").classList.add("active");
	overlayActive = true
	hideInventory()
	blockUserInput()
}

function closeText(){
	document.getElementById("overlay").classList.remove("active");
	overlayActive = false
	allowUserInput()
}

var lastMissionText = 'x'
function setMissionText(text){
	if(text != lastMissionText){
		missionText.innerHTML = text
		lastMissionText = text
	}
}

function startStory(scene, mousecaster){
	//Spawn
	if(scene == outsideScene && story == 0 && (changableInteractionState.keyWasPressed || changableInteractionState.wasClicked)){
		if(once == 0){
			updateOnce() // to 1
			playStoryTrack('audio/001_einleitung_spawn_new.mp3')
			setTimeout(function(){
				lockElement("AbbeanumDoorEntrance")
			}, 200)
		}
	}
	//end of spawn audio
	if(once == 1 && scene == outsideScene && !isPlaying){
		setMissionText("Gehe ins Abbeanum")
		unlockElement("AbbeanumInfoBoard")
	}
	//enter abbeanum
	if(scene == abbeanumCorridorScene && story == 0){
		setMissionText("Gehe zum Hörsaal 1")
		story = 1
		setTimeout(function(){ //delay needed
			unlockElement("Flyer")
			unlockElement("InfoboardCorridor")
		}, 500)
	}
	//enter hs1
	if(scene == abbeanumHS1Scene && story == 1){
		setMissionText("Gehe zum Laptop und teste deine Powerpoint")
		if(once == 1){
			playStoryTrack('audio/002_hier_laptop.mp3')
			once = 2
		}
		setTimeout(function(){ //delay needed
			unlockElement("Laptop")
		}, 500)
	}
	//button, dann anruf
	if(story == 2 && once == 3 && !isPlaying){
		lockElement("Trashcan") // needed because the trashcan misbehaves
		inInventory.pop()
		inInventory.push('*falscher* USB Stick')
		printInventory()
		setMissionText("Ruf Lisa an")
		document.getElementById("button").classList.add("active")
		button.addEventListener('click', () =>{
			if(once == 3 && story == 2){
				playStoryTrack("audio/004_telefonat.mp3")
				setMissionText("Renne aufgeregt im Hörsaal umher")
				document.getElementById("button").classList.remove("active")
				once = 4
			}
		})
	}
	//after phone call
	if(once == 4 && !isPlaying){
		story = 3
		document.getElementById("button").classList.remove("active")
		unlockElement("HS1DoorExit")
	}
	//after phone call
	if(story == 3){
		setMissionText("Flehe Kai, Henrik und Jan in Hörsaal 2 um einen Laptop an")
		unlockElement("HS2DoorDummy")
	}
	//after hs2 dialogue
	if(story == 4 && once == 5 && !isPlaying){
		setMissionText("Schließ den rettenden Laptop an den Beamer an")
		closeText() 
		if(!inInventory.includes('Laptop mit Backup')){
			inInventory.push('Laptop mit Backup')
		}
		printInventory()
		unlockElement("Laptop")
	}
	if(story == 5 && once == 6 && !isPlaying){
		// zu schwierig ohne Hilfe
		setMissionText("*Leihe* dir irgendwo im Abbeanum ein Kabel 📺")
		unlockElement("TvCuboid")
	}
	if(once == 7 && story == 6 && !isPlaying){
		unlockElement("Kaffeetasse")
		setMissionText("Hole die Kaffeetasse aus dem Hörsaal 1")
	}
	if(once == 13 && story == 7){
		mousecaster.far = 6 // adjusts mousecaster to click on beamer
		if (scene == abbeanumCorridorScene){
			updateStory() //to 8
			playAudioTrack('audio/015_verdammte_klauschweine.mp3')

		}
	}
	if(once == 15 && story == 8 && !isPlaying){
		updateOnce() //to 16
		setTimeout(function(){
			openText()
			playStoryTrack('audio/016_ende.mp3')
			missionText.innerHTML = ""
		}, 4000)
		setTimeout(function(){
			setMissionText("<h1>Danke für Deine Aufmerksamkeit 😊</h1>")
		}, 25000)
		setTimeout(closeText, 28000)
	}
	if(once == 16 && !overlayActive) setMissionText("🎉")
}

export { openText, closeText, overlayActive, startStory, updateStory, updateOnce, setMissionText }
