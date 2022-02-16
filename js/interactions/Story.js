import { audio, audioStory, doNow, isPlaying, playAudioTrack, playStoryTrack, stopStoryTrack } from '../UserInterface.js'
import {interactables, keyWasPressed, wasClicked, printInventory, inInventory} from './Interactions.js'

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
}

function closeText(){
	//document.getElementById("infoPicture").classList.remove("active");
	document.getElementById("overlay").classList.remove("active");
	overlayActive = false
}


function startStory(scene){
    //Spawn
    if(scene == outsideScene && story == 0 && keyWasPressed == true || wasClicked == true){
        if(once == 0){
            playStoryTrack('audio/springTestSound.wav')//('audio/001_Einleitung_Spawn.mp3')
            once = 1
        }
        //block Abbeanum door?
    }
    //end of spawn audio
    if(once == 1 && scene == outsideScene && isPlaying == false){
        missionText.innerHTML = "Gehe ins Abbeanum"
        //unlock abbeanum door?
    }
    //enter abbeanum
    if(scene == flurScene && story == 0){
        missionText.innerHTML = "Gehe zum Hörsaal 1"
        story = 1
    }
    //enter hs1
    if(scene == hs1Scene && story == 1){
        missionText.innerHTML = "Gehe zum Laptop und teste deine Powerpoint"
        if(once == 1){
            //HIER NOCH BILD ÖFFNEN
            playStoryTrack('audio/002_Hier_Laptop.mp3')
            once = 2
        }
        interactables[3].unlocked = false //locks player in hs1
        interactables[4].unlocked = true //unlocks laptop
    }
    //button, dann anruf
    if(story == 2 && once == 3 && isPlaying == false){
        interactables[4].unlocked = false
        inInventory.pop()
        inInventory.push('*falscher* USB Stick')
		inventory.innerHTML = "Handy <br> *falscher* USB Stick"
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
    if(once == 4 && isPlaying == false){
        story = 3
        document.getElementById("button").classList.remove("active")
        interactables[3].unlocked = true //unlocks hs1 exit
    }
    //after phone call
    if(story == 3){
        missionText.innerHTML = "Gehe Kai, Henrik und Jan um einen Laptop anflehen"
        interactables[11].unlocked = true
    }
    //after hs2 dialogue
    if(story == 4 && once == 5 && isPlaying == false){
        missionText.innerHTML = "Schließ den rettenden Laptop an den Beamer an"
        closeText() //schließt overlay
        if(!inInventory.includes('Laptop mit Backup')){
            inInventory.push('Laptop mit Backup')
        }
        printInventory()
        interactables[4].unlocked = true //unlocks laptop
    }
    if(story == 5 && once == 6 && isPlaying == false){
        missionText.innerHTML = "Yoinke ein Kabel"
        if(!inInventory.includes('altes VGA Kabel')){
            inInventory.push('altes VGA Kabel')
        }
        printInventory()
        interactables[10].unlocked = true //unlocks TV
    }
    if(once == 7 && story == 6 && isPlaying == false){
        interactables[8].unlocked = true //unlocks cup
        missionText.innerHTML = "Hole die Kaffeetasse"
    }
    if(once == 8 && story == 6 && isPlaying ==false){
        //hier weiter mit kaffee maschine
    }
}

export {story, once, openText, closeText, overlayActive, startStory, updateStory, updateOnce}