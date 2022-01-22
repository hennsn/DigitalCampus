#Use to create local host
#My PC misinterprets .js files as plain text, hence the server
#You can just continue using your server, it won't matter
import http.server
import socketserver

PORT = 8000

Handler = http.server.SimpleHTTPRequestHandler
Handler.extensions_map.update({
      ".js": "application/javascript",
});

print ("Serving at port", PORT)
print(Handler.extensions_map[".js"])

httpd = socketserver.TCPServer(("", PORT), Handler)
httpd.serve_forever()