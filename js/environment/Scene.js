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
	glTFLoader.loadAsync('models/samples/abbeanum_ground.glb', e => updateDownloadProgress('Abbeanum', e))
		.then(gltf => {
			const model = window.abbeanum = gltf.scene
			placeLatLonObject(model, 'AbbeanumGround', 50.9339769, 11.5804391, 182, +15)
			var scale = 1.3
			model.scale.set(scale, scale, scale)
			outsideScene.add(model)
		})
		.catch(printError)
	
	
	// Formerly AbbeanumDoorOnly -> renamed to InteractionRectanguloid so it can be resized and reused for any
	// interactable surface
	glTFLoader.loadAsync('models/samples/interaction_cuboid.glb', e => updateDownloadProgress('InteractionCuboid', e))
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

		const tvCuboid = model.clone()
		tvCuboid.name = ''
		tvCuboid.scale.set(1.3,0.7,1.3)
		placeLatLonObject(tvCuboid, 'TvCuboid', 50.93409346, 11.58043388, 186.776, 10)
		flurScene.add(tvCuboid)
		
		const HS2DoorDummy = model.clone()
		placeLatLonObject(HS2DoorDummy, 'HS2DoorDummy', 50.93406258, 11.58054770, 186.776, 10)
		flurScene.add(HS2DoorDummy)

		const bathroomDoorDummyBasement = model.clone()
		placeLatLonObject(bathroomDoorDummyBasement, 'BathroomDoorDummyBasement', 50.93403072, 11.58052132, 182.666, 10)
		bathroomDoorDummyBasement.scale.set(1,1.7,1.2)

		flurScene.add(bathroomDoorDummyBasement)


		const bathroomDoorDummyUpstairs = model.clone()
		placeLatLonObject(bathroomDoorDummyUpstairs, 'BathroomDoorDummyUpstairs', 50.93434830, 11.58048668, 185.792, 69) // if you know what i'm saying
		bathroomDoorDummyUpstairs.scale.set(1,1.7,1.2)

		flurScene.add(bathroomDoorDummyUpstairs)

		const preproomDoorDummy = model.clone()
		placeLatLonObject(preproomDoorDummy, 'PreproomDoorDummy',  50.93413028, 11.58053525, 185.693, 10)
		preproomDoorDummy.scale.set(1,1.8,1.3)
		flurScene.add(preproomDoorDummy)
		
	})
	.catch(printError)

	glTFLoader.loadAsync('models/samples/stick.glb', e => updateDownloadProgress('stick', e))
	.then(gltf => {
		const model = gltf.scene
		placeLatLonObject(model, 'Stock', 50.93414679, 11.58076147, 182.882, 0)
		model.rotation.x += 10
		outsideScene.add(model)
	})
	.catch(printError)

	glTFLoader.loadAsync('models/samples/abbeanum_infoboard.glb', e => updateDownloadProgress('stick', e))
	.then(gltf => {
		const model = gltf.scene
		placeLatLonObject(model, 'AbbeanumInfoBoard', 50.93413541, 11.58075170, 184.125, 10)
		outsideScene.add(model)
	})
	.catch(printError)

	glTFLoader.loadAsync('models/samples/dumpster_universal.glb', e => updateDownloadProgress('DumpsterUniversal', e))
	.then(gltf => {
		var scale = 0.4
		var model = window.dumpster = gltf.scene
		model.scale.set(scale, scale, scale)
		placeLatLonObject(model, 'DumpsterBlue', 50.93409359, 11.58079671, 182.33, 195)
		outsideScene.add(model)
		model = model.clone()
		model.traverse(obj => {// color it yellow
			if(obj.name == 'Cube001' || obj.name == 'Cube002'){
				obj.material = obj.material.clone()
				obj.material.color.setHex(0xd6c214)
			}
		})
		placeLatLonObject(model, 'DumpsterYellow', 50.93408028, 11.58080344, 182.32, 190)
		outsideScene.add(model)
		model = model.clone()
		model.traverse(obj => {// color it green
			if(obj.name == 'Cube001' || obj.name == 'Cube002'){
				obj.material = obj.material.clone()
				obj.material.color.setHex(0x1b5b0b)
			}
		})
		placeLatLonObject(model, 'DumpsterGreen', 50.93406753, 11.58080270, 182.245, 180)
		outsideScene.add(model)
	})
	.catch(printError)
	
	
	glTFLoader.loadAsync('models/samples/dumpster_collision.glb', e => updateDownloadProgress('DumpsterCollision', e))
	.then(gltf => {// these coordinates need to be the same as above!
		var scale = 0.4
		var model = gltf.scene
		model.visibility = false
		model.scale.set(scale, scale, scale)
		placeLatLonObject(model, 'DumpsterBlueCollision', 50.93409359, 11.58079671, 182.33, 195)
		outsideScene.add(model)
		model = model.clone()
		placeLatLonObject(model, 'DumpsterYellowCollision', 50.93408028, 11.58080344, 182.32, 190)
		outsideScene.add(model)
		model = model.clone()
		placeLatLonObject(model, 'DumpsterGreenCollision', 50.93406753, 11.58080270, 182.245, 180)
		outsideScene.add(model)
	})
	.catch(printError)


	glTFLoader.loadAsync('models/samples/interaction_cuboid.glb', e => updateDownloadProgress('HS1Entrance', e))
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

	glTFLoader.loadAsync('models/samples/campus_joined.glb', e => updateDownloadProgress('City Center', e))
		.then(gltf => {
			const model = gltf.scene
			placeLatLonObject(model, 'City Center', 50.9279284 + 0.0001, 11.5829607 - 0.00016, 150, 0)
			outsideScene.add(model)
		})
		.catch(printError)
	
	// ---------------------------------------------- CORRIDOR MODELS -------------------------------------------------
	
	// these two belong together:
	glTFLoader.loadAsync('models/samples/abbeanum_inside.glb', e => updateDownloadProgress('abbeanumInside', e))
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


	glTFLoader.loadAsync('models/samples/abbeanum_corridor_collisions.glb', e => updateDownloadProgress('abbeanumCorridorCollisions', e))
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
	

	fbxLoader.loadAsync('models/samples/moving_plant.fbx', e => updateDownloadProgress('movingPlant', e))
	.then(model => {
		placeLatLonObject(model, 'MovingPlant', 50.93410364, 11.58043476, 184.518, 0)
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
		placeLatLonObject(model, 'spider', 50.93408137-0.0000015, 11.58043973-0.000005, 187.6, 0)
		console.log(model)
		const s = 0.3 / 70
		model.rotateY(-0.05869048965668795)
		model.rotateX(-2.519544938372642)
		model.rotateZ(-0.8419399335047579)
		
		model.scale.set(s,s,s)
		const mixer = new THREE.AnimationMixer(model)
		mixer.clipAction(model.animations[3]).play()
		mixers.push(mixer)
		flurScene.add(model)
	})
	.catch(printError)




	glTFLoader.loadAsync('models/samples/coffee_machine.glb', e => updateDownloadProgress('coffeeMachine', e))
	.then(gltf => {
		const model = gltf.scene
		placeLatLonObject(model, 'CoffeeMachine' , 50.93416101, 11.58047837, 185.895, 270)

		const scale = 1.4
		model.scale.set(scale, scale, scale)
		flurScene.add(model)
	})
	.catch(printError)


	glTFLoader.loadAsync('models/samples/wet_floor_sign.glb', e => updateDownloadProgress('wetFloorSign', e))
	.then(gltf => {
		const model = gltf.scene
		placeLatLonObject(model, 'WetFloorSign' , 50.93398735, 11.58047673, 184.520, 10)
		// make it wide
		model.scale.set(3.5, 1.5, 2)
		flurScene.add(model)
	})
	.catch(printError)


	// ---------------------------------------------- HS1 MODELS -------------------------------------------------

	glTFLoader.loadAsync('models/samples/hs1.glb', e => updateDownloadProgress('abbeanumHS1', e))
	.then(gltf => {
		const model = gltf.scene
		placeLatLonObject(model, 'AbbeanumHS1', 50.93424364, 11.58059549, 186.333, 0)
		const scale = 1.4 // a guess
		model.scale.set(scale, scale, scale)
		hs1Scene.add(model)
	})
	.catch(printError)
	
	glTFLoader.loadAsync('models/samples/hs1_collisions.glb', e => updateDownloadProgress('HS1Collisions', e))
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
	glTFLoader.loadAsync('models/samples/laptop1.glb', e => updateDownloadProgress('laptop', e))
	.then(gltf => {
		const model = gltf.scene
		placeLatLonObject(model, 'Laptop', 50.93424693, 11.58070168, 184.212, -90)
		hs1Scene.add(model)
	})
	.catch(printError)


	glTFLoader.loadAsync('models/samples/laptop2.glb', e => updateDownloadProgress('laptop2', e))
	.then(gltf => {
		const model = gltf.scene
		placeLatLonObject(model, 'Laptop2', 50.93424693, 11.58070168, 184.212, -90) //rename no longer needed
		hs1Scene.add(model)
		model.visible = false
	})
	.catch(printError)


	glTFLoader.loadAsync('models/samples/cup.glb', e => updateDownloadProgress('cup', e))
	.then(gltf => {
		const model = gltf.scene
		placeLatLonObject(model, 'Kaffeetasse', 50.93430969, 11.58055729, 185.247, 0) //ehemals Cup
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