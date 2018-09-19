const recast = require('./build/Release/RecastCLI');
const WebSocketServer = require("websocket").server;
const http = require("http")

// REcast test

//recast.loadFile('dungeon.obj');
//recast.loadContent('v -0.5 0 0.5@v -0.5 0 -0.5@...f 27 26 25@f 28 26 27@');
//recast.loadArray(new Float32Array(position), new Int32Array(index))

/*
var cellSize = 0.3;
var cellHeight = 0.2;
var agentHeight = 2;
var agentRadius = 0.5;
var agentMaxClimp = 0.9;
var agentMaxSlope = 45;

//var result = recast.build(cellSize, cellHeight, agentHeight, agentRadius, agentMaxClimp, agentMaxSlope); // return string
// console.log(result);
recast.save("dungeon_navmesh.obj");
*/

// HTTP start
function OriginIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed or not.
  return true;
}

var GameServer = {
  connections: []
};

var httpServer;
var wsServer;
httpServer = http.createServer(function (request, response) {
  console.log("Received request from " + request.url);
  response.writeHead(404);
  response.end();
});
httpServer.listen(9090, function () {
  console.log("GameServer listening on port 9090");
});
wsServer = new WebSocketServer({
  httpServer: httpServer,
  autoAcceptConnections: false,
  maxReceivedFrameSize: 131072,
  maxReceivedMessageSize: 20 * 1024 * 1024		// 20 MB?
});

wsServer.on("request", function (request) {
  if (!OriginIsAllowed(request.origin)) {
      request.reject();
      console.log("Rejected request coming from " + request.origin);
      return;
  }

  var connection = request.accept('', request.origin);
  GameServer.connections.push(connection);
  console.log('Connection accepted.');

  function buildRecastFromFloat32Array(arr) {
  
    var verticesLen = arr[13] * 3;
    var indicesLen = arr[14] * 3;
    console.log("Loading build array:..." +arr[13] + " vertices, " + arr[14] + " faces")
    recast.loadArray(new Float32Array( arr.slice(15, 15 + verticesLen) ), new Int32Array( arr.slice(15+verticesLen, 15+verticesLen+indicesLen ) ));
    console.log("Building:...")
    var result = recast.build(arr[0], arr[1], arr[2], arr[3], arr[4], arr[5], arr[6], arr[7], arr[8], arr[9], arr[10], arr[11], arr[12]); // return string
    // console.log(result);
    recast.save("navmesh.obj");
    console.log("Saved navmesh.obj!")
  }


  function getFloat32ArrayOfData(buf) {
    var fa = new Float32Array(buf.length / 4);
    for (var i = 0, p = 0; i < buf.length; i += 4, ++p) {
      fa[p] = buf.readFloatLE(i);
    }
    return fa;
  }

  function processBinaryRecast(data) {
    var arr = getFloat32ArrayOfData(data); //new Float32Array( data );
    //console.log(arr);
    if (!connection.recastStream && arr[0] < 0) {
       console.log("Recast stream received:"+(-arr[0]));
       connection.recastStream  = new Float32Array( -arr[0] );
       connection.recastStreamI = 0;
    }
    else {
       if (connection.recastStream) {
           var i;
           var c = connection.recastStreamI;
           for (i=0; i< arr.length; i++) {
              connection.recastStream[c++] = arr[i];
           }
           connection.recastStreamI += arr.length;
           if (connection.recastStreamI >=  connection.recastStream.length) {
              console.log("Recast stream done...");
              buildRecastFromFloat32Array(connection.recastStream);
              connection.recastStream = null;
           }
       }
       else {
         buildRecastFromFloat32Array(arr);
       }
    }
  }
  // Handle network client messages
  connection.on("message", function (message) {
      if (message.type === "utf8") {
          console.log('Received utf8 packet: ' + message.utf8Data);
      }
      else if (message.type === "binary") {
        console.log('Received binary packet...');
        processBinaryRecast(message.binaryData);
       
        //message.binaryData
      }
	  else {
		  console.log("Received some sort of message: " + message);
		  console.log(message);
	  }
  });

  connection.on("close", function () {
      var i = GameServer.connections.indexOf(connection);
      GameServer.connections.splice(i, 1);

      console.log("A connection was closed and removed from the connections list.");
  });
});
