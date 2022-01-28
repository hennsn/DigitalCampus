import * as THREE from 'https://cdn.skypack.dev/three@0.135.0'

const forward = new THREE.Vector3(0,0,-1)
const right   = new THREE.Vector3(1,0,0)

function handleKeyBoardMovementInteractionsInteraction(acceleration, debuggedObject, user){
	if(scene != outsideScene){
		user.speed = user.insideSpeed;
	} else {
		user.speed = user.outsideSpeed
	}
	
	if(keyboard.ArrowLeft){
		camera.rotation.y += user.turnSpeed
	}
	if(keyboard.ArrowRight){
		camera.rotation.y -= user.turnSpeed
	}
	if(keyboard.w || keyboard.ArrowUp){
		acceleration.add(forward)
	}
	if(keyboard.s || keyboard.ArrowDown){
		acceleration.sub(forward)
	}
	
	if(keyboard.MotionX) acceleration.x += keyboard.MotionX
	if(keyboard.MotionY) acceleration.z -= keyboard.MotionY
	if(keyboard.TurningX) camera.rotation.y -= keyboard.TurningX * dt
	if(keyboard.TurningY) camera.rotation.x += keyboard.TurningY * dt
	clampCameraRotation()
	
	if(keyboard.a) acceleration.sub(right)
	if(keyboard.d) acceleration.add(right)

	// placing a debug object
	if(keyboard.l) debuggedObject.position.z -= dt // model front
	if(keyboard.i) debuggedObject.position.x -= dt // model left
	if(keyboard.j) debuggedObject.position.z += dt // model back
	if(keyboard.k) debuggedObject.position.x += dt // model right
	if(keyboard.o) debuggedObject.rotation.y += dt * 5 * user.turnSpeed // model rot left
	if(keyboard.u) debuggedObject.rotation.y -= dt * 5 * user.turnSpeed // model rot right
	if(keyboard.n) debuggedObject.position.y -= dt // model down
	if(keyboard.m) debuggedObject.position.y += dt // model up
	
}


export {handleKeyBoardMovementInteractionsInteraction}