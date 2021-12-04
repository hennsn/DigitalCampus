
import * as THREE from 'https://cdn.skypack.dev/three@0.134.0'

function createSky(scene){
	// temporary sky color as long as we don't have a HDR for that
	scene.background = new THREE.Color(0x768ca1)
	hdrLoader.setDataType(THREE.HalfFloatType) // alternatives: UnsignedByteType/FloatType/HalfFloatType
	const url = 'kloofendal_38d_partly_cloudy_2k.hdr'
	hdrLoader.load(url, (tex, texData) => {
		tex.magFilter = THREE.LinearFilter
		tex.needsUpdate = true
		const scale = camera.far * 0.707 // slightly less than 1/sqrt(2)
		const cube = new THREE.BoxGeometry(scale, scale, scale)
		const material = new THREE.ShaderMaterial({
			uniforms: { tex: { value: tex }, exposure: { value: 5 } }, side: THREE.DoubleSide,
			vertexShader: 'varying vec3 v_pos; void main(){ v_pos = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1); }',
			fragmentShader: 'varying vec3 v_pos; uniform float exposure; uniform sampler2D tex; void main(){ vec3 n = normalize(v_pos); vec3 c = texture(tex, vec2(atan(n.x, n.z)*'+(0.5/Math.PI)+'+.5, n.y*.5+.5)).rgb * exposure; gl_FragColor = vec4(c/(1.0+c), 1); }' // x/(1+x) is equal to Reinhard tonemapping (as long as we don't render in HDR)
		})
		const mesh = window.envMap = new THREE.Mesh(cube, material)
		mesh.name = 'EnvironmentMap'
		scene.add(mesh)
	})
}

export { createSky }