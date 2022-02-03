import * as THREE from 'https://cdn.skypack.dev/three@0.135.0'
// import { OutlinePass } from 'https://cdn.skypack.dev/three@0.135.0/examples/jsm/postprocessing/OutlinePass.js';



import { placeLatLonObject, xToLon, yToHeight, zToLat } from './Coordinates.js'
import { printError, updateDownloadProgress } from '../UserInterface.js'

window.mixers = []

function fillScene(scene) {
	
	// our first model: the Abbeanum, Fröbelstieg 1
	glTFLoader.loadAsync('models/samples/abbeanum.glb', e => updateDownloadProgress('Abbeanum', e))
		.then(gltf => {
			const model = window.abbeanum = gltf.scene
			placeLatLonObject(model, 'Abbeanum', 50.9339769, 11.5804391, 182, +15)
			var scale = 1.3 // a guess
			model.scale.set(scale, scale, scale)
			outsideScene.add(model)
		})
		.catch(printError)
	
	// the terrain in front of the abbeanum
	glTFLoader.loadAsync('models/samples/abbeanumGround.glb', e => updateDownloadProgress('Abbeanum', e))
		.then(gltf => {
			const model = window.abbeanum = gltf.scene
			placeLatLonObject(model, 'AbbeanumGround', 50.9339769, 11.5804391, 182, +15)
			var scale = 1.3
			model.scale.set(scale, scale, scale)
			outsideScene.add(model)
		})
		.catch(printError)
	
	glTFLoader.loadAsync('models/samples/abbeanumDoorOnly.glb', e => updateDownloadProgress('AbbeanumDoorOnly', e))
	.then(gltf => {
		const model = window.abbeanum = gltf.scene
		
		placeLatLonObject(model, 'AbbeanumDoorEntrance', 50.93411238, 11.58074817, 183.243, +15)
		// 1.8253643247305833 1.2429999999999977 -20.141888888356544

		var scale = 1.3 // a guess
		model.scale.set(scale, scale, scale)
		model.visible = false
		//model.children[2].material.wireframe = true
		outsideScene.add(model)
		const abbeanumDoorExit = model.clone()
		abbeanumDoorExit.name = ''
		placeLatLonObject(abbeanumDoorExit, 'AbbeanumDoorExit', 50.93411372, 11.58075194, 183.243)
		flurScene.add(abbeanumDoorExit) // objects must be cloned, when you want to add them to multiple scenes
	})
	.catch(printError)

	glTFLoader.loadAsync('models/samples/stick.glb', e => updateDownloadProgress('stick', e))
	.then(gltf => {
		const model = gltf.scene
		placeLatLonObject(model, 'Stick', 50.93414679, 11.58076147, 182.882, 0)
		model.rotation.x += 10
		outsideScene.add(model)
	})
	.catch(printError)

	glTFLoader.loadAsync('models/samples/abbeanumInfoBoard.glb', e => updateDownloadProgress('stick', e))
	.then(gltf => {
		const model = gltf.scene
		placeLatLonObject(model, 'AbbeanumInfoBoard', 50.93413541, 11.58075170, 184.125, 10)
		outsideScene.add(model)
	})
	.catch(printError)


	glTFLoader.loadAsync('models/samples/abbeanumDoorOnly.glb', e => updateDownloadProgress('AbbeanumDoorOnly', e))
	.then(gltf => {
		const model = gltf.scene
		
		placeLatLonObject(model, 'HS1DoorEntrance', 50.93424072, 11.58049479, 185.863, -15)
		var scale = 1.3 // a guess
		model.scale.set(scale, scale, scale)
		 model.visible = false
		model.children[2].material.wireframe = true;
		const hs1DoorExit = model.clone()
		hs1DoorExit.name = 'HS1DoorExit'

		flurScene.add(model)
		hs1Scene.add(hs1DoorExit) // objects must be cloned, when you want to add them to multiple scenes
	})
	.catch(printError)

	glTFLoader.loadAsync('models/samples/campus-joined.glb', e => updateDownloadProgress('City Center', e))
		.then(gltf => {
			const model = gltf.scene
			placeLatLonObject(model, 'City Center', 50.9279284 + 0.0001, 11.5829607 - 0.00016, 150, 0)
			outsideScene.add(model)
		})
		.catch(printError)
	
	// ---------------------------------------------- CORRIDOR MODELS -------------------------------------------------
	
	// these two belong together:
	glTFLoader.loadAsync('models/samples/abbeanumInside.glb', e => updateDownloadProgress('abbeanumInside', e))
	.then(gltf => {
		const model = gltf.scene
		model.position.set(-9.8872, 3.8, -24.3727)
		model.rotation.set(0,0.1246,0)
		model.name = 'AbbeanumInside'
		//placeLatLonObject(model, 'ScannedAbbeanumInside', 50.93416130, 11.58060685, 185.800)
		const scale = 1.4 // a guess
		model.scale.set(scale, scale, scale)
		flurScene.add(model)
	})
	.catch(printError)
	glTFLoader.loadAsync('models/samples/abbeanumCorridorCollisions.glb', e => updateDownloadProgress('abbeanumCorridorCollisions', e))
	.then(gltf => {
		// needs to have the exact same coordinates as abbeanumInside, as it was based on it
		const model = gltf.scene
		model.position.set(-9.8872, 3.8, -24.3727)
		model.rotation.set(0,0.1246,0)
		model.name = 'AbbeanumCorridorCollisions'
		const scale = 1.4
		model.scale.set(scale, scale, scale)
		model.visible = false
		flurScene.add(model)
	})
	.catch(printError)
	

	fbxLoader.loadAsync('models/samples/movingPlant.fbx', e => updateDownloadProgress('movingPlant', e))
	.then(model => {
		placeLatLonObject(model, 'MovingPlant', 50.93409615, 11.58045500, 185.848-1.65, 0)
		const s = 0.2 / 100
		model.scale.set(s,s,s)
		const mixer = new THREE.AnimationMixer(model)
		mixer.clipAction(model.animations[0]).play()
		mixers.push(mixer)
		flurScene.add(model)
	})
	.catch(printError)
	
	fbxLoader.loadAsync('models/samples/spider.fbx', e => updateDownloadProgress('spider', e))
	.then(model => {
		placeLatLonObject(model, 'spider', 50.93408657, 11.58043987, 185.848-0.89, 0)
		console.log(model)
		const s = 0.2 / 70
		model.rotateY(90)
		model.scale.set(s,s,s)
		const mixer = new THREE.AnimationMixer(model)
		mixer.clipAction(model.animations[1]).play()
		mixers.push(mixer)
		flurScene.add(model)
	})
	.catch(printError)


	// ---------------------------------------------- HS1 MODELS -------------------------------------------------

	glTFLoader.loadAsync('models/samples/HS1.glb', e => updateDownloadProgress('abbeanumHS1', e))
	.then(gltf => {
		const model = gltf.scene
		placeLatLonObject(model, 'AbbeanumHS1', 50.93424364, 11.58059549, 186.333, 0)
		const scale = 1.4 // a guess
		model.scale.set(scale, scale, scale)
		hs1Scene.add(model)
	})
	.catch(printError)
	
	glTFLoader.loadAsync('models/samples/HS1Collisions.glb', e => updateDownloadProgress('HS1Collisions', e))
	.then(gltf => {
		const model = gltf.scene
		placeLatLonObject(model, 'HS1Collisions', 50.93424364, 11.58059549, 186.333, 0)
		const scale = 1.4 // the same as for the visual model
		model.scale.set(scale, scale, scale)
		model.visible = false
		hs1Scene.add(model)
	})
	.catch(printError)
	
	//TODO: place in the right scene (hs1) when models finished
	glTFLoader.loadAsync('models/samples/laptop.glb', e => updateDownloadProgress('laptop', e))
	.then(gltf => {
		const model = gltf.scene
		placeLatLonObject(model, 'Laptop', 50.93424693, 11.58070168, 184.212, -90)
		hs1Scene.add(model)
	})
	.catch(printError)


	glTFLoader.loadAsync('models/samples/laptop2.glb', e => updateDownloadProgress('laptop2', e))
	.then(gltf => {
		const model = gltf.scene
		placeLatLonObject(model, 'Laptop with Backup', 50.93424693, 11.58070168, 184.212, -90) //Laptop2 originally
		hs1Scene.add(model)
		model.visible = false
	})
	.catch(printError)


	glTFLoader.loadAsync('models/samples/cup.glb', e => updateDownloadProgress('cup', e))
	.then(gltf => {
		const model = gltf.scene
		placeLatLonObject(model, 'Cup', 50.93424200, 11.58070168, 184.232, 0)
		hs1Scene.add(model)
	})
	.catch(printError)

	glTFLoader.loadAsync('models/samples/beamer.glb', e => updateDownloadProgress('beamer', e))
	.then(gltf => {
		const model = gltf.scene
		placeLatLonObject(model, 'Beamer', 50.93425396, 11.58063980, 189.048, 180)
		hs1Scene.add(model)
	})
	.catch(printError)


	// they are not really at the right spot but this is an interaction dummy
	glTFLoader.loadAsync('models/samples/blackboards.glb', e => updateDownloadProgress('blackboards', e))
	.then(gltf => {
		const model = gltf.scene
		const s = 2
		model.scale.set(s,s,s)
		placeLatLonObject(model, 'Blackboards', 50.93423977, 11.58071961, 185.869, 0)
		model.visible = false
		hs1Scene.add(model)
	})
	.catch(printError)


	glTFLoader.loadAsync('models/samples/trashcan.glb', e => updateDownloadProgress('trashcan', e))
	.then(gltf => {
		const model = gltf.scene
		placeLatLonObject(model, 'Trashcan', 50.93423726, 11.58043197, 185.090, 90)
		flurScene.add(model)
	})
	.catch(printError)

}

export { fillScene }