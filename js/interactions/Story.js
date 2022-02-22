import { audio, audioStory, doNow, isPlaying, playAudioTrack, playStoryTrack, stopStoryTrack } from '../UserInterface.js'
import { interactables, keyWasPressed, wasClicked, printInventory, inInventory, hideInventory, blockUserInput, allowUserInput, findElement, lockElement, unlockElement } from './Interactions.js'

//boolean overlay
let overlayActive = false
///COUNTER FOR STORY (we'll see if it works that way or if it's to simple) /////
let story = 0
let once = 0

function updateStory(){
	story++
}
function updateOnce(){
	once++
}

//overlay//
const overlay = document.getElementById('overlay');
overlay.addEventListener('click', closeText);

function openText(){
	//document.getElementById("infoPicture").classList.add("active");
	document.getElementById("overlay").classList.add("active");
	overlayActive = true
	hideInventory()
	blockUserInput()
}

function closeText(){
	//document.getElementById("infoPicture").classList.remove("active");
	document.getElementById("overlay").classList.remove("active");
	overlayActive = false
	allowUserInput()
}


function startStory(scene, mousecaster){
	//Spawn
	if(scene == outsideScene && story == 0 && (keyWasPressed || wasClicked)){
		if(once == 0){
			playStoryTrack('audio/springTestSound.wav')//('audio/001_Einleitung_Spawn_New.mp3')
			once = 1
			lockElement("AbbeanumDoorEntrance")
		}
	}
	//end of spawn audio
	if(once == 1 && scene == outsideScene && !isPlaying){
		missionText.innerHTML = "Gehe ins Abbeanum"
		unlockElement("AbbeanumInfoBoard")
	}
	//enter abbeanum
	if(scene == flurScene && story == 0){
		missionText.innerHTML = "Gehe zum Hörsaal 1"
		story = 1
		setTimeout(function(){ //delay needed
			unlockElement("Flyer")
			unlockElement("InfoboardCorridor")
		}, 500)
	}
	//enter hs1
	if(scene == hs1Scene && story == 1){
		missionText.innerHTML = "Gehe zum Laptop und teste deine Powerpoint"
		if(once == 1){
			playStoryTrack('audio/002_Hier_Laptop.mp3')
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
		missionText.innerHTML = "Ruf Lisa an"
		document.getElementById("button").classList.add("active")
		button.addEventListener('click', () =>{
			if(once == 3 && story == 2){
				playStoryTrack('audio/springTestSound.wav')//("audio/004_Telefonat.mp3")
				missionText.innerHTML = "Pace aufgeregt im Hörsaal umher"
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
		missionText.innerHTML = "Gehe Kai, Henrik und Jan um einen Laptop anflehen"
		unlockElement("HS2DoorDummy")
	}
	//after hs2 dialogue
	if(story == 4 && once == 5 && !isPlaying){
		missionText.innerHTML = "Schließ den rettenden Laptop an den Beamer an"
		closeText() 
		if(!inInventory.includes('Laptop mit Backup')){
			inInventory.push('Laptop mit Backup')
		}
		printInventory()
		unlockElement("Laptop")
	}
	if(story == 5 && once == 6 && !isPlaying){
		missionText.innerHTML = "*Leihe* dir irgendwo im Abbeanum ein Kabel"
		unlockElement("TvCuboid")
	}
	if(once == 7 && story == 6 && !isPlaying){
		unlockElement("Kaffeetasse")
		missionText.innerHTML = "Hole die Kaffeetasse"
	}
	if(once == 13 && story == 7){
		mousecaster.far = 6 //adjusts mousecaster to click on beamer
	}
	if(once == 15 && story == 8 && !isPlaying){
		updateOnce() //to 16
		setTimeout(function(){
			openText()
			playStoryTrack('audio/016_Ende.mp3')
			missionText.innerHTML = ""
		}, 4000)
		setTimeout(function(){
			missionText.innerHTML = "Danke für Deine Aufmerksamkeit :-)"
		}, 25000)
		setTimeout(closeText, 28000)
	}
	if(once == 16 && !overlayActive) missionText.innerHTML = ""
	
}

export {story, once, openText, closeText, overlayActive, startStory, updateStory, updateOnce}