import {printError, updateDownloadProgress} from "../../UserInterface.js";
import {placeLatLonObject} from "../Coordinates.js";

function fillAbbeanumHS1Scene(){
    glTFLoader.loadAsync('models/samples/hs1.glb', e => updateDownloadProgress('abbeanumHS1', e))
        .then(gltf => {
            const model = gltf.scene
            placeLatLonObject(model, 'AbbeanumHS1', 50.93424364, 11.58059549, 186.333, 0)
            const scale = 1.4 // a guess
            model.scale.set(scale, scale, scale)
            abbeanumHS1Scene.add(model)
        })
        .catch(printError)

    glTFLoader.loadAsync('models/samples/hs1_collisions.glb', e => updateDownloadProgress('HS1Collisions', e))
        .then(gltf => {
            const model = gltf.scene
            placeLatLonObject(model, 'HS1Collisions', 50.93424364, 11.58059549, 186.333, 0)
            const scale = 1.4 // the same as for the visual model
            model.scale.set(scale, scale, scale)
            model.visible = false
            abbeanumHS1Scene.add(model)
        })
        .catch(printError)

    //TODO: place in the right scene (hs1) when models finished
    glTFLoader.loadAsync('models/samples/laptop1.glb', e => updateDownloadProgress('laptop', e))
        .then(gltf => {
            const model = gltf.scene
            placeLatLonObject(model, 'Laptop', 50.93424693, 11.58070168, 184.212, -90)
            abbeanumHS1Scene.add(model)
        })
        .catch(printError)


    glTFLoader.loadAsync('models/samples/laptop2.glb', e => updateDownloadProgress('laptop2', e))
        .then(gltf => {
            const model = gltf.scene
            placeLatLonObject(model, 'Laptop2', 50.93424693, 11.58070168, 184.212, -90) //rename no longer needed
            abbeanumHS1Scene.add(model)
            model.visible = false
        })
        .catch(printError)


    glTFLoader.loadAsync('models/samples/cup.glb', e => updateDownloadProgress('cup', e))
        .then(gltf => {
            const model = gltf.scene
            placeLatLonObject(model, 'Kaffeetasse', 50.93430969, 11.58055729, 185.247, 0) //ehemals Cup
            abbeanumHS1Scene.add(model)
        })
        .catch(printError)

    glTFLoader.loadAsync('models/samples/beamer.glb', e => updateDownloadProgress('beamer', e))
        .then(gltf => {
            const model = gltf.scene
            placeLatLonObject(model, 'Beamer', 50.93425396, 11.58063980, 189.048, 180)
            abbeanumHS1Scene.add(model)
        })
        .catch(printError)


    // they are not really at the right spot but this is an interaction dummy
    glTFLoader.loadAsync('models/samples/blackboards.glb', e => updateDownloadProgress('blackboards', e))
        .then(gltf => {
            const model = gltf.scene
            const s = 2
            model.scale.set(s, s, s)
            placeLatLonObject(model, 'Blackboards', 50.93423977, 11.58071961, 185.869, 0)
            model.visible = false
            abbeanumHS1Scene.add(model)
        })
        .catch(printError)


    glTFLoader.loadAsync('models/samples/interaction_cuboid.glb', e => updateDownloadProgress('CuboidsAbbHS1', e))
        .then(gltf => {
            const model = gltf.scene

            placeLatLonObject(model, 'HS1DoorExit', 50.93424072, 11.58049479, 185.863, -15)
            const scale = 1.3 // a guess
            model.scale.set(scale, scale, scale)
            model.visible = false
            model.children[2].material.wireframe = true;

            abbeanumHS1Scene.add(model)
        })
        .catch(printError)

}

export {fillAbbeanumHS1Scene}