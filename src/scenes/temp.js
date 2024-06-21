// const createScene = function () {
// 	const scene = new BABYLON.Scene(engine);

	// const camera = new BABYLON.ArcRotateCamera("Camera", 3 * Math.PI / 2, 3 * Math.PI / 8, 30, BABYLON.Vector3.Zero());
	// camera.attachControl(canvas, true);
	// const light = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 50, 0));

// // Define the vertices of the polygon
//     var vertices = [
//             new BABYLON.Vector3(-1, 0, -1),
//             new BABYLON.Vector3(1, 0, -1),
//             new BABYLON.Vector3(1, 0, 1),
//             new BABYLON.Vector3(-1, 0, 1)
//         ];
    
//         // Vertices of the second surface
//         var vertices2 = [
//             new BABYLON.Vector3(-0.5, 2, -0.5),
//             new BABYLON.Vector3(0.5, 2, -0.5),
//             new BABYLON.Vector3(0.5, 2, 0.5),
//             new BABYLON.Vector3(-0.5, 2, 0.5)
//         ];

//     // Define the indices for the faces (triangles)
//     var indices = [
//         0, 1, 2,
//         0, 2, 3
//     ];
//     var indices2 = [
//         0, 1, 2,
//         0, 2, 3
//     ];

    // Create custom mesh
    var customMesh = new BABYLON.Mesh("customPolygon", scene);
    var vertexData = new BABYLON.VertexData();
    vertexData.positions = [];
    vertexData.indices = indices;

    var customMesh2 = new BABYLON.Mesh("customPolygon2", scene);
    var vertexData2 = new BABYLON.VertexData();
    vertexData2.positions = [];
    vertexData2.indices = indices2;

    // Flatten vertices into a flat array
    vertices.forEach(v => {
        vertexData.positions.push(v.x, v.y, v.z);
    });
    vertices2.forEach(v => {
        vertexData2.positions.push(v.x, v.y, v.z);
    });

    // Apply the vertex data to the custom mesh
    vertexData.applyToMesh(customMesh);
    vertexData2.applyToMesh(customMesh2);

    // Optional: Apply a material to the polygon for better visibility
    var material = new BABYLON.StandardMaterial("material", scene);
    material.diffuseColor = new BABYLON.Color3(0, 1, 0); // Green color
    customMesh.material = material;
    customMesh2.material = material;

// 	return scene;
// }


// var vertices1 = [
//     new Vector3(-1, 0, -1),
//     new Vector3(1, 0, -1),
//     new Vector3(1, 0, 1),
//     new Vector3(-1, 0, 1)
// ];

// // Vertices of the second surface
// var vertices2 = [
//     new Vector3(-0.5, 2, -0.5),
//     new Vector3(0.5, 2, -0.5),
//     new Vector3(0.5, 2, 0.5),
//     new Vector3(-0.5, 2, 0.5)
// ];

// // var l1 = CreateLines("l1", {points: vertices1})
// var l2 = CreateLines("l2", {points: vertices2})

// var positions = [];
// vertices1.forEach(v => positions.push(v.x, v.y, v.z));
// vertices2.forEach(v => positions.push(v.x, v.y, v.z));

// var indices = [];
// var numVertices = vertices1.length;

// for (var i = 0; i < numVertices; i++) {
//     var next = (i + 1) % numVertices;
//     // First triangle
//     indices.push(i, next, numVertices + i);
//     // Second triangle
//     indices.push(next, numVertices + next, numVertices + i);
// }

// // Create custom mesh
//         var customMesh = new Mesh("custom", scene);
//         var vertexData = new VertexData();
//         vertexData.positions = positions;
//         vertexData.indices = indices;
//         vertexData.applyToMesh(customMesh);