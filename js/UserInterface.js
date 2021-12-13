
import { mix } from './Maths.js'

function printError(error, printToUser){
	console.error(error)
	// todo print to user, if not 0
}

const inProgress = window.inProgress = {}
var timeFinished = 0
var wasFinished = false
var opacity = 1
var width = 0
function updateDownloadProgress(name, progressEvent){
	if(progressEvent.total){
		progressEvent.lastUpdate = new Date().getTime()
		inProgress[name] = progressEvent
	}
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
		progressBar.style.width = (0.1 + 0.9 * width) + '%' // 10% are shown at least, so that the bar is always visible when loading
		progressBar.style.backgroundColor = 'rgba(158,100,255,'+opacity+')'
		progressBar.style.display = ''
	} else progressBar.style.display = 'none' // invisible
}

function handleUserInterface(dt){
	updateDownloadBar(dt)
}

export { printError, handleUserInterface, updateDownloadProgress }