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
import { create_ground, create_light, create_button } from "./common_utils";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { CreateLines } from "@babylonjs/core/Meshes/Builders/linesBuilder";
import { ExtrudePolygon } from "@babylonjs/core/Meshes/Builders/polygonBuilder";
import { ExtrudeShape } from "@babylonjs/core/Meshes/Builders/shapeBuilder";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { PointerDragBehavior } from "@babylonjs/core/Behaviors/Meshes/pointerDragBehavior";
import { extrude_polygon } from "./extrusion_utils";


var points = []
var start_pt = null
var enable_draw = false
var poly = null
var lines = null
var spheres = []

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

        
        const ground = create_ground(scene)
        const light = create_light(scene)

        var advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        
        var draw_button_handler = () => {
            enable_draw = true
            points = []
            start_pt = null
            spheres = []
        }
        var draw_button = create_button("draw", "Enable Draw", Control.HORIZONTAL_ALIGNMENT_RIGHT, draw_button_handler)
        advancedTexture.addControl(draw_button)

        var extrude_button = create_button("extrude", "Extrude", Control.HORIZONTAL_ALIGNMENT_LEFT, () => {
        
        spheres.forEach((sphere) => {
            sphere.dispose()
        })
        spheres = []
        points.forEach((vertex, index) => {
            var handle = CreateSphere("handle "+index, { diameter: 0.1 }, scene);
            handle.position = vertex.clone();
            spheres.push(handle);
        
            // Add drag behavior to the handle
            var dragBehaviorPt = new PointerDragBehavior({
                dragPlaneNormal: new Vector3(0, 1, 0) // Drag on the XZ plane
            });
            handle.addBehavior(dragBehaviorPt);
        
            // Update the shape and re-extrude the mesh when the handle is dragged
            dragBehaviorPt.onDragObservable.add((event) => {
                console.log("here")
                points[index].x = handle.position.x;
                points[index].z = handle.position.z;
        
                // Remove the old extruded mesh
                poly.dispose();
                
                // Create a new extruded mesh with the updated shape
                poly = extrude_polygon(points, 2, scene)
                
            });
        });
            poly = extrude_polygon(points, 2, scene)
            lines.dispose();

            
            
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
                            points.push(pickInfo.pickedPoint)
                            if (lines != null) {
                                lines.dispose()
                            }
                            lines = CreateLines("lines", { points: points }, scene)
                            var sph1 = CreateSphere("pointSphere", { diameter: 0.1 }, scene);
                            sph1.position = pickInfo.pickedPoint;
                            // var dragBehavior2 = new PointerDragBehavior({
                            //     dragPlaneNormal: new Vector3(0,1,0) 
                            // });
                            // sph1.addBehavior(dragBehavior2);
                            spheres.push(sph1)
                            prev_point = pickInfo.pickedPoint
                            break;
                        case 2:
                            console.log("RIGHT");
                            if (start_pt != null) {
                                points.push(start_pt)
                            }
                            if (lines != null) {
                                lines.dispose()
                            }
                            lines = CreateLines("lines", { points: points }, scene)
                            enable_draw = false
                            draw_button.isEnabled = true
                            break;
                    }
                }
            }
        }

        return scene;
    };
}

export default new DefaultSceneWithTexture();
