
import * as THREE from 'https://cdn.skypack.dev/three@0.135.0'
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.135.0/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.135.0/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'https://cdn.skypack.dev/three@0.135.0/examples/jsm/loaders/DRACOLoader.js'
import { HDRCubeTextureLoader } from 'https://cdn.skypack.dev/three@0.135.0/examples/jsm/loaders/HDRCubeTextureLoader.js';
import { RGBELoader } from "https://cdn.skypack.dev/three@0.135.0/examples/jsm/loaders/RGBELoader.js"
import Stats from 'https://cdn.skypack.dev/three@0.135.0/examples/jsm/libs/stats.module'

import { VRButton } from 'https://cdn.skypack.dev/three@0.135.0/examples/jsm/webxr/VRButton.js'
import { ARButton } from 'https://cdn.skypack.dev/three@0.135.0/examples/jsm/webxr/ARButton.js'

// physics for fun 😁
// import { ConvexObjectBreaker } from 'https://cdn.skypack.dev/three@0.135.0/examples/jsm/misc/ConvexObjectBreaker.js'
// import { ConvexGeometry } from 'https://cdn.skypack.dev/three@0.135.0/examples/jsm/geometries/ConvexGeometry.js'
import { ConvexHull } from 'https://cdn.skypack.dev/three@0.135.0/examples/jsm/math/ConvexHull.js'

// import { XREstimatedLight } from 'https://cdn.skypack.dev/three@0.135.0/examples/jsm/webxr/XREstimatedLight.js'

// what exactly does that do? / how does it work?
// eher etwas für die #InteractionsGruppe
// import { XRControllerModelFactory } from 'https://cdn.skypack.dev/three@0.135.0/examples/jsm/webxr/XRControllerModelFactory.js'



// conventions (may be altered, if sb hates them 😂):
// x = left/right
// y = up/down (may change, because z is up in Blender)
// z = forward/backward

// tabs instead of spaces for identation, so every user can set the identation width themselves
// single and multi line comments are fine
// no semicolons, because they are not really required in JavaScript 😄. Except somebody really loves them

// named functions probably should have the "function" keyword, while annonymous functions should be lambda expressions

const near = 0.1 // near clipping plane: closer pixels are invisible
const far  = 1e6 // far clipping plane: farther pixels/objects are invisible
const fov  = 75  // field of view in degrees, on the y axis

const enablePhysics = true

const physicsWorld = new CANNON.World()
const physicsObjects = [] // pairs of THREE.js and CANNON.js objects

// from one of the samples from https://schteppe.github.io/cannon.js
// view-source:https://schteppe.github.io/cannon.js/examples/threejs_fps.html
physicsWorld.quatNormalizeSkip = 0
physicsWorld.quatNormalizeFast = false
physicsWorld.defaultContactMaterial.contactEquationStiffness = 1e9
physicsWorld.defaultContactMaterial.contactEquationRelaxation = 4

// why a split solver?
const solver = new CANNON.GSSolver()
physicsWorld.solver = new CANNON.SplitSolver(solver)
physicsWorld.gravity.set(0,-9.81,0)
const gridMin = new CANNON.Vec3(-400,-100,-400)
const gridMax = new CANNON.Vec3(+400,+100,+400)
physicsWorld.broadphase = new CANNON.SAPBroadphase(physicsWorld)
// physicsWorld.broadphase = new CANNON.GridBroadphase(gridMin, gridMax, 20, 4, 20) // we know the size of the scene: currently 800x800m

// add floor
const floorSplits = 5
const floorSize = 500/floorSplits
for(var x=-floorSplits;x<=floorSplits;x++){
	for(var z=-floorSplits;z<=floorSplits;z++){
		const floorShape = new CANNON.Box(new CANNON.Vec3(floorSize,10,floorSize))
		const floorBody = new CANNON.Body({ mass: 0 })
		floorBody.position.set(500*x/floorSplits,-10,500*z/floorSplits)
		floorBody.addShape(floorShape)
		physicsWorld.add(floorBody)
	}
}


var ctr0 = 0
var ctr1 = 0
function addObjectToPhysics(obj, isStatic){
	if(obj instanceof THREE.Mesh){
		const geometry = obj.geometry
		const aabb = geometry.boundingBox // with or without object transform? probably without
		// don't create the streets as physics
		const density = 1
		const sx = Math.max(1, aabb.max.x-aabb.min.x)
		const sy = Math.max(1, aabb.max.y-aabb.min.y)
		const sz = Math.max(1, aabb.max.z-aabb.min.z)
		const mass = isStatic ? 0 : density * sx * sy * sz
		// if the shape is static, it can have a concave shape
		// if it's dynamic, it needs to have a convex shape or be composited from convex shapes (there is algorithms for that decomposition)
		var shape
		if(isStatic){
			// vertices: array of x,y,z values, just one after the other
			// indices: int16 array, so there is a limit to the max mesh size
			shape = new CANNON.Trimesh(geometry.attributes.position.array, geometry.index.array)
		} else {
			// compute the convex hull
			const convexHull = new ConvexHull().setFromObject(obj)
			const convexFaces = convexHull.faces
			const point2Index = {}
			const points = []
			const faces = []
			convexFaces.forEach(face1 => {
				var edge = face1.edge
				var face2 = []
				do {
					const point = edge.head().point
					var index = point2Index[point]
					if(index === undefined){
						index = points.length
						points.push(new CANNON.Vec3(point.x-obj.position.x, point.y-obj.position.y, point.z-obj.position.z))
						point2Index[point] = index
					}
					face2.push(index)
					edge = edge.next
				} while(edge !== face1.edge)
				// face2.reverse()
				faces.push(face2)
			})
			// points: array of vec3
			// faces: array of int arrays, defining the vertices for each face
			const uniqueAxes = null // can be null
			shape = new CANNON.ConvexPolyhedron(points, faces, uniqueAxes)
		}
		const body = new CANNON.Body({ mass })
		body.addShape(shape)
		body.position.copy(obj.position)
		if(!isStatic){
			body.inertia.set(mass*(sy*sy+sz*sz)/6,mass*(sx*sx+sz*sz)/6,mass*(sy*sy+sx*sx))
			body.invInertia.set(1/body.inertia.x, 1/body.inertia.y, 1/body.inertia.z)
		}
		physicsWorld.add(body)
		if(!isStatic) physicsObjects.push([obj, body])
	}
}

function clamp(x, min, max){
	return x < min ? min : x < max ? x : max
}

function printError(err){
	// could be redirected to the UI
	console.log(err)
}

// camera
const camera = new THREE.PerspectiveCamera(fov, window.innerWidth/window.innerHeight, near, far)
camera.position.y = 10
camera.position.z = 200

// renderer
const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.xr.enabled = true
document.body.appendChild(renderer.domElement)
document.body.appendChild(VRButton.createButton(renderer))
// document.body.appendChild(ARButton.createButton(renderer, { optionalFeatures: [ 'light-estimation' ] }))
// document.body.appendChild(ARButton.createButton(renderer)) // laggt, wenn Tracking verloren ist

////////////////////////////
// scene + sample objects //
////////////////////////////

const scene = new THREE.Scene()
// Configure and create Draco decoder.
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('js/libs/draco/')
// who can get this working over the CDN? current error message: "Uncaught SyntaxError: Unexpected token 'export'"
// dracoLoader.setDecoderPath('https://cdn.skypack.dev/three@0.135.0/examples/js/libs/draco/')
dracoLoader.setDecoderConfig({ type: 'js' })
const glTFLoader = new GLTFLoader()
glTFLoader.setDRACOLoader(dracoLoader)

const hdrLoader = new RGBELoader()
	.setPath('./images/environment/')
	
const whiteMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

const scale = far * 0.707 // slightly less than 1/sqrt(2)
const envCube = new THREE.BoxGeometry(scale, scale, scale)
const envMap = new THREE.Mesh(envCube, whiteMaterial)


hdrLoader.setDataType(THREE.HalfFloatType) // alt: UnsignedByteType/FloatType/HalfFloatType
hdrLoader.load(['kloofendal_38d_partly_cloudy_2k.hdr'], (tex, texData) => {
	const envMat = new THREE.ShaderMaterial({
		uniforms: { tex: { value: tex }, exposure: { value: 5 } }, side: THREE.DoubleSide,
		vertexShader: 'varying vec3 v_pos; void main(){ v_pos = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1); }',
		fragmentShader: 'varying vec3 v_pos; uniform float exposure; uniform sampler2D tex; void main(){ vec3 n = normalize(v_pos); vec3 c = texture(tex, vec2(atan(n.x, n.z)*'+(0.5/Math.PI)+'+.5, n.y*.5+.5)).rgb * exposure; gl_FragColor = vec4(c/(1.0+c), 1); }' // x/(1+x) is equal to Reinhard tonemapping (as long as we don't render in HDR)
	})
	tex.magFilter = THREE.LinearFilter
	tex.needsUpdate = true
	envMap.material = envMat
	scene.add(envMap)
})

window.camera = camera
window.scene = scene

// temporary sky color as long as we don't have a HDR for that
scene.background = new THREE.Color(0x768ca1)

const geometry = new THREE.BoxGeometry()
const material = new THREE.MeshBasicMaterial({ color: 0x77ff33 })
const cube = new THREE.Mesh(geometry, material)
scene.add(cube)

// sun light from above
// can support shadows, but we need a ground to project them onto, and we need to configure them (best depending on the hardware capabilities)
const sun = new THREE.DirectionalLight(0xffffff);
sun.rotation.x = -30*3.14/180
scene.add(sun)

// ambient light from below
const ambient = new THREE.HemisphereLight(0xffffff, 0x444444);
scene.add(ambient)

// works, but somehow the materials are lost :/
glTFLoader.load('models/samples/draco-monkey.glb',
	(gltf) => {
		const model = gltf.scene
		model.position.set(0,25,0)
		model.scale.set(10,10,10)
		scene.add(model)
		if(enablePhysics){
			model.traverse(obj => addObjectToPhysics(obj, false, true))
		}
	}, undefined, printError
)

glTFLoader.load('models/samples/dice-compressed.glb',
	(gltf) => {
		const model = gltf.scene
		model.position.set(20,20,0)
		model.scale.set(5,5,5)
		scene.add(model)
		if(enablePhysics){
			model.traverse(obj => addObjectToPhysics(obj, false, true))
		}
	}, undefined, printError
)

glTFLoader.load('models/samples/campus-joined.glb',
	(gltf) => {
		const model = gltf.scene
		model.position.set(2,0,0)
		model.scale.set(.5,.5,.5)
		scene.add(model)
		if(enablePhysics){
			// todo traverse model, find all objects, and create 3d convex meshes/submeshes for them, and add them to the physics engine
			model.traverse(obj => addObjectToPhysics(obj, true, false))
		}
	}, undefined, printError
)

////////////////////////////////
// listeners for interactions //
////////////////////////////////

const controls = new OrbitControls(camera, renderer.domElement)
controls.target.set(0, 1, 0) // orbit center
controls.update()// compute transform for 1st frame

// adjust the aspect ratio as needed:
window.addEventListener("resize", (event) => {
	camera.aspect = window.innerWidth / window.innerHeight
	camera.updateProjectionMatrix()
	renderer.setSize(window.innerWidth, window.innerHeight)
})

window.addEventListener("click", (event) => {
	console.log('todo send sphere into scene', event)
})

// todo top-down map?

// todo GPS input to show where we are on the map

// todo controls #InteractionsGruppe

// for debugging: fps/frame-time/memory usage
// browsers are typically locked at the screen refresh rate, so 60 fps (in my case) is perfect
const stats = Stats()
document.body.appendChild(stats.dom)

var lastTime = new Date().getTime()
var ctrX = 0

function mainLoop(){
	
	const currentTime = new Date().getTime()
	const deltaTime = clamp((currentTime - lastTime)/1e3, 0.001, 0.1)
	lastTime = currentTime
	
	// animation / physics stuff goes here
	physicsWorld.step(deltaTime, 0, 1)
	
	physicsObjects.forEach(pair => {
		const threeJs = pair[0]
		const cannonJs = pair[1]
		threeJs.position.copy(cannonJs.position)
		threeJs.quaternion.copy(cannonJs.quaternion)
	})
	
	stats.update()
	envMap.position.set(camera.position.x,camera.position.y,camera.position.z) // normally the environment map is fixed in place automatically, but I didn't find the correct map yet (1 texture for all sides combined)
	renderer.render(scene, camera)
}
renderer.setAnimationLoop(mainLoop) // requestAnimationFrame funktioniert nicht für WebXR, aber die hier funktioniert für mit und ohne :)
