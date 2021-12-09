
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
	
	glTFLoader.loadAsync('models/samples/campus-joined.glb', e => updateDownloadProgress('City Center', e))
		.then(gltf => {
			const model = gltf.scene
			placeLatLonObject(model, 'City Center', 50.9279284 + 0.0001, 11.5829607 - 0.00016, 150, 0)
			scene.add(model)
		})
		.catch(printError)
	
}

export { fillScene }