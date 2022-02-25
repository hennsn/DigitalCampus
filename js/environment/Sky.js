
import * as THREE from 'https://cdn.skypack.dev/three@0.135.0'

function createSky(scene){
	// temporary sky color as long as we don't have a HDR for that
	scene.background = new THREE.Color(0x768ca1)
	const useHDR = false // as long as we don't render the scene in HDR, we don't need an HDR texture
	const vertexShader = 'varying vec3 v_pos; void main(){ v_pos = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1); }'
	if(useHDR){
		hdrLoader.setDataType(THREE.HalfFloatType) // alternatives: UnsignedByteType/FloatType/HalfFloatType
		const url = 'kloofendal_38d_partly_cloudy_2k.hdr'
		hdrLoader.load(url, (tex, texData) => {
			tex.minFilter = THREE.LinearFilter
			tex.magFilter = THREE.LinearFilter
			tex.needsUpdate = true
			const scale = camera.far * 0.707 // slightly less than 1/sqrt(2)
			const cube = new THREE.BoxGeometry(scale, scale, scale)
			const material = new THREE.ShaderMaterial({ 
				uniforms: { tex: { value: tex }, exposure: { value: 5 } }, side: THREE.DoubleSide, 
				vertexShader, fragmentShader: 'varying vec3 v_pos; uniform float exposure; uniform sampler2D tex;' + 
		'void main(){ vec3 n = normalize(v_pos); vec2 uv = vec2(atan(n.x, n.z)*'+(0.5/Math.PI)+'+.5, n.y*.5+.5); vec3 c = texture(tex, uv).rgb * exposure; gl_FragColor = vec4(c/(1.0+c), 1); }' // x/(1+x) is equal to Reinhard tonemapping (as long as we don't render in HDR)
			})
			const mesh = window.envMap = new THREE.Mesh(cube, material)
			mesh.name = 'EnvironmentMap'
			scene.add(mesh)
		})
	} else {
		const url = 'environment/kloofendal_38d_partly_cloudy_2k.jpg'
		textureLoader.load(url, tex => {
			// Mipmaps create a gray vertical line, so we have to disable them
			tex.minFilter = THREE.LinearFilter
			tex.magFilter = THREE.LinearFilter
			tex.wrapS = THREE.RepeatWrapping
			tex.wrapT = THREE.MirroredRepeatWrapping
			tex.needsUpdate = true
			const scale = camera.far * 0.707 // slightly less than 1/sqrt(2)
			const cube = new THREE.BoxGeometry(scale, scale, scale)
			const material = new THREE.ShaderMaterial({ 
				uniforms: { tex: { value: tex } }, side: THREE.DoubleSide, 
				vertexShader, fragmentShader: 'varying vec3 v_pos; uniform sampler2D tex;' + 
		'void main(){ vec3 n = normalize(v_pos); vec2 uv = vec2(atan(n.x, n.z)*'+(0.5/Math.PI)+'+.5, n.y*.5+.5); gl_FragColor = texture(tex, uv); }'
			})
			const mesh = window.envMap = new THREE.Mesh(cube, material)
			mesh.name = 'EnvironmentMap'
			scene.add(mesh)
		})
	}
}

export { createSky }