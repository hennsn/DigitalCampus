import { placeLatLonObject } from './Coordinates.js'
import { printError, updateDownloadProgress } from '../UserInterface.js'


function fillScene(scene, collisionScene) {
	const collisionUpscale = 0.01
	// our first model: the Abbeanum, Fröbelstieg 1
	glTFLoader.loadAsync('models/samples/Abbeanum.glb', e => updateDownloadProgress('Abbeanum', e))
		.then(gltf => {
			const model = window.abbeanum = gltf.scene
			const collisionModel = model.clone()
			placeLatLonObject(model, 'Abbeanum', 50.9339769, 11.5804391, 182, +15)
			placeLatLonObject(collisionModel, 'Abbeanum', 50.9339769, 11.5804391, 182, +15)
			var scale = 1.25 // a guess
			model.scale.set(scale, scale, scale)
			collisionModel.scale.set(scale+collisionUpscale,scale+collisionUpscale,scale+collisionUpscale)
			scene.add(model)
			collisionScene.add(collisionModel)
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
			//const collisionModel = model.clone()
			//collisionModel.scale.set(1+collisionUpscale,1+collisionUpscale,1+collisionUpscale)
			placeLatLonObject(model, 'City Center', 50.9279284 + 0.0001, 11.5829607 - 0.00016, 150, 0)
			//placeLatLonObject(collisionModel, 'City Center', 50.9279284 + 0.0001, 11.5829607 - 0.00016, 150, 0)
			scene.add(model)
			//collisionScene.add(collisionModel)
		})
		.catch(printError)
	
}

export { fillScene }