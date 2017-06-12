A TCP server written in Node which performs the following:

Exposes a GET API as &quot;api/request?connId=19&amp;timeout=80&quot;

Exposes a GET API as &quot;api/serverStatus&quot;

Exposes a PUT API as &quot;api/kill&quot; with payload as {&quot;connId&quot;:12}


Usage:

npm install (this installs all the dependencies)

node node_server.js (this runs the code)

send requests using curl:

1. for adding a new connection:
    curl 'http://127.0.0.1:1337/api/request?connId=12&timeout=32' 

2. for viewing the status:
    curl 'http://127.0.0.1:1337/api/serverStatus' 

3. for deleting a connection using PUT:
	curl -X PUT -H 'Content-Type: application/json' PUT -d '{'connId':'12'}' 127.0.0.1:1337/api/kill

