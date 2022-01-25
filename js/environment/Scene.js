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
	glTFLoader.loadAsync('models/samples/scannedAbbeanumInside.glb', e => updateDownloadProgress('scannedAbbeanumInside', e))
	.then(gltf => {
		const model = gltf.scene
		model.position.set(-9.8872, 3.8, -24.3727)
		model.rotation.set(0,0.1246,0)
		model.name = 'ScannedAbbeanumInside'
		//placeLatLonObject(model, 'ScannedAbbeanumInside', 50.93416130, 11.58060685, 185.800)
		const scale = 1.4 // a guess
		model.scale.set(scale, scale, scale)
		flurScene.add(model)
	})
	.catch(printError)
	glTFLoader.loadAsync('models/samples/abbeanumCorridorCollisions.glb', e => updateDownloadProgress('abbeanumCorridorCollisions', e))
	.then(gltf => {
		const model = gltf.scene
		// move the corridor approximately to the right spot
		model.position.set(-9.8872, 3.8, -24.3727)
		model.name = 'AbbeanumFlurCollisions'
		const scale = 1.4 // a guess
		model.scale.set(scale, scale, scale)
		model.visible = false
		flurScene.add(model)
	})
	.catch(printError)
	
	glTFLoader.loadAsync('models/samples/laptop2.glb', e => updateDownloadProgress('laptop2', e))
	.then(gltf => {
		const model = gltf.scene
		placeLatLonObject(model, 'Laptop with Backup', 50.93432885, 11.58047634, 185.848, 280) //Laptop2 originally
		flurScene.add(model)
	})
	.catch(printError)


	glTFLoader.loadAsync('models/samples/stick.glb', e => updateDownloadProgress('stick', e))
	.then(gltf => {
		const model = gltf.scene
		placeLatLonObject(model, 'Stick', 50.93427524, 11.58043603, 185.848, 0)
		flurScene.add(model)
	})
	.catch(printError)

	// ---------------------------------------------- HS1 MODELS -------------------------------------------------

	glTFLoader.loadAsync('models/samples/abbeanumHS1.glb', e => updateDownloadProgress('abbeanumHS1', e))
	.then(gltf => {
		const model = gltf.scene
		placeLatLonObject(model, 'AbbeanumHS1', 50.93422322, 11.58062523, 187.200, 271)
		// model.position.set(-4.4474, 5.2, -32.578)
		// model.rotation.set(-Math.PI, 4.7316, -Math.PI)
		const scale = 1.4 // a guess
		model.scale.set(scale, scale, scale)
		hs1Scene.add(model)
	})
	.catch(printError)
	
	//TODO: place in the right scene (hs1) when models finished
	glTFLoader.loadAsync('models/samples/laptop.glb', e => updateDownloadProgress('laptop', e))
	.then(gltf => {
		const model = gltf.scene
		placeLatLonObject(model, 'Laptop', 50.93432504, 11.58052835, 185.848, 200)
		flurScene.add(model)
	})
	.catch(printError)

	glTFLoader.loadAsync('models/samples/cup.glb', e => updateDownloadProgress('cup', e))
	.then(gltf => {
		const model = gltf.scene
		placeLatLonObject(model, 'Cup', 50.93413413, 11.58042886, 185.848, 0)
		flurScene.add(model)
	})
	.catch(printError)

	fbxLoader.loadAsync('models/samples/movingPlant.fbx', e => updateDownloadProgress('movingPlant', e))
	.then(model => {
		placeLatLonObject(model, 'MovingPlant', 50.93409615, 11.58045500, 185.848-1.65, 0)
		const s = 0.2 / 100
		model.scale.set(s,s,s)
		console.log(model)
		const mixer = new THREE.AnimationMixer(model)
		mixer.clipAction(model.animations[0]).play()
		mixers.push(mixer)
		flurScene.add(model)
	})
	.catch(printError)

	glTFLoader.loadAsync('models/samples/blackboards.glb', e => updateDownloadProgress('blackboards', e))
	.then(gltf => {
		const model = gltf.scene
		placeLatLonObject(model, 'Blackboards', 50.93417864, 11.58042821, 185.848, 350)
		flurScene.add(model)
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