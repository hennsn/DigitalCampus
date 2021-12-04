
import { placeLatLonObject } from './Coordinates.js'
import { printError } from '../UserInterface.js'

function fillScene(scene){
	
	// our first model: the Abbeanum, Fröbelstieg 1
	glTFLoader.load('models/samples/Abbeanum (teils texturiert).glb', (gltf) => {
		const model = window.abbeanum = gltf.scene
		placeLatLonObject(model, 'Abbeanum', 50.9339769, 11.5804391, 182, +15)
		var scale = 2.8 // a guess
		model.scale.set(scale, scale, scale)
		scene.add(model)
	}, undefined, printError)
	
}

export { fillScene }