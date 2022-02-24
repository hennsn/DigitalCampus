import * as THREE from 'https://cdn.skypack.dev/three@0.135.0'

// ---------------------------------------------- CORRIDOR MODELS -------------------------------------------------

import {printError, updateDownloadProgress} from "../../UserInterface.js";
import {placeLatLonObject} from "../Coordinates.js";


function fillAbbeanumCorridorScene(){
		
        // these two belong together:
		glTFLoader.loadAsync('models/samples/abbeanum_inside_v2.glb', e => updateDownloadProgress('abbeanumInside', e))
		.then(gltf => {
			const model = gltf.scene
			placeLatLonObject(model, 'AbbeanumInside', 50.9341504543, 11.580580902721955, 185.8, 7.139)
			const scale = 1.4 // a guess
			model.scale.set(scale, scale, scale)
			flurScene.add(model)
		})
		.catch(printError)


		glTFLoader.loadAsync('models/samples/abbeanum_inside_collisions.glb', e => updateDownloadProgress('abbeanumCorridorCollisions', e))
		.then(gltf => {
			// needs to have the exact same coordinates as abbeanumInside, as it was based on it
			const model = gltf.scene
			placeLatLonObject(model, 'AbbeanumCorridorCollisions', 50.9341504543, 11.580580902721955, 185.8, 7.139)
			const scale = 1.4
			model.scale.set(scale, scale, scale)
			model.visible = false
			flurScene.add(model)
		})
		.catch(printError)

        glTFLoader.loadAsync('models/samples/flyer.glb', e => updateDownloadProgress('flyer', e))
            .then(gltf => {
                    const model = gltf.scene
                    placeLatLonObject(model, 'Flyer',  50.93413136, 11.58053499, 186.608, 186)
                    model.scale.set(1,3,3)
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

        fbxLoader.loadAsync('models/samples/snake/snake.FBX', e => updateDownloadProgress('snake', e))
            .then(model => {
                    placeLatLonObject(model, 'snake', 50.93405321, 11.58083749, 183.463-1.4, 0)
                    const s = 0.6 / 70

                    model.scale.set(s,s,s)
                    const mixer = new THREE.AnimationMixer(model)
                    mixer.clipAction(model.animations[0]).play()
                    mixers.push(mixer)
                    outsideScene.add(model)
            })
            .catch(printError)

        fbxLoader.loadAsync('models/samples/bot/bot.fbx', e => updateDownloadProgress('bot', e))
            .then(model => {
                    placeLatLonObject(model, 'bot', 50.93432318, 11.58049268, 184.518, 0)
                    const s = 0.3 / 70

                    model.scale.set(s,s,s)
                    const mixer = new THREE.AnimationMixer(model)
                    mixer.clipAction(model.animations[0]).play()
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

        glTFLoader.loadAsync('models/samples/bathroom_m.glb', e => updateDownloadProgress('stick', e))
            .then(gltf => {
                    const model = gltf.scene
                    placeLatLonObject(model, 'BathroomM', 50.93403099, 11.58052090, 183.547, 190)
                    model.scale.set(1,1.7,1.7)
                    flurScene.add(model)
            })
            .catch(printError)

        glTFLoader.loadAsync('models/samples/interaction_cuboid.glb', e => updateDownloadProgress('CuboidsAbbCorridor', e))
            .then(gltf => {
                    const model = gltf.scene

                    placeLatLonObject(model, 'HS1DoorEntrance', 50.93424072, 11.58049479, 185.863, -15)
                    var scale = 1.3 // a guess
                    model.scale.set(scale, scale, scale)
                    model.visible = false

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

                    const infoboardCorridor = model.clone()
                    placeLatLonObject(infoboardCorridor, 'InfoboardCorridor',  50.93411436, 11.58043701, 186.176, 5)
                    flurScene.add(infoboardCorridor)

                    flurScene.add(model)
            })
            .catch(printError)

}

export {fillAbbeanumCorridorScene}