
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

	glTFLoader.loadAsync('models/samples/HS3.glb', e => updateDownloadProgress('HS3', e))
	.then(gltf => {
		const model = gltf.scene
		// move to random spot
		placeLatLonObject(model, 'HS3', 50.9339769-0.00001, 11.5804391-0.000029, 182, +15)
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


}

export { fillScene }