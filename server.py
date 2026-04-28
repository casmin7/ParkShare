import http.server
import socketserver

PORT = 8080
Handler = http.server.SimpleHTTPRequestHandler

class ThreadingSimpleServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    pass

with ThreadingSimpleServer(("", PORT), Handler) as httpd:
    print("Serving at port", PORT)
    httpd.serve_forever()
