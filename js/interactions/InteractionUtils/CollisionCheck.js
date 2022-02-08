import * as THREE from 'https://cdn.skypack.dev/three@0.135.0'
import { getHeightOnTerrain } from '../../environment/Terrain.js'
import { Constants } from '../Constants.js'
import { mix } from '../../Maths.js'

const distanceToWalls = 0.3

// left/right, up/down, forward/backward
var rayChecks = [
	new THREE.Vector3( 0.0, 0.0, 0.0),
	new THREE.Vector3(+0.2, 0.0, 0.0),
	new THREE.Vector3(-0.2, 0.0, 0.0),
	new THREE.Vector3( 0.0, 0.0,+0.2),
	new THREE.Vector3( 0.0,-1.0, 0.0),
]

const up = new THREE.Vector3(0,1,0)
const down = new THREE.Vector3(0,-1,0)

const jumpDuration = Constants.jumpDuration
const jumpHeight = Constants.jumpHeight

var jumpTime = Constants.jumpTime

const cameraSpaceRight = new THREE.Vector3()
const position = new THREE.Vector3()

function jumpCurve(time){
	// better recommendations for jump functions are welcome xD
	/*const fDuration = 2.5
	const x = time * fDuration / jumpDuration - 1
	const f = Math.sin(x+.5)*Math.exp(-x*x*4)
	const fMax = 0.56*/
	const fDuration = 8
	const x = time * fDuration / jumpDuration - 2.75
	const f = Math.sin(x+x*x/10+2)*Math.exp(-x*x/4)
	const fMax = 0.95
	return f / fMax * jumpHeight
}

const showDebugRays = false
function addDebugLine(p1, p2, color){
	const lineGeometry = new THREE.BufferGeometry(),
	lineMat = new THREE.LineBasicMaterial({ color: color, linewidth: 5 })
	lineGeometry.setFromPoints([p1, p2])
	const line = new THREE.Line(lineGeometry, lineMat)
	line.name = 'line'
	scene.add(line)
}

function deleteOldDebugLines(){
	for(var c=scene.children,i=c.length-1;i>=0;i--){
		if(c[i].name == 'line') scene.remove(c[i])
	}
}

function checkCollision(velocity, user, keyWasPressed, jumpTime, dt){
	
	/**
	 * Warning: this code only will work correctly (currently),
	 * if the mesh file inheritly has no rotations.
	 */
	
	const abbeanumFlurCollisions = scene.getObjectByName('AbbeanumCorridorCollisions')
	const abbeanumGround = scene.getObjectByName('AbbeanumGround')
	const abbeanum = scene.getObjectByName('Abbeanum')
	const hs1 = scene.getObjectByName('HS1Collisions')
	const wetFloor = scene.getObjectByName('WetFloorSign')
	const coffeeMachine = scene.getObjectByName('CoffeeMachine')
	const dumpster0 = scene.getObjectByName('DumpsterBlueCollision')
	const dumpster1 = scene.getObjectByName('DumpsterYellowCollision')
	const dumpster2 = scene.getObjectByName('DumpsterGreenCollision')

	if(velocity.length() > 1e-3 * user.speed || // we're in motion / might move camera up/down
		keyWasPressed || (jumpTime > 0.0 && jumpTime < jumpDuration)){
		
		if(abbeanumFlurCollisions) abbeanumFlurCollisions.visible = true
		if(dumpster0) dumpster0.visible = true
		if(dumpster1) dumpster1.visible = true
		if(dumpster2) dumpster2.visible = true
		
		// we cant check whole scene (too big) maybe copy the important objects from scene then do raycasting collision check
		const collidables = ( 
			scene == outsideScene ? [abbeanum, abbeanumGround, dumpster0, dumpster1, dumpster2] :
			scene == flurScene ? [abbeanumFlurCollisions, wetFloor, coffeeMachine] :
			scene == hs1Scene ? [hs1] :
			[]
		).filter(model => !!model)
		
		if(scene && showDebugRays) deleteOldDebugLines()
			
		if(abbeanumFlurCollisions && camera.position.y - user.eyeHeight > abbeanumFlurCollisions.position.y - 0.86 &&
			camera.position.x < -17.1 && camera.position.z > -12.61){
			// player is above the normal height, in the sliding region, so he will be sliding down the slippery "stairs"
			// stair direction: (0,0,+1)
			var slidingAcceleration = 0.1
			velocity.x += slidingAcceleration * dt * Math.sin(abbeanumFlurCollisions.rotation.y)
			velocity.z += slidingAcceleration * dt * Math.cos(abbeanumFlurCollisions.rotation.y)
		}
		
		var isIntersecting = false
		raycaster.near = -0.2
		raycaster.far  = velocity.length() + distanceToWalls
		cameraSpaceRight.set(-velocity.z, 0, velocity.x).normalize()
		for(var i=0;i<rayChecks.length;i++){
			const rayCheck = rayChecks[i]
			position.copy(camera.position)
			position.addScaledVector(cameraSpaceRight, rayCheck.x)
			position.addScaledVector(up, rayCheck.y)
			position.addScaledVector(velocity, rayCheck.z / velocity.length())
			raycaster.set(position, velocity)
			const intersections = raycaster.intersectObjects(collidables)
			if(showDebugRays){
				const p2 = velocity.clone(); p2.normalize(); p2.add(position)
				addDebugLine(position, p2, intersections && intersections.length > 0 ? 'green' : 'red')
			}
			if(intersections && intersections.length > 0){
				
				isIntersecting = true
				
				for(var j=0;j<intersections.length;j++){
				
					// we can do this slowing-down for every closest intersection
					// this will prevent clipping through edges
					const intersection = intersections[j]
					
					// dirty hack for when the code after this isn't working correctly:
					// inverse the velocity completely, and add heavy friction,
					// when the user is inside a wall
					/*if(intersection.distance < raycaster.far * 0.5){
						velocity.multiplyScalar(-1 + Math.min(10*dt, 0.9))
						break
					}*/
					
					const object = intersection.object
					const normal = intersection.face.normal.clone()
					// transform normal from object space to world space
					normal.transformDirection(object.matrixWorld)
					normal.normalize()
					if(showDebugRays){
						const p1 = intersection.point.clone()
						const p2 = normal.clone(); p2.normalize(); p2.add(p1)
						addDebugLine(p1, p2, 'white')
					}
					// remove the projection
					normal.multiplyScalar(velocity.dot(normal))
					if(normal.dot(velocity) < 0){// ensure we don't get accelerated by negative walls
						velocity.add(normal)
					} else {
						velocity.sub(normal)
					}
				}
			}
		}

		
		user.isIntersecting = isIntersecting
		
		// theoretisch müsste es addScaledVector(velocity, dt) sein, aber damit klippe ich irgendwie immer durch die Wand
		camera.position.add(velocity)
		
		raycaster.set(camera.position, down)
		raycaster.near = 0
		raycaster.far  = user.eyeHeight + 2
		var noneY = -123
		var intersection = raycaster.intersectObjects(collidables)
		var floorY = intersection && intersection.length > 0 ? intersection[0].point.y : noneY
		if(scene == outsideScene){
			// add terrain as intersection
			var groundY = getHeightOnTerrain(camera.position.x, camera.position.z)
			floorY = Math.max(floorY, groundY)
		}
		if(floorY > noneY){
			const sneaking = keyboard.Shift ? -0.4 : 0.0 // could be smoothed a little
			const targetY = floorY + user.eyeHeight + sneaking + jumpCurve(jumpTime)
			camera.position.y = mix(camera.position.y, targetY, Math.min(20*dt, 1.0)) // smooth it a little, so jumps (e.g. in HS1) feel more natural
		} else {
			// teleport player back in?
			// camera.position.y = getHeightOnTerrain(camera.position.x, camera.position.z) + user.eyeHeight
		}
		
		if(abbeanumFlurCollisions) abbeanumFlurCollisions.visible = false
		if(dumpster0) dumpster0.visible = false
		if(dumpster1) dumpster1.visible = false
		if(dumpster2) dumpster2.visible = false

	}
}

export { checkCollision }