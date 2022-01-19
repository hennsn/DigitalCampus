var http = require('http')
var express = require('express')
var url = require('url')
var cors = require('cors')

var players = {}

var timeout = 10e3 // ms


http.createServer((req, res) => {
	var params = url.parse(req.url, true).query
	if(params.name && params.x && params.y && params.z){
		// remove all old players
		const time = new Date().getTime()
		for(key in players){
			const player = players[key]
			if(Math.abs(player.lastTime - time) > timeout){
				delete players[key]
			}
		}
		players[params.name] = { x: params.x*1, y: params.y*1, z: params.z*1, lastTime: time }
		// list all new players
		res.writeHead(200, {'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*'})
		// could be filtered for the "self" player,
		// lastTime isn't really needed either
		res.end(JSON.stringify(players))
	} else {
		res.writeHead(404, {'Content-Type': 'text/plain'})
		res.end('Incomplete request, please specify name, x,y,z')
	}
}).listen(62987)