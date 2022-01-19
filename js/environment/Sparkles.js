
import * as THREE from 'https://cdn.skypack.dev/three@0.135.0'
import { mix } from '../Maths.js'

// customizable parameters
var spawnRadius = 1
var flyRadius = 2

var nextSpawnTime = 0
var spawnsPerSecond = 2
var scale = 0.15
var speed = 1.5 / flyRadius

var material = new THREE.MeshBasicMaterial({
	color: 'white',
	map: new THREE.TextureLoader().load('images/textures/Sparkle.png'),
	transparent: true,
	opacity: 1,
	side: THREE.DoubleSide
})
const geometry = new THREE.PlaneGeometry(1, 1)

function updateSparkles(scene, camera, targets, time, deltaTime){
	
	var particles = scene.getObjectByName('particles')
	if(!particles){
		particles = new THREE.Object3D()
		particles.name = 'particles'
		scene.add(particles)
	}
	
	if(time > nextSpawnTime && targets.length){
		nextSpawnTime = time + (Math.random() + 0.5) * 1e3 / (spawnsPerSecond * targets.length)
		// spawn new particle
		const plane = new THREE.Mesh(geometry, material.clone())
		const target = targets[(Math.random() * targets.length)|0] // select a random target
		plane.position.set(
			target.x + (Math.random()-0.5) * spawnRadius, 
			target.y + (Math.random()-0.5) * spawnRadius,
			target.z + (Math.random()-0.5) * spawnRadius
		)
		plane.scale.set(scale, scale, scale)
		plane.rotation.set(Math.random()*6.28, Math.random()*6.28, Math.random()*6.28)
		plane.targetRot = new THREE.Euler(Math.random()*6.28, Math.random()*6.28, Math.random()*6.28)
		plane.targetPos = plane.position.clone().add(new THREE.Vector3(
			(Math.random()-0.5) * flyRadius, 
			(Math.random()-0.5) * flyRadius,
			(Math.random()-0.5) * flyRadius
		))
		particles.add(plane)
	}
	
	// update particles & kill old particles
	var lerp = speed * deltaTime
	for(var i=particles.children.length-1;i>=0;i--){
		const particle = particles.children[i]
		particle.position.lerp(particle.targetPos, lerp)
		particle.rotation.x = mix(particle.rotation.x, particle.targetRot.x, lerp)
		particle.rotation.y = mix(particle.rotation.y, particle.targetRot.y, lerp)
		particle.rotation.z = mix(particle.rotation.z, particle.targetRot.z, lerp)
		particle.material.opacity = mix(particle.material.opacity, 0, lerp)
		if(particle.material.opacity < 0.01){// particle death condition
			particles.remove(particle)
		}
	}
	
}

export { updateSparkles }