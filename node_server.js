var net = require('net');
const url = require('url');
const querystring = require('querystring');
const JsonSocket = require('json-socket');

var conn_and_time_out = {};
var conn_and_time_expire = {};
var conn_and_socket = {};

function timeout_func(socket, conn_id, time_out) {
    
    setTimeout(function() {
        
        add_new_connection(socket, conn_id);
    }, parseInt(time_out) * 1000);
}

function add_new_connection(socket, connId) {
    socket.sendEndMessage({ 'status': 'ok' });
    delete conn_and_time_out[connId];
    delete conn_and_time_expire[connId];
}

var server = net.createServer(function(socket) {
    socket.on('data', function(data) {
        socket = new JsonSocket(socket);
        all_data = data.toString().split(' ');
        
        url_function = all_data[1];
        parsed_url = url.parse(url_function);
        path_name = parsed_url.pathname;
        //add new connection
        if (path_name == '/api/request') {
            query_param = querystring.parse(parsed_url['query'])

            conn_id = query_param['connId'];
            time_out = query_param['timeout'];

            conn_and_time_out[conn_id] = time_out;
            var expiry_date = new Date();
            expiry_date.setSeconds(expiry_date.getSeconds() + parseInt(time_out));
            conn_and_time_expire[conn_id] = expiry_date;

            conn_and_socket[conn_id] = socket;
            console.log("Added connection with ID: ", conn_id);
            timeout_func(socket, conn_id, time_out);

            
            
        }
        //send server status
        else if (path_name == '/api/serverStatus') {
            var conn_and_time_left = {};
            var date = new Date();
            for (conn_id in conn_and_time_expire) {
                
                seconds_left = Math.abs(conn_and_time_expire[conn_id] - date) / 1000;
                conn_and_time_left[conn_id] = seconds_left;
                
            }
            socket.sendEndMessage(conn_and_time_left);
        } else if (path_name == '/api/kill') {
            last_all = all_data[all_data.length - 1];
            var reg_ex = /\{([^)]+)\}/;
            var matches = reg_ex.exec(last_all);
            
            conn_id_url = url.parse(matches[1]);
            
            if (conn_id_url.protocol == 'connid:') {
                conn_id = conn_id_url.host;
                
                socket_c = conn_and_socket[conn_id];
                
                if (socket_c) {
                    socket_c.sendEndMessage({ 'status': 'killed' });
                    socket.sendEndMessage({ 'status': 'ok' });
                    console.log("Deleted connection with ID: ", conn_id);
                    delete conn_and_time_out[conn_id];
                    delete conn_and_time_expire[conn_id];
                    delete conn_and_socket[conn_id];
                }
                else{
                	socket.sendEndMessage({ 'status': 'Invalid Connection ID: ' + conn_id });
                }

            }
        }
    });
    // socket.pipe(socket);
});

server.listen(1337, 'localhost');
