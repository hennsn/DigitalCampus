import {Constants} from "../Constants.js"
import {degToRad} from "../../Maths.js"
import {JoyStick} from "../../libs/joystick/joy.min-2.js"
import {xToLon, yToHeight, zToLat} from "../../environment/Coordinates.js"
import {playAudioTrack, stopStoryTrack} from "../../UserInterface.js"
import {sendMultiplayerMessage} from "../../environment/Multiplayer.js"
import {updateOnce, updateStory} from "../Story.js"
import {clampCameraRotation, printInteractables} from "./AuxiliaryFunctions.js"
import {openOnce} from "../Quiz.js"
import {changableInteractionState, user, closeEnough } from "../Interactions.js"

function createInteractions(scene, camera, renderer, mouse) {
    //let jumpTime = changableInteractionState.jumpTime

    // https://stackoverflow.com/a/4819886/4979303
    function isTouchDevice() {
        return (('ontouchstart' in window) ||
            (navigator.maxTouchPoints > 0) ||
            (navigator.msMaxTouchPoints > 0));
    }


    var lastTimeWWasPressed = 0
    const jumpDuration = Constants.jumpDuration
    // change to a more intuitive rotation order
    camera.rotation.order = 'YXZ'

    // There are no VR controls, so we don't need a button for it
    // renderer.xr.enabled = true
    // document.body.appendChild(VRButton.createButton(renderer))

    camera.position.set(7.2525, 0.9494, -21.7161)
    camera.rotation.set(0, 65 * degToRad, 0)

    // create joysticks,
    // maybe only if we are on a phone
    // todo: if we have phone controls, stuff needs to work with touch-clickes as well
    if (isTouchDevice() || localStorage.isTouchDevice) {
        // doesn't work :/
        // document.body.requestFullscreen()
        const jsSize = window.innerWidth > window.innerHeight ? '30vh' : '30vw'
        motionJoyStick.style.display = 'block'
        motionJoyStick.style.width = jsSize
        motionJoyStick.style.height = jsSize
        turningJoyStick.style.display = 'block'
        turningJoyStick.style.width = jsSize
        turningJoyStick.style.height = jsSize
        const joyStickColors = {
            internalFillColor: '#fff0',
            internalStrokeColor: '#fff',
            externalStrokeColor: '#fff'
        }
        new JoyStick('motionJoyStick', joyStickColors, data => {
            changableInteractionState.keyboard.MotionX = data.x / 100
            changableInteractionState.keyboard.MotionY = data.y / 100
        })
        new JoyStick('turningJoyStick', joyStickColors, data => {
            changableInteractionState.keyboard.TurningX = data.x / 100
            changableInteractionState.keyboard.TurningY = data.y / 100
        })
    }

    ////////////////////////////////
    // listeners for interactions //
    ////////////////////////////////

    // Keyboard listeners
    window.addEventListener('keydown', keyDown)
    window.addEventListener('keyup', keyUp)

    function formatNumber(x, digits) {
        x = Math.round(x * Math.pow(10, digits)) + ''
        return x.substr(0, x.length - digits) + '.' + x.substr(x.length - digits)
    }

    function keyDown(event) {
        if (!changableInteractionState.isBlocked) {
            var key = event.key.toLowerCase()
            changableInteractionState.keyWasPressed = true
            changableInteractionState.keyboard[key] = event.timeStamp
            changableInteractionState.keyboard[event.keyCode] = event.timeStamp
            switch (key) {
                case 'w':// tap w twice to run
                    user.isRunning = event.timeStamp - lastTimeWWasPressed < 300
                    break;
                case 's':
                    user.isRunning = false
                    break;
                case ' ':// space for jumping
                    if (changableInteractionState.jumpTime <= 0.0 || changableInteractionState.jumpTime >= jumpDuration * 0.75) {
                        changableInteractionState.jumpTime = 0.0
                    }
                    break
                case 'h':
                    // print the current camera position in world coordinates
                    // can be used to place objects
                    console.log('player')
                    console.log(
                        camera.position,
                        formatNumber(zToLat(camera.position.z), 8) + ", " +
                        formatNumber(xToLon(camera.position.x), 8) + ", " +
                        formatNumber(yToHeight(camera.position.y), 3)
                    );
                    if (window.debuggedObject) {
                        console.log('\n')
                        console.log(debuggedObject.name)
                        console.log(
                            formatNumber(zToLat(debuggedObject.position.z), 8) + ", " +
                            formatNumber(xToLon(debuggedObject.position.x), 8) + ", " +
                            formatNumber(yToHeight(debuggedObject.position.y), 3) + "\n" +
                            debuggedObject.position.x + ' ' + debuggedObject.position.y + ' ' + debuggedObject.position.z
                        )
                    }
                    break;
                case 'q':
                    // opens inventory
                    if (changableInteractionState.inventoryOpen == false && !((once == 9 && story == 7) || ((once == 10 || once == 9) && story == 7))) {
                        playAudioTrack('audio/inventory_sound.mp3');
                        document.getElementById("inventory").style.visibility = 'visible';
                        changableInteractionState.inventoryOpen = true
                    } else {
                        document.getElementById("inventory").style.visibility = 'hidden';
                        changableInteractionState.inventoryOpen = false
                    }
                    break;
                case 't':
                    if (window.multiplayerIsEnabled) {
                        var message = window.prompt('Message to send:')
                        if (message) {
                            message = message.trim()
                            if (message.length > 0) {
                                sendMultiplayerMessage(message)
                            }
                        }
                    }
                case 'c':
                    // skip audio
                    stopStoryTrack()
                    break
                // MAI'S DEBUGGING SIDE KEYS
                case 'ö':
                    updateStory() //story ++
                    break
                case 'ä':
                    printInteractables() //story --
                    break
                case 'ü':
                    updateOnce() //once ++
                    break
                case 'z':
                    // MAI'S DEBUGGING MAIN KEY
                    console.log('story: ', story) //test where in story we are
                    console.log('once: ', once) //teste once variable
                    //console.log('isPlaying: ', isPlaying)
                    console.log('openOnce: ', openOnce)
                    console.log('infoPictureOpen: ', infoPictureOpen)
                    //console.log('inventory: ', inInventory)
                    //console.log(findElement())
                    console.log(closeEnough)
                    break
            }
        }
    }

    function keyUp(event) {
        if (!changableInteractionState.isBlocked) changableInteractionState.keyWasPressed = true
		if(event.key.toLowerCase() == 'w') lastTimeWWasPressed = event.timeStamp // must be placed here, because keyDown() is called for every char that would be entered into a text field
        delete changableInteractionState.keyboard[event.key.toLowerCase()]
        delete changableInteractionState.keyboard[event.keyCode]
    }

    // for debugging: fps/frame-time/memory usage
    // browsers are typically locked at the screen refresh rate, so 60 fps (in my case) is perfect


    ////////////////////
    //MOUSE LISTENERS///
    ////////////////////

    window.addEventListener('mousemove', (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
        if (changableInteractionState.keyboard.leftMouseButton || changableInteractionState.keyboard.middleMouseButton || changableInteractionState.keyboard.rightMouseButton) {
            var mouseSpeed = -4 / window.innerHeight
            camera.rotation.y += mouseSpeed * (event.movementX || 0)
            camera.rotation.x += mouseSpeed * (event.movementY || 0)
            clampCameraRotation()
        }
    }, false)

    var mouseButtonNames = ['leftMouseButton', 'middleMouseButton', 'rightMouseButton']

    // event listener mouse click
    window.addEventListener('mousedown', (event) => {
        if (event.button == 0) changableInteractionState.wasClicked = true // left mouse button only
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
        changableInteractionState.keyboard[mouseButtonNames[event.button]] = 1
    }, false)

    window.addEventListener('mouseup', (event) => {
        delete changableInteractionState.keyboard[mouseButtonNames[event.button]]
    }, false)

    // prevent the context menu to be opened on right click,
    // so the user can turn with his mouse without being interupted
    window.addEventListener('contextmenu', (event) => {
        event.preventDefault()
    })
}

export {createInteractions}
