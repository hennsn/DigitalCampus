import * as THREE from 'https://cdn.skypack.dev/three@0.135.0'
import { clamp, degToRad } from '../../Maths.js'

const forward = new THREE.Vector3(0,0,-1)
const right   = new THREE.Vector3(1,0,0)

function clampCameraRotation(){
	camera.rotation.x = clamp(camera.rotation.x, -60*degToRad, +60*degToRad)
}

function handleKeyBoardMovementInteractionsInteraction(acceleration, debuggedObject, user, dt){
	
	const speedMultiplier = user.isRunning ? 2.0 : 1.0
	if(scene != outsideScene){
		user.speed = speedMultiplier * user.insideSpeed
	} else {
		user.speed = speedMultiplier * user.outsideSpeed
	}
	
	if(keyboard.arrowleft)  camera.rotation.y += user.turnSpeed
	if(keyboard.arrowright) camera.rotation.y -= user.turnSpeed
	if(keyboard.arrowup)    camera.rotation.x += user.turnSpeed
	if(keyboard.arrowdown)  camera.rotation.x -= user.turnSpeed
	
	if(keyboard.w) acceleration.add(forward)
	if(keyboard.s) acceleration.sub(forward)
	if(keyboard.a) acceleration.sub(right)
	if(keyboard.d) acceleration.add(right)
	
	if(keyboard.MotionX) acceleration.x += keyboard.MotionX
	if(keyboard.MotionY) acceleration.z -= keyboard.MotionY
	
	if(acceleration.length() > 1){
		acceleration.normalize()
	}
	
	if(keyboard.TurningX) camera.rotation.y -= keyboard.TurningX * dt
	if(keyboard.TurningY) camera.rotation.x += keyboard.TurningY * dt
	clampCameraRotation(camera)

	if(debuggedObject)
	{	// placing a debug object
		if(keyboard.l) debuggedObject.position.z -= dt // model front
		if(keyboard.i) debuggedObject.position.x -= dt // model left
		if(keyboard.j) debuggedObject.position.z += dt // model back
		if(keyboard.k) debuggedObject.position.x += dt // model right
		if(keyboard.o) debuggedObject.rotation.y += dt * 5 * user.turnSpeed // model rot left
		if(keyboard.u) debuggedObject.rotation.y -= dt * 5 * user.turnSpeed // model rot right
		if(keyboard.n) debuggedObject.position.y -= dt // model down
		if(keyboard.m) debuggedObject.position.y += dt // model up
	}
}


export {handleKeyBoardMovementInteractionsInteraction}