import { audio, audioStory, doNow, isPlaying, playAudioTrack, playStoryTrack, stopStoryTrack } from '../UserInterface.js'
import {interactables, keyWasPressed, wasClicked, printInventory, inInventory, hideInventory, blockUserInput, allowUserInput, findElement} from './Interactions.js'

/*To do:
Find out how to completely disable keyboard input during overlay*/

//boolean overlay
let overlayActive = false
///COUNTER FOR STORY (we'll see if it works that way or if it's to simple) /////
let story = 0
let once = 0

function updateStory(){
    story ++
}
function updateOnce(){
    once ++
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
    if(scene == outsideScene && story == 0 && keyWasPressed == true || wasClicked == true){
        if(once == 0){
            playStoryTrack('audio/001_Einleitung_Spawn_New.mp3')//('audio/springTestSound.wav')
            once = 1
            interactables[findElement("AbbeanumDoorEntrance")].unlocked = false 
        }
    }
    //end of spawn audio
    if(once == 1 && scene == outsideScene && isPlaying == false){
        missionText.innerHTML = "Gehe ins Abbeanum"
    }
    //enter abbeanum
    if(scene == flurScene && story == 0){
        missionText.innerHTML = "Gehe zum Hörsaal 1"
        story = 1
        setTimeout(function(){ //delay needed
            interactables[findElement("PreproomDoorDummy")].unlocked = true
        }, 1500)
    }
    //enter hs1
    if(scene == hs1Scene && story == 1){
        missionText.innerHTML = "Gehe zum Laptop und teste deine Powerpoint"
        if(once == 1){
            playStoryTrack('audio/002_Hier_Laptop.mp3')
            once = 2
        }
        setTimeout(function(){ //delay needed
            interactables[findElement("Laptop")].unlocked = true
        }, 500)
    }
    //button, dann anruf
    if(story == 2 && once == 3 && isPlaying == false){
        interactables[findElement("Trashcan")].unlocked = false //locks trashcan, needed because the trashcan misbehaves
        inInventory.pop()
        inInventory.push('*falscher* USB Stick')
		printInventory()
        missionText.innerHTML = "Ruf Lisa an"
        document.getElementById("button").classList.add("active")
        button.addEventListener('click', () =>{
            if(once == 3 && story == 2){
                playStoryTrack("audio/004_Telefonat.mp3")//('audio/springTestSound.wav')
                missionText.innerHTML = "Pace aufgeregt im Hörsaal umher"
                document.getElementById("button").classList.remove("active")
                once = 4
            }
        })
    }
    //after phone call
    if(once == 4 && isPlaying == false){
        story = 3
        document.getElementById("button").classList.remove("active")
        interactables[findElement("HS1DoorExit")].unlocked = true
    }
    //after phone call
    if(story == 3){
        missionText.innerHTML = "Gehe Kai, Henrik und Jan um einen Laptop anflehen"
        interactables[findElement("HS2DoorDummy")].unlocked = true 
    }
    //after hs2 dialogue
    if(story == 4 && once == 5 && isPlaying == false){
        missionText.innerHTML = "Schließ den rettenden Laptop an den Beamer an"
        closeText() 
        if(!inInventory.includes('Laptop mit Backup')){
            inInventory.push('Laptop mit Backup')
        }
        printInventory()
        interactables[findElement("Laptop")].unlocked = true 
    }
    if(story == 5 && once == 6 && isPlaying == false){
        missionText.innerHTML = "*Leihe* dir irgendwo im Abbeanum ein Kabel"
        if(!inInventory.includes('altes VGA Kabel')){
            inInventory.push('altes VGA Kabel')
        }
        printInventory()
        interactables[findElement("TvCuboid")].unlocked = true 
    }
    if(once == 7 && story == 6 && isPlaying == false){
        interactables[findElement("Kaffeetasse")].unlocked = true 
        missionText.innerHTML = "Hole die Kaffeetasse"
    }
    if(once == 13 && story == 7){
        mousecaster.far = 6 //adjusts mousecaster to click on beamer
    }
    if(once == 15 && story == 8 && isPlaying == false){
        updateOnce() //to 16
        setTimeout(function(){
            openText()
            playStoryTrack('audio/016_Ende.mp3')
            missionText.innerHTML = ""
        }, 4000)
        setTimeout(function(){
            missionText.innerHTML = "Danke für Deine Aufmerksamkeit :-)"
        }, 25000)
        setTimeout(function(){
            closeText()
        }, 28000)
    }
    if(once == 16 & overlayActive == false) missionText.innerHTML = ""
    
}

export {story, once, openText, closeText, overlayActive, startStory, updateStory, updateOnce}