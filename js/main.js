
import * as THREE from 'https://cdn.skypack.dev/three@0.134.0'
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.134.0/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.134.0/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'https://cdn.skypack.dev/three@0.134.0/examples/jsm/loaders/DRACOLoader.js'
import { HDRCubeTextureLoader } from 'https://cdn.skypack.dev/three@0.134.0/examples/jsm/loaders/HDRCubeTextureLoader.js';
import { RGBELoader } from "https://cdn.skypack.dev/three@0.134.0/examples/jsm/loaders/RGBELoader.js";
import Stats from 'https://cdn.skypack.dev/three@0.134.0/examples/jsm/libs/stats.module'

// conventions (may be altered, if sb hates them 😂):
// x = left/right
// y = up/down (may change, because z is up in Blender)
// z = forward/backward

// tabs instead of spaces for identation, so every user can set the identation width themselves
// single and multi line comments are fine
// no semicolons, because they are not really required in JavaScript 😄. Except somebody really loves them

// named functions probably should have the "function" keyword, while annonymous functions should be lambda expressions

const near = 0.1  // near clipping plane: closer pixels are invisible
const far  = 2000 // far clipping plane: farther pixels/objects are invisible
const fov  = 75   // fov in degrees, on the y axis

// camera
const camera = new THREE.PerspectiveCamera(fov, window.innerWidth/window.innerHeight, near, far)
camera.position.y = 1
camera.position.z = 5

// renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

////////////////////////////
// scene + sample objects //
////////////////////////////

const scene = new THREE.Scene()
// Configure and create Draco decoder.
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('js/libs/draco/')
// who can get this working over the CDN? current error message: "Uncaught SyntaxError: Unexpected token 'export'"
// dracoLoader.setDecoderPath('https://cdn.skypack.dev/three@0.134.0/examples/js/libs/draco/')
dracoLoader.setDecoderConfig({ type: 'js' })
const glTFLoader = new GLTFLoader()
glTFLoader.setDRACOLoader(dracoLoader)

// const environmentMap = new HDRCubeTextureLoader()
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
		model.position.y = 1.5
		scene.add(model)
	}, undefined,
	(error) => { console.error(error) }
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

// todo webxr button & support

// todo top-down map?

// todo GPS input to show where we are on the map

// for debugging: fps/frame-time/memory usage
// browsers are typically locked at the screen refresh rate, so 60 fps (in my case) is perfect
const stats = Stats()
document.body.appendChild(stats.dom)

function mainLoop(){
	requestAnimationFrame(mainLoop)
	
	// animation / physics stuff goes here
	
	stats.update()
	renderer.render(scene, camera)
}
mainLoop()

