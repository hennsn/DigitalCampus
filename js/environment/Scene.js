import * as THREE from 'https://cdn.skypack.dev/three@0.135.0'

import { placeLatLonObject } from './Coordinates.js'
import { printError, updateDownloadProgress } from '../UserInterface.js'

function fillScene(scene) {
	
	// our first model: the Abbeanum, Fröbelstieg 1
	glTFLoader.loadAsync('models/samples/Abbeanum.glb', e => updateDownloadProgress('Abbeanum', e))
		.then(gltf => {
			const model = window.abbeanum = gltf.scene
			placeLatLonObject(model, 'Abbeanum', 50.9339769, 11.5804391, 182, +15)
			var scale = 1.3 // a guess
			model.scale.set(scale, scale, scale)
			scene.add(model)
		})
		.catch(printError)
	
	glTFLoader.loadAsync('models/samples/AbbeanumGround.glb', e => updateDownloadProgress('Abbeanum', e))
		.then(gltf => {
			const model = window.abbeanum = gltf.scene
			placeLatLonObject(model, 'AbbeanumGround', 50.9339769, 11.5804391, 182, +15)
			var scale = 1.3
			model.scale.set(scale, scale, scale)
			scene.add(model)
		})
		.catch(printError)
	
	glTFLoader.loadAsync('models/samples/AbbeanumDoorOnly.glb', e => updateDownloadProgress('AbbeanumDoorOnly', e))
	.then(gltf => {
		const model = window.abbeanum = gltf.scene
		placeLatLonObject(model, 'AbbeanumDoor', 50.9339769, 11.5804391, 182, +15)
		var scale = 1.3 // a guess
		model.scale.set(scale, scale, scale)
		scene.add(model)
		model.visible = false
	})
	.catch(printError)

	glTFLoader.loadAsync('models/samples/campus-joined.glb', e => updateDownloadProgress('City Center', e))
		.then(gltf => {
			const model = gltf.scene
			placeLatLonObject(model, 'City Center', 50.9279284 + 0.0001, 11.5829607 - 0.00016, 150, 0)
			scene.add(model)
		})
		.catch(printError)
	

	glTFLoader.loadAsync('models/samples/AbbeanumFlurCollisions.glb', e => updateDownloadProgress('AbbeanumFlurCollisions', e))
	.then(gltf => {
		const model = gltf.scene
		// move the corridor approximately to the right spot
		model.position.set(-8.070218779393336, 3.8000000000000007, -25.577777777269173)
		model.name = 'AbbeanumFlurCollisions'
		const scale = 1.4 // a guess
		model.scale.set(scale, scale, scale)
		model.visible = false
		scene.add(model)
	})
	.catch(printError)

	glTFLoader.loadAsync('models/samples/AbbeanumHS1.glb', e => updateDownloadProgress('AbbeanumHS1', e))
	.then(gltf => {
		const model = gltf.scene
		model.position.set(-4.447491982365474, 5.1999999999999975, -32.57777777689315)
		model.rotation.set(-3.141592653589793, 4.731592653589793, -3.141592653589793)

		model.name = 'AbbeanumHS1'
		const scale = 1.4 // a guess
		model.scale.set(scale, scale, scale)
		model.visible = false
		scene.add(model)
	})
	.catch(printError)


	glTFLoader.loadAsync('models/samples/ScannedAbbeanumInside.glb', e => updateDownloadProgress('ScannedAbbeanumInside', e))
	.then(gltf => {
		const model = gltf.scene
		model.position.set(-8.070218779393336, 3.8000000000000007, -25.577777777269173)
		model.name = 'ScannedAbbeanumInside'
		const scale = 1.4 // a guess
		model.scale.set(scale, scale, scale)
		model.visible = false
		scene.add(model)
	})
	.catch(printError)


	glTFLoader.loadAsync('models/samples/ScannedAbbeanumInside.glb', e => updateDownloadProgress('ScannedAbbeanumInside', e))
	.then(gltf => {
		const model = gltf.scene
		model.position.set(-8.070218779393336, 3.8000000000000007, -25.577777777269173)
		model.name = 'ScannedAbbeanumInside'
		const scale = 1.4 // a guess
		model.scale.set(scale, scale, scale)
		model.visible = false
		scene.add(model)
	})
	.catch(printError)


	glTFLoader.loadAsync('models/samples/Laptop.glb', e => updateDownloadProgress('Laptop', e))
	.then(gltf => {
		const model = gltf.scene
		model.position.set(7.2525284107715935, 0.949415911263972, -21.716083277168504)
		model.name = 'Laptop'
		//const scale = 1.4 // a guess
		//model.scale.set(scale, scale, scale)
		model.visible = true
		scene.add(model)
	})
	.catch(printError)


	glTFLoader.loadAsync('models/samples/stock.glb', e => updateDownloadProgress('Stick', e))
	.then(gltf => {
		const model = gltf.scene
		model.position.set(7.2525284107715935, 0.949415911263972, -21.716083277168504)
		model.name = 'Stick'
		//const scale = 1.4 // a guess
		//model.scale.set(scale, scale, scale)
		model.visible = true
		scene.add(model)
	})
	.catch(printError)

/* something is funky about the trashcan
	glTFLoader.loadAsync('models/samples/Trashcan.glb', e => updateDownloadProgress('Trashcan', e))
	.then(gltf => {
		const model = gltf.scene
		model.position.set(-128.17562068967146, -8.389054586305152, 84.08548520059321)
		model.name = 'Trashcan'
		const scale = 10 // a guess
		model.scale.set(scale, scale, scale)
		model.visible = true
		scene.add(model)
	})
	.catch(printError)
*/

}

export { fillScene }