
import * as THREE from 'https://cdn.skypack.dev/three@0.135.0'
import { FontLoader } from 'https://cdn.skypack.dev/three@0.135.0/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'https://cdn.skypack.dev/three@0.135.0/examples/jsm/geometries/TextGeometry.js'
import { mix } from '../Maths.js'

var lastRequest = []
var lastTime = 0
var state = 'ready'

var selfName = null

var font = null

var nextMessage = null

const material = new THREE.MeshBasicMaterial({
	color: 'white',
	transparent: true,
	opacity: 0.7
})
	
const loader = new FontLoader()
loader.load('fonts/RobotoMono-Regular.json', f => { font = f })

// https://stackoverflow.com/questions/11561595/does-javascript-have-an-equivalent-to-cs-httputility-htmlencode
function htmlEncode(s) {
  return (s+'').replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#39;')
    .replace(/"/g, '&#34;');
}

function sendMultiplayerMessage(message){
	// can be sent with the t-key currently
	nextMessage = message
}

var lastChatText = null

function updateMultiplayer(scene, time, deltaTime, camera){
	
	var deltaTime = Math.abs(time - lastTime) * 1e-3
	
	var players = scene.getObjectByName('players')
	if(!players){
		players = new THREE.Object3D()
		players.name = 'players'
		scene.add(players)
	}
	
	// empty string can be used to use the game offline
	if(!selfName && selfName != "" && scene.getObjectByName('Abbeanum')){
		// ask for the name, when the user is ready and sees the first stuff
		// we also could prevent duplicate names just by asking our api
		selfName = window.prompt("Your Multiplayer Name:", localStorage.playerName || '') || ""
		selfName = selfName.trim()
		localStorage.playerName = selfName
	}
	
	// if nobody is online, we need much less frequent updates
	// update 10x every second, if multiplayer is active
	const requestPeriod = players.children.length > 0 ? 0.1 : 2.0
	if(deltaTime > requestPeriod && state == 'ready' && font && selfName && selfName.length > 0){
		lastTime = time
		state = 'waiting'
		const x = new XMLHttpRequest()
		var requestURL = "https://anionoa.uber.space/digitalcampus?"+
			"name="+encodeURIComponent(selfName)+
			"&x="+(camera.position.x*1)+
			"&y="+(camera.position.y*1)+
			"&z="+(camera.position.z*1)+
			"&rx="+(camera.rotation.x*1)+
			"&ry="+(camera.rotation.y*1)
		if(nextMessage){
			requestURL += "&message=" + encodeURIComponent(nextMessage)
			console.log('sent message', nextMessage)
			nextMessage = null
		}
		x.open("GET", requestURL)
		x.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
		x.onreadystatechange = function(){
			if(x.readyState == 4) state = 'ready'
			if(x.readyState == 4 && x.status == 200){
				var data = JSON.parse(x.responseText)
				// display messages
				const messages = window.messages = data.messages
				const chatText = messages.map(msg => '<p>['+htmlEncode(msg.sender)+'] '+htmlEncode(msg.message)+'</p>').join('')
				if(chatText != lastChatText){
					document.getElementById('chat').innerHTML = chatText
					lastChatText = chatText
				}
				const playerList = data.players
				// update / remove existing players
				for(var i=players.children.length-1;i>=0;i--){
					var player = players.children[i]
					var data = playerList[player.name]
					if(data){// update it
						player.targetPosition.set(data.x, data.y, data.z)
						// rotation has an offset of 180°, so the players texts look at each other, when the players
						// are looking at each other, similarly for rx
						player.targetRotation.set(-data.rx, data.ry + Math.PI, 0)
					} else {// disconnected, remove it
						players.remove(player)
						console.log(player.name+" left the game")
					}
				}
				// add new players
				for(var playerName in playerList){
					if(playerName != selfName){
						// spawn name
						const instance = players.getObjectByName(playerName)
						if(!instance){
							console.log(playerName+" joined the game")
							const data = playerList[playerName]
							const geometry = new TextGeometry(playerName, {
								font: font,
								size: 0.2,
								height: 0.01,
								curveSegments: 12,
								bevelEnabled: true,
								bevelThickness: 0.005,
								bevelSize: 0.005,
								bevelOffset: 0,
								bevelSegments: 5
							})
							const mesh = new THREE.Mesh(geometry, material)
							mesh.name = playerName
							mesh.position.set(data.x, data.y, data.z)
							mesh.rotation.order = 'YXZ' // the same as for camera
							mesh.rotation.set(data.rx, data.ry, 0)
							mesh.targetPosition = new THREE.Vector3( data.x, data.y, data.z)
							mesh.targetRotation = new THREE.Vector3(-data.rx, data.ry + Math.PI, 0)
							players.add(mesh)
						}
					}
				}
			}
		}
		x.send()
	}
	
	// the larger the smoothness, the smoother, but also less detailed the movement of other players will be
	const lerpSmoothness = 3
	const lerpFactor = Math.min(1, deltaTime * lerpSmoothness)
	function lerp3(a, b, f){
		a.set(
			mix(a.x, b.x, f),
			mix(a.y, b.y, f),
			mix(a.z, b.z, f)
		)
	}
	players.children.forEach(player => {
		// for rotation, there is no lerp function directly
		lerp3(player.position, player.targetPosition, lerpFactor)
		lerp3(player.rotation, player.targetRotation, lerpFactor)
	})
	
}

export { updateMultiplayer, sendMultiplayerMessage }