
// utils functions, which are purely mathematical

function mix(a,b,f){
	return (1-f)*a+f*b
}

function unmix(a,b,f){
	return (f-a)/(b-a)
}

function clamp(a,min,max){
	return a < min ? min : a < max ? a : max
}

const degToRad = Math.PI / 180
const radToDeg = 180 / Math.PI

export { mix, unmix, clamp, degToRad, radToDeg };