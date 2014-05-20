import SimpleHTTPServer
import BaseHTTPServer
import json

PORT = 8000

class SimpleGetPostHandler(SimpleHTTPServer.SimpleHTTPRequestHandler):
  def do_POST(s):
    length = int(s.headers['Content-Length'])
    data = json.loads(s.rfile.read(length).decode('utf-8'))
    print 'Data received!'
    filename = data['__franklin_file_name']
    del data['__franklin_file_name']
    with open(filename, 'w') as f:
      json.dump(data, f)

    s.send_response(200)
    s.send_header('Content-Type', 'text/plain')
    s.end_headers()
    s.wfile.write('Data successfully received!')

server_class = BaseHTTPServer.HTTPServer
httpd = server_class(('', PORT), SimpleGetPostHandler)

print 'Serving at port: ', PORT
httpd.serve_forever()
