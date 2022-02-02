
import * as THREE from 'https://cdn.skypack.dev/three@0.135.0'

function createLighting(scene){
	
	// sun light from above
	// can support shadows, but we need a ground to project them onto, and we need to configure them (best depending on the hardware capabilities)
	const sun = window.sun = new THREE.DirectionalLight(0xffffff, 0.8)
	sun.position.set(0.8,0.7,1) // the sun has its default target at 0,0,0
	scene.add(sun)
	scene.add(sun.target) // needs to be added, if we want to change the suns target

	// ambient light from below
	const ambient = new THREE.AmbientLight( 0x222222 )
	ambient.name = 'ambient'
	scene.add(ambient)
	
}

function createInsideLighting(scene){
	
	// sun light from above
	// can support shadows, but we need a ground to project them onto, and we need to configure them (best depending on the hardware capabilities)
	const sun = window.sun = new THREE.DirectionalLight(0xffffff, 0.6)
	sun.position.set(0.8,0.7,1) // the sun has its default target at 0,0,0
	sun.name = 'sun'
	scene.add(sun)
	scene.add(sun.target) // needs to be added, if we want to change the suns target

	// ambient light from below
	const ambient = new THREE.AmbientLight(0xffffff, 0.6)
	ambient.name = 'ambient'
	scene.add(ambient)
	
}

export { createLighting, createInsideLighting }