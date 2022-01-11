// https://en-gb.topographic-map.com/?_path=api.maps.getOverlay&southWestLatitude=50.803493088072194&southWestLongitude=11.3843711515672&northEastLatitude=50.95071410839619&northEastLongitude=11.852700470181246&zoom=11.700000000000001&version=2021013001
function getHeight(r,g,b){
	var md1 = 1e9, md2 = 1e9
	var m1, m2
	raw.legends.forEach(l => {
		var h = l[0]
		var dr = l[1]-r
		var dg = l[2]-g
		var db = l[3]-b
		var d = dr*dr+dg*dg+db*db
		if(d < md1){
			md2 = md1
			m2 = m1
			md1 = d
			m1 = l
		} else if(d < md2){
			md2 = d
			m2 = l
		}
	})
	// find the index with the largest color difference
	var d1 = Math.abs(m1[1]-m2[1])
	var d2 = Math.abs(m1[2]-m2[2])
	var d3 = Math.abs(m1[3]-m2[3])
	var i = d1 > d2 && d1 > d3 ? 1 : d2 > d1 && d2 > d3 ? 2 : 3
	var f = (m2[i]-[r,g,b][i-1])/(m2[i]-m1[i])
	return (1-f)*m1[0] + f*m2[0]
}

function downloadURL(url){
	var id = 'download-link'
	var a = document.getElementById(id)
	if(!a){
		a = document.createElement('a')
		a.id = id
		document.body.appendChild(a)
		a.style = 'display: none'
	}
	a.href = url
	a.download = 'result.bmp'
	a.click()
}


function createImage(width, height, data){
	
	const header_size = 70;
	const image_size = width * height * 4;
	
	const arr = new Uint8Array(header_size + image_size);
	const view = new DataView(arr.buffer);

	view.setUint16(0, 0x424D, false);
	view.setUint32(2, arr.length, true);
	view.setUint32(10, header_size, true);

	view.setUint32(14, 40, true);
	view.setInt32(18, width, true);
	view.setInt32(22, height, true);
	view.setUint16(26, 1, true);
	view.setUint16(28, 32, true);
	view.setUint32(30, 6, true);
	view.setUint32(34, image_size, true);
	view.setInt32(38, 10000, true);
	view.setInt32(42, 10000, true);
	view.setUint32(46, 0, true);
	view.setUint32(50, 0, true);

	view.setUint32(54, 0x000000FF, true);
	view.setUint32(58, 0x0000FF00, true);
	view.setUint32(62, 0x00FF0000, true);
	view.setUint32(66, 0xFF000000, true);

	// Pixel data.
	for (let i = 0; i < width * height * 4; i++) {
		const offset = header_size + i
		arr[offset + 0] = data[i]
	}

	const blob = new Blob([arr], { type: "image/bmp" })
	return URL.createObjectURL(blob)
	
}

function createImage2(width, height, data){
	var s = 'P6 ' + width + ' ' + height + ' 255\n'
	for(var y=0;y<img.height;y++){
		for(var x=0;x<img.width;x++){
			var i = (x+y*img.width)*4
			s += pixelData[i] + ' ' + pixelData[i+1] + ' 0\n'
		}
	}
	return s
}

function downloadText(text){
	const blob = new Blob([text], { type: "text/text" })
	return URL.createObjectURL(blob)
}

img = new Image()
img.src = raw.overlay
img.onload = console.log

var canvas = document.createElement('canvas');
canvas.width = img.width;
canvas.height = img.height;
canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height)
var pixelData = canvas.getContext('2d').getImageData(0,0, img.width, img.height).data

for(var y=0;y<img.height;y++){
	for(var x=0;x<img.width;x++){
		var i = (x+y*img.width)*4
		var h = getHeight(pixelData[i],pixelData[i+1],pixelData[i+2])
		var b = (h * 100 + 0.5) | 0
		pixelData[i] = (b >> 8) & 255
		pixelData[i+1] = b & 255
		pixelData[i+2] = 0
	}
}

var text = createImage2(img.width, img.height, pixelData)
var url = downloadText(text)
console.log(text)
// downloadURL(url)
// window.location = url