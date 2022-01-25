
import * as THREE from 'https://cdn.skypack.dev/three@0.135.0'
import { FontLoader } from 'https://cdn.skypack.dev/three@0.135.0/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'https://cdn.skypack.dev/three@0.135.0/examples/jsm/geometries/TextGeometry.js'
import { mix } from '../Maths.js'

var lastRequest = []
var lastTime = 0
var state = 'ready'

var selfName = null

var font = null

const material = new THREE.MeshBasicMaterial({
	color: 'white',
	transparent: true,
	opacity: 0.7
})
	
const loader = new FontLoader()
loader.load('fonts/RobotoMono-Regular.json', f => { font = f })

function updateMultiplayer(scene, time, deltaTime, camera){
	
	// todo press t to open chat, send messages there, and then send them here

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
		localStorage.playerName = selfName
	}
	
	// if nobody is online, we need much less frequent updates
	// update 10x every second, if multiplayer is active
	const requestPeriod = players.children.length > 0 ? 0.1 : 2.0
	if(deltaTime > requestPeriod && state == 'ready' && font && selfName && selfName.length > 0){
		lastTime = time
		state = 'waiting'
		const x = new XMLHttpRequest()
		x.open("GET", "https://anionoa.uber.space/digitalcampus?"+
			"name="+encodeURIComponent(selfName)+
			"&x="+(camera.position.x*1)+
			"&y="+(camera.position.y*1)+
			"&z="+(camera.position.z*1)+
			"&rx="+(camera.rotation.x*1)+
			"&ry="+(camera.rotation.y*1))
		x.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
		x.onreadystatechange = function(){
			if(x.readyState == 4) state = 'ready'
			if(x.readyState == 4 && x.status == 200){
				// todo display messages
				var multiplayerData = JSON.parse(x.responseText)
				var playerList = multiplayerData.players
				// update / remove existing players
				for(var i=players.children.length-1;i>=0;i--){
					var player = players.children[i]
					var data = playerList[player.name]
					if(data){// update it
						player.targetPosition.set(data.x, data.y, data.z)
						// rotation has an offset of 180°, so the players texts look at each other, when the players
						// are looking at each other
						player.targetRotation.set(data.rx, data.ry + Math.PI, 0)
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
							mesh.targetPosition = new THREE.Vector3(data.x, data.y, data.z)
							mesh.targetRotation = new THREE.Vector3(data.rx, data.ry + Math.PI, 0)
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

export { updateMultiplayer }