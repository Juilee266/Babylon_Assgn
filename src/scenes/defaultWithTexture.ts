import { Scene } from "@babylonjs/core/scene";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { CreateSphere } from "@babylonjs/core/Meshes/Builders/sphereBuilder";
import { CreateGround } from "@babylonjs/core/Meshes/Builders/groundBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { CreateSceneClass } from "../createScene";

import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";

import "@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent";
import "@babylonjs/core/Culling/ray";
import { AbstractEngine } from "@babylonjs/core/Engines/abstractEngine";
import { AdvancedDynamicTexture, Control } from "@babylonjs/gui";
import { createButton } from "./common";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { CreateLines } from "@babylonjs/core/Meshes/Builders/linesBuilder";
import { ExtrudePolygon } from "@babylonjs/core/Meshes/Builders/polygonBuilder";
import * as earcut from "earcut";
import { ExtrudeShape } from "@babylonjs/core/Meshes/Builders/shapeBuilder";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { PointerDragBehavior } from "@babylonjs/core/Behaviors/Meshes/pointerDragBehavior";

export class DefaultSceneWithTexture implements CreateSceneClass {
    createScene = async (
        engine: AbstractEngine,
        canvas: HTMLCanvasElement
    ): Promise<Scene> => {
        // This creates a basic Babylon Scene object (non-mesh)
        const scene = new Scene(engine);


        // This creates and positions a free camera (non-mesh)
        const camera = new ArcRotateCamera(
            "my first camera",
            0,
            Math.PI / 3,
            10,
            new Vector3(0, 0, 0),
            scene
        );

        // This targets the camera to scene origin
        camera.setTarget(Vector3.Zero());

        // This attaches the camera to the canvas
        camera.attachControl(canvas, true);

        // Our built-in 'sphere' shape.
        // const sphere = CreateSphere(
        //     "sphere",
        //     { diameter: 2, segments: 32 },
        //     scene
        // );

        // Move the sphere upward 1/2 its height
        // sphere.position.y = 1;

        // Our built-in 'ground' shape.
        var groundWidth = 10;
        var groundHeight = 10;
        var minX = -groundWidth / 2;
        var maxX = groundWidth / 2;
        var minZ = -groundHeight / 2;
        var maxZ = groundHeight / 2;

        const ground = CreateGround(
            "ground",
            { width: groundWidth, height: groundHeight },
            scene
        );

        // Load a texture to be used as the ground material
        const groundMaterial = new StandardMaterial("ground material", scene);
        // groundMaterial.diffuseTexture = new Texture(grassTextureUrl, scene);

        var polygonMaterial = new StandardMaterial("polygonMaterial", scene);
        polygonMaterial.diffuseColor = new Color3(1, 0, 0); // Red color

        ground.material = groundMaterial;
        ground.receiveShadows = true;

        const light = new DirectionalLight(
            "light",
            new Vector3(0, -1, 1),
            scene
        );
        light.intensity = 0.5;
        light.position.y = 10;

        // const shadowGenerator = new ShadowGenerator(512, light)
        // shadowGenerator.useBlurExponentialShadowMap = true;
        // shadowGenerator.blurScale = 2;
        // shadowGenerator.setDarkness(0.2);

        // shadowGenerator.getShadowMap()!.renderList!.push(sphere);

        var points = []
        var start_pt = null
        var enable_draw = false


        var advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        var draw_button = createButton("draw", "Enable Draw", Control.HORIZONTAL_ALIGNMENT_RIGHT, () => {
            enable_draw = true
            points = []
            start_pt = null
        })
        advancedTexture.addControl(draw_button)

        var extrude_button = createButton("extrude", "Extrude", Control.HORIZONTAL_ALIGNMENT_LEFT, () => {
            console.log("Call extrude");
            console.log(points)
            // const myPath = [
            //     new Vector3(0, 0, 0),
            //     new Vector3(0,1,0)
        // ];
            var poly = ExtrudePolygon("poly", {shape: points, depth: 2, sideOrientation: Mesh.DOUBLESIDE}, scene, earcut)
            poly.position = new Vector3(0, 2, 0)
            poly.material = polygonMaterial

            
            var dragBehavior = new PointerDragBehavior({
                dragPlaneNormal: new Vector3(0,1,0) 
            });
            poly.addBehavior(dragBehavior);

            
            // poly.position = new Vector3(1,1,1)
            // var poly = ExtrudeShape("polygon", {shape: points, path: myPath, closeShape: true, cap:Mesh.CAP_ALL}, scene)
            
        })
        advancedTexture.addControl(extrude_button)

        // if (enable_draw) {
        var prev_point = null
        scene.onPointerDown = function (event, pickInfo){
        // .add((eventData) => {
            console.log(enable_draw)
            
            if (enable_draw) {
                // If there's a hit on some mesh
                console.log("clicked ", prev_point,pickInfo.pickedPoint )
                if (pickInfo.pickedPoint && prev_point != pickInfo.pickedPoint) {
                    draw_button.isEnabled = false
                    switch (event.button) {
                        case 0:
                            if (start_pt == null) {
                                start_pt = pickInfo.pickedPoint
                            }
                            console.log("PUSH")
                            var pt =
                            points.push(pickInfo.pickedPoint)
                            var sphere = CreateSphere("pointSphere", { diameter: 0.1 }, scene);
                            sphere.position = pickInfo.pickedPoint;
                            // var dragBehavior2 = new PointerDragBehavior({
                            //     dragPlaneNormal: new Vector3(0,1,0) 
                            // });
                            // sphere.addBehavior(dragBehavior2);
                            prev_point = pickInfo.pickedPoint
                            break;
                        case 1:
                            console.log("MIDDLE");
                            break;
                        case 2:
                            console.log("RIGHT");
                            if (start_pt != null) {
                                points.push(start_pt)
                            }
                            let lines = CreateLines("lines", { points: points }, scene)
                            
                            enable_draw = false
                            draw_button.isEnabled = true
                            break;
                    }
                    // Do something with the pickedPoint vector


                    // let lines = Mesh.CreateLines("lines", points, scene, true)
                }
            }
        }
        
        // }

        return scene;
    };
}

export default new DefaultSceneWithTexture();
