import * as THREE from 'https://cdn.skypack.dev/three@0.135.0'

import {printError, updateDownloadProgress} from "../../UserInterface.js";
import {placeLatLonObject} from "../Coordinates.js";

function fillOutsideScene() {
    // our first model: the Abbeanum, Fröbelstieg 1
    glTFLoader.loadAsync('models/samples/abbeanum_new_v2.glb', e => updateDownloadProgress('Abbeanum', e))
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


    // Formerly AbbeanumDoorOnly -> renamed to InteractionCuboid so it can be resized and reused for any
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

            const infoboardCorridor = model.clone()
            placeLatLonObject(infoboardCorridor, 'InfoboardCorridor',  50.93411436, 11.58043701, 186.176, 5)
            flurScene.add(infoboardCorridor)
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

    textureLoader.load("history.jpg", texture => {
        const scale = 0.7
        const material = new THREE.MeshLambertMaterial({ map : texture })
        const model = new THREE.Mesh(new THREE.PlaneGeometry(scale * 2864/2179, scale), material)
        placeLatLonObject(model, 'HistoryBoard', 50.93412719, 11.58074277, 183.715, 102)
        material.side = THREE.DoubleSide
        outsideScene.add(model)
    })

    // White/gray board outside with "64"
    glTFLoader.loadAsync('models/samples/abbeanum_infoboard.glb', e => updateDownloadProgress('abbeanumInfoBoard', e))
        .then(gltf => {
            const model = gltf.scene
            placeLatLonObject(model, 'AbbeanumInfoBoard', 50.93413541, 11.58075170, 184.125, 10)
            outsideScene.add(model)
        })
        .catch(printError)

    // Beige board outside with "Friedrich Schiller Universität Jena, 204 Fröbelstieg 1..."
    glTFLoader.loadAsync('models/samples/abbeanum_infoboard_2.glb', e => updateDownloadProgress('abbeanumInfoBoard2', e))
        .then(gltf => {
            const model = gltf.scene
            const s = 0.57
            model.scale.set(s,s,s)
            placeLatLonObject(model, 'AbbeanumInfoBoard2', 50.93415473, 11.58077720, 182.684)
            outsideScene.add(model)
        })
        .catch(printError)

    glTFLoader.loadAsync('models/samples/birch_tree.glb', e => updateDownloadProgress('birchTree', e))
        .then(gltf => {
            var model = gltf.scene
            model.scale.set(3.7,3.7,3.7)
            placeLatLonObject(model, 'Birch0', 50.93382438, 11.58076733, 180.46, 10)
            outsideScene.add(model)
            model = model.clone()
            model.scale.set(3.9,3.9,3.9)
            placeLatLonObject(model, 'Birch1', 50.93380496, 11.58063220, 180.403, 170)
            outsideScene.add(model)
            model = model.clone()
            model.scale.set(3.2,3.2,3.2)
            placeLatLonObject(model, 'Birch2', 50.93376141, 11.58050615, 179.32, -90)
            outsideScene.add(model)
            model = model.clone()
            model.scale.set(3.6,3.6,3.6)
            placeLatLonObject(model, 'Birch3', 50.93374361, 11.58022459, 181.08, 25)
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


    glTFLoader.loadAsync('models/samples/campus_joined.glb', e => updateDownloadProgress('City Center', e))
        .then(gltf => {
            const model = gltf.scene
            placeLatLonObject(model, 'City Center', 50.9279284 + 0.0001, 11.5829607 - 0.00016, 150, 0)
            outsideScene.add(model)
        })
        .catch(printError)

}

export {fillOutsideScene}