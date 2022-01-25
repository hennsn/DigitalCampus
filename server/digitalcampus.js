
// used packages
const http = require('http')
const url  = require('url')

// static data
const players = {}
const messages = []

// constants, configurable
const messageCountLimit = 10

const timeout = 10e3 // 10s
const messageTimeout = 30e3 // 30s

function addMessage(sender, message, time){
	if(messages.length >= messageCountLimit){
		// remove the first element
		messages.splice(0, 1)
	}
	messages.push({ sender, message, time })
}

http.createServer((req, res) => {
	var params = url.parse(req.url, true).query
	if(params.name && params.x && params.y && params.z){
		// remove all old players
		const time = new Date().getTime()
		for(key in players){
			const player = players[key]
			if(Math.abs(player.lastTime - time) > timeout){
				addMessage('-', params.name, time)
				delete players[key]
			}
		}
		// remove all old messages
		// they are sorted by time
		var timedOutMessages = 0
		while(timedOutMessages < messages.length &&
			Math.abs(messages[timedOutMessages].time - time) > messageTimeout){
			timedOutMessages++
		}
		if(timedOutMessages > 0){
			messages.splice(0, timedOutMessages)
		}
		// "send" message, if needed
		if(params.message){ addMessage(params.name, params.message, time) }
		// update player information
		if(!players[params.name]){
			// player just joined
			// + could be translated by the client
			addMessage('+', params.name, time)
		}
		players[params.name] = { 
			// position
			x: params.x*1, y: params.y*1, z: params.z*1,
			// head rotation
			rx: (params.rx*1 || 0), ry: (params.ry*1 || 0),
			// when the message was received
			lastTime: time 
		}
		// list all new players
		res.writeHead(200, {
			'Content-Type': 'text/plain',
			'Access-Control-Allow-Origin': '*'
		})
		// could be filtered for the "self" player,
		// lastTime isn't really needed either
		res.end(JSON.stringify({ players, messages }))
	} else {
		res.writeHead(404, {'Content-Type': 'text/plain'})
		res.end('Incomplete request, please specify name, x,y,z')
	}
}).listen(62987) // the port where the server is running on; on Uberspace, this is mapped to port 80/443