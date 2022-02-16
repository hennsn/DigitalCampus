
import * as THREE from 'https://cdn.skypack.dev/three@0.135.0'
import { mix, degToRad } from './Maths.js'

//boolean to check if audio is playing
let isPlaying = false
let audioStory
let audio
let setback
let doNow = false

function printError(error, printToUser){
	console.error(error)
	// todo print to user, if not 0
}

const inProgress = window.inProgress = {}
showOverlay = window.showOverlay =  false
var timeFinished = 0
var wasFinished = false
var opacity = 1
var width = 0
var progressBar = document.getElementById("progressBar")
var loadingOverlay = document.getElementById("loadingOverlay")
function updateDownloadProgress(name, progressEvent){
	if(progressEvent.total){
		progressEvent.lastUpdate = new Date().getTime()
		inProgress[name] = progressEvent
	}
}

function showLoadinOverlay(milliseconds){
	//loadingOverlay.style.removeProperty('animation')
	showOverlay = true
	loadingOverlay.style.animation = ""
	setTimeout(() => {showOverlay = false}, milliseconds)
}

function updateDownloadBar(dt){

	var loaded = 0
	var total = 0
	
	// collect progress
	var timeout = 10 // seconds
	var timeoutTime = new Date().getTime() - timeout * 1e3
	var removedKeys = []
	for(var key in inProgress){
		var value = inProgress[key]
		if(value.loaded < value.total && value.lastUpdate < timeoutTime){
			// this progress-part is canceled, because the connections was broken probably; when the connection is truly broken, we'll get an event too
			removedKeys.push(key)
		} else {
			loaded += value.loaded
			total += value.total
		}
	}
	removedKeys.forEach(key => delete inProgress[key])
	
	// update isFinished, wasFinished, timeFinished
	const isFinished = loaded >= total
	if(isFinished && !wasFinished){
		wasFinished = true
		timeFinished = new Date().getTime()
	}
	if(!isFinished) wasFinished = false
	
	// display the current state
	const targetOpacity = total ? isFinished ? 0 : 1 : 0
	const targetWidth = loaded*100/(total || 1)
	const mixSpeed = 3 * dt
	width = targetWidth > width ? mix(width, targetWidth, mixSpeed) : targetWidth
	opacity = mix(opacity, targetOpacity, mixSpeed)
	if(opacity * 256 > 1){
		loadingOverlay.style.display = ''
		progressBar.style.width = (0.1 + 0.9 * width) + '%' // 10% are shown at least, so that the bar is always visible when loading
		progressBar.style.backgroundColor = 'rgba(158,100,255,'+opacity+')'
		progressBar.style.display = ''
	} else {

		progressBar.style.display = 'none'

		// hide the overlay but smoothly
		if (!showOverlay){
			loadingOverlay.style.animation = 'fadeOut ease 1s forwards'
		}
		//loadingOverlay.style.display = 'none'

	} // invisible
}

function handleUserInterface(dt){
	updateDownloadBar(dt)
}

function playAudioTrack(srcUrl){
	audio = new Audio(srcUrl) //var audio
	audio.play()
	return audio
}

function playStoryTrack(srcUrl){
	isPlaying = true
	audioStory = new Audio(srcUrl) 
	audioStory.play()
	audioStory.onloadedmetadata = function(){
		console.log(audioStory.duration)
	}
	audioStory.addEventListener("ended", function(){
		console.log('story audio ended')
		isPlaying = false
	})
	return audioStory
}

function stopStoryTrack(audioStory) {
    audioStory.pause();
    audioStory.currentTime = 0;
}

//doesn't work
function queueAudioEvent(setback){
	console.log('setback: ', setback)
	audioStory.onloadedmetadata = function(){
		console.log(audioStory.duration)
		console.log(audioStory.currentTime)
	}
}

var lastCorners = null
function createCorners(obj){
	if(lastCorners) removeCorners(lastCorners)
	lastCorners = obj
	if(!obj) return
	var template = window.cornerTemplate
	// get bounding box
	// create 8 corners in bounding box
	// rotation [x,y,z], position [dx,dy,dz]
	// rotate towards?
	var corners = [
		[-90,90,0,+1,+1,+1],
		[+90,+90,+90,+1,+1,-1],
		[0,90,0,+1,-1,+1],
		[0,180,0,+1,-1,-1],
		[-90,0,0,-1,+1,+1],
		[0,-90,-90,-1,+1,-1],
		[0,0,0,-1,-1,+1],
		[0,-90,0,-1,-1,-1],
	]
	var bbox = new THREE.Box3().setFromObject(obj)
	var bmin = bbox.min
	var bmax = bbox.max
	// find scale for corners
	var scale = 0.3 * Math.min(bmax.x - bmin.x, Math.min(bmax.y - bmin.y, bmax.z-bmin.z))
	for(var i=0;i<corners.length;i++){
		var clone = template.clone()
		clone.name = 'Corner'
		var c = corners[i]
		clone.scale.set(scale, scale, scale)
		clone.rotation.set(
			degToRad * c[0],
			degToRad * c[1],
			degToRad * c[2]
		)
		clone.position.set(
			mix(bmin.x, bmax.x, c[3]*.5+.5),
			mix(bmin.y, bmax.y, c[4]*.5+.5),
			mix(bmin.z, bmax.z, c[5]*.5+.5)
		)
		obj.parent.add(clone)
	}
}

function removeCorners(obj){
	obj = obj.parent
	for(var i=obj.children.length-1;i>=0;i--){
		var child = obj.children[i]
		if(child.name == 'Corner'){
			obj.remove(child)
		}
	}
}

export { printError, handleUserInterface, updateDownloadProgress, playAudioTrack, playStoryTrack, stopStoryTrack, createCorners, showLoadinOverlay, isPlaying, audio, audioStory, queueAudioEvent, doNow}