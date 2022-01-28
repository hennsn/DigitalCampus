import * as THREE from 'https://cdn.skypack.dev/three@0.135.0'
import { getHeightOnTerrain } from '../../environment/Terrain.js'
import { Constants } from '../Constants.js'

const distanceToWalls = 1
// left/right, up/down, forward/backward
var rayChecks = [
	new THREE.Vector3( 0.0, 0.0, 0.0),
	new THREE.Vector3(+0.2, 0.0, 0.0),
	new THREE.Vector3(-0.2, 0.0, 0.0),
	new THREE.Vector3( 0.0,-0.2, 0.0),
	new THREE.Vector3( 0.0,+0.2, 0.0),
	new THREE.Vector3( 0.0, 0.0,-0.2),
	new THREE.Vector3( 0.0, 0.0,+0.2),
]

const up = new THREE.Vector3(0,1,0)
const down = new THREE.Vector3(0,-1,0)

const jumpDuration = Constants.jumpDuration
const jumpHeight = Constants.jumpHeight

var jumpTime = Constants.jumpTime


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






function checkColision(velocity, user, keyWasPressed, jumpTime){
	const abbeanumFlurCollisions = scene.getObjectByName('AbbeanumFlurCollisions')
    const abbeanumGround = scene.getObjectByName('AbbeanumGround')
    const abbeanum = scene.getObjectByName('Abbeanum')


    if(velocity.length() > 1e-3 * user.speed || // we're in motion / might move camera up/down
    keyWasPressed || (jumpTime > 0.0 && jumpTime < jumpDuration)){
    
if(abbeanumFlurCollisions) abbeanumFlurCollisions.visible = true
    
    // we cant check whole scene (too big) maybe copy the important objects from scene then do raycasting collision check
    const collidables = ( 
        scene == outsideScene ? [abbeanum, abbeanumGround] :
        scene == flurScene ? [abbeanumFlurCollisions] :
        scene == hs1Scene ? [] :
        []
    ).filter(model => !!model)
    
    var isIntersecting = false
    raycaster.near = 0 
    raycaster.far  = velocity.length() + distanceToWalls
    const cameraSpaceRight = new THREE.Vector3(-velocity.z, 0, velocity.x).normalize()
    for(var i=0;i<rayChecks.length;i++){
        const rayCheck = rayChecks[i]
        const position = camera.position.clone()
        position.addScaledVector(cameraSpaceRight, rayCheck.x)
        position.addScaledVector(up, rayCheck.y)
        position.addScaledVector(velocity, rayCheck.z / velocity.length())
        raycaster.set(position, velocity)
        const intersections = raycaster.intersectObjects(collidables)
        if(intersections && intersections.length > 0){
            
            isIntersecting = true
            
            // we can do this slowing-down for every closest intersection
            // this will prevent clipping through edges
            const intersection = intersections[0]
            const object = intersection.object
            const normal = intersection.face.normal.clone()
            // transform normal from object space to world space
            normal.transformDirection(object.matrixWorld)
            // remove the projection
            normal.multiplyScalar(velocity.dot(normal))
            if(normal.dot(velocity) < 0){// ensure we don't get accelerated by negative walls
                velocity.add(normal)
            } else {
                velocity.sub(normal)
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
        // todo plus jump curve
        const sneaking = (keyboard.Shift ? -0.4 : 0.0)
        camera.position.y = floorY + user.eyeHeight + sneaking + jumpCurve(jumpTime)
    } else {
        // teleport player back in?
        // camera.position.y = getHeightOnTerrain(camera.position.x, camera.position.z) + user.eyeHeight
    }
    
    if(abbeanumFlurCollisions) abbeanumFlurCollisions.visible = false

}
}

export {checkColision}