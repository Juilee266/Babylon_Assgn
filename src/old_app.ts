
import { FreeCamera } from '@babylonjs/core/Cameras/freeCamera';
import { Engine } from '@babylonjs/core/Engines/engine';
import { PointerEventTypes } from '@babylonjs/core/Events/pointerEvents';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { CreateGround } from '@babylonjs/core/Meshes/Builders/groundBuilder';
import { CreateSphere } from '@babylonjs/core/Meshes/Builders/sphereBuilder';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { Scene } from '@babylonjs/core/scene';
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { AdvancedDynamicTexture, Button, Control } from '@babylonjs/gui';
import { CreateLines } from '@babylonjs/core/Meshes/Builders/linesBuilder';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { ExtrudePolygon } from '@babylonjs/core/Meshes/Builders/polygonBuilder';
import * as earcut from "earcut";
import { ExtrudeShape } from '@babylonjs/core/Meshes/Builders/shapeBuilder';

function createButton(name, text, alignment, handler) {
    var button = Button.CreateSimpleButton(name, text);
    button.color = "white";
    button.background = "green";
    button.width = 0.2;
    button.height = "40px";
    button.cornerRadius = 20;
    button.horizontalAlignment = alignment

    button.onPointerDownObservable.add(handler);
    return button
}


function render_scene() {
    // Get the canvas element from the DOM.
    const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;

    // Associate a Babylon Engine to it.
    const engine = new Engine(canvas);

    // Create our first scene.
    var scene = new Scene(engine);

    // This creates and positions a free camera (non-mesh)
    var camera = new FreeCamera("camera1", new Vector3(0, 5, -10), scene);
    // const camera = new ArcRotateCamera("Camera", 3 * Math.PI / 2, Math.PI / 2, 30, Vector3.Zero());

    // This targets the camera to scene origin
    camera.setTarget(Vector3.Zero());

    // This attaches the camera to the canvas
    camera.attachControl(canvas, true);

    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    var light = new HemisphericLight("light1", new Vector3(0, 50, 0), scene);

    // Default intensity is 1. Let's dim the light a small amount
    light.intensity = 0.7;

    // Create a grid material
    var material = new StandardMaterial("grid", scene);

    // Our built-in 'ground' shape.
    var ground = CreateGround('ground1', { width: 12, height: 12, subdivisions: 2 }, scene);

    // Affect a material
    ground.material = material;

    var advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");
    var button = createButton("draw", "Enable Draw", Control.HORIZONTAL_ALIGNMENT_RIGHT, () => {
        console.log("Button clicked")
    })
    advancedTexture.addControl(button)

    // var points = []
    // scene.onPointerObservable.add((eventData) => {
    //         // If there's a hit on some mesh
    //         if (eventData.pickInfo.pickedPoint) {
    //             // Do something with the pickedPoint vector
    //             console.log(eventData.pickInfo.pickedPoint)
    //             points.push(eventData.pickInfo.pickedPoint)
    //             const options = {
    //                 points: points,
    //                 updatable: true
    //             }
                
    //             let lines = Mesh.CreateLines("lines", points, scene, true)
    //         }
    //     }
    // );


    // var x = 0;
    // var z = 0;

    // var myPoints = [
    //     new Vector3(x - 1, 0, z + 1.5),
    //     new Vector3(x + 1, 0, z + 1.5),
    //     new Vector3(x + 1.5, 0, z),
    //     new Vector3(x + 1, 0, z - 1.5),
    //     new Vector3(x - 1, 0, z - 1.5),
    //     new Vector3(x - 1.5, 0, z),
    //     new Vector3(x - 1, 0, z + 1.5)
    // ];
    
    // // const myPoints = [
    // //     new Vector3(-2, -1, 0),
    // //     new Vector3(0, 1, 0),
    // //     new Vector3(2, -1, 0),
    // // ]

    // let lines = CreateLines("lines", {points: myPoints, updatable: true}, scene)

    // const myPoints2 = [
    //     new Vector3(-2, -1, 0),
    //     new Vector3(0, 2, 0),
    //     new Vector3(2, -1, 0),
    // ]

    // lines = CreateLines("lines", {points: myPoints2, updatable: true}, scene)
    var x = 0;
    var z = 0;
    var points = [
        new Vector3(x - 1, 0, z + 1.5),
        new Vector3(x + 1, 0, z + 1.5),
        new Vector3(x + 1.5, 0, z),
        new Vector3(x + 1, 0, z - 1.5),
        new Vector3(x - 1, 0, z - 1.5),
        new Vector3(x - 1.5, 0, z),
        new Vector3(x - 1, 0, z + 1.5)
    ];

    // Create Hex
    var hex = CreateLines("hex", {points:points}, scene);
    hex.color = Color3.Black();
    const myShape = [
        new Vector3(-2, 0, -2),
       new Vector3(0, 0, -4),
       new Vector3(2, 0, -2),
       new Vector3(2, 0, 2),
       new Vector3(1, 0, 3),
       new Vector3(-2, 0, -2)
];
var hex2 = CreateLines("hex2", {points:myShape}, scene);
    hex2.color = Color3.Black();
    const direction = new Vector3(1,1,1)
	
	const myPath = [
			new Vector3(0, 0, 0),
			direction.scale(5)
	];
    // options: { shape: Vector3[]; holes?: Vector3[][]; depth?: number; faceUV?: Vector4[]; faceColors?: Color4[]; updatable?: boolean; sideOrientation?: number; frontUVs?: Vector4; backUVs?: Vector4; wrap?: boolean; }
    var options = {
        shape: myShape,
        depth: 2,
        sideOrientation: Mesh.DOUBLESIDE,
        wrap: true
    }
    var poly = ExtrudePolygon("poly", options, scene, earcut)
    // var poly = ExtrudeShape("polygon", {shape: myShape, path: myPath, closeShape: true, cap:Mesh.CAP_ALL}, scene)

    // Render every frame
    engine.runRenderLoop(() => {
        scene.render();
    });
}

render_scene()