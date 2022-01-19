
import * as THREE from 'https://cdn.skypack.dev/three@0.135.0'
import { FontLoader } from 'https://cdn.skypack.dev/three@0.135.0/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'https://cdn.skypack.dev/three@0.135.0/examples/jsm/geometries/TextGeometry.js'

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

	var deltaTime = Math.abs(time - lastTime) * 1e-3
	
	var players = scene.getObjectByName('players')
	if(!players){
		players = new THREE.Object3D()
		players.name = 'players'
		scene.add(players)
	}
	
	// empty string can be used to use the game offline
	if(!selfName && selfName != '' && scene.getObjectByName('Abbeanum')){
		// ask for the name, when the user is ready and sees the first stuff
		// we also could prevent duplicate names just by asking our api
		selfName = window.prompt("Your Multiplayer Name:")
	}
	
	// if nobody is online, we need much less frequent updates
	const requestPeriod = players.children.length > 0 ? 0.1 : 2.0
	if(deltaTime > requestPeriod && state == 'ready' && font && selfName && selfName.length > 0){
		// update 10x every second
		lastTime = time
		state = 'waiting'
		const x = new XMLHttpRequest()
		x.open("GET", "https://anionoa.uber.space/?"+
			"name="+encodeURIComponent(selfName)+
			"&x="+(camera.position.x*1)+
			"&y="+(camera.position.y*1)+
			"&z="+(camera.position.z*1))
		x.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
		x.onreadystatechange = function(){
			if(x.readyState==4) state = 'ready'
			if(x.readyState==4 && x.status==200){
				var multiplayerData = JSON.parse(x.responseText)
				for(var i=players.children.length-1;i>=0;i--){
					var player = players.children[i]
					var data = multiplayerData[player.name]
					if(data){
						// ok, update it
						player.target.set(data.x, data.y, data.z)
					} else {
						// disconnected, remove it
						players.remove(player)
						console.log(player.name+" left the game")
					}
				}
				for(var playerName in multiplayerData){
					if(playerName != selfName){
						// spawn name
						const instance = players.getObjectByName(playerName)
						if(!instance){
							console.log(playerName+" joined the game")
							const data = multiplayerData[playerName]
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
							mesh.target = new THREE.Vector3(data.x, data.y, data.z)
							players.add(mesh)
						}
					}
				}
			}
		}
		x.send()
	}
	
	const lerpFactor = Math.min(1, deltaTime * 3)
	players.children.forEach(player => {
		player.position.lerp(player.target, lerpFactor)
		player.lookAt(camera.position)
	})
	
}

export { updateMultiplayer }