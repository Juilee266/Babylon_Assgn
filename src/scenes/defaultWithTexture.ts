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
import { create_ground, create_light, create_button, create_gui } from "./common_utils";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { CreateLines } from "@babylonjs/core/Meshes/Builders/linesBuilder";
import { ExtrudePolygon } from "@babylonjs/core/Meshes/Builders/polygonBuilder";
import { ExtrudeShape } from "@babylonjs/core/Meshes/Builders/shapeBuilder";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { PointerDragBehavior } from "@babylonjs/core/Behaviors/Meshes/pointerDragBehavior";
import { extrude_polygon } from "./extrusion_utils";
import { Polygon } from "./Polygon";


var points = []
var start_pt = null
export var enable_draw = false
export var enable_move = false
export var enable_edit = false

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
        var prev_point = null

        const ground = create_ground(scene)
        const light = create_light(scene)

        var advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");

        var draw_button_handler = () => {
            enable_draw = true
            points = []
            start_pt = null
            prev_point = null
            spheres = []
        }


        var extrude_button_handler = () => {
            poly = new Polygon(scene, points)
            poly.adjust_vertices()
            poly.extrude(2)
            spheres.forEach((sphere) => {
                sphere.dispose()
            })
            lines.dispose()
        }

        var move_button_handler = () => {
            console.log("move handler", poly)
            if (poly != null) {
                if (enable_move == true) {
                    enable_move = false
                    poly.disable_move()
                }
                else {
                    enable_move = true
                    poly.enable_move()
                }
            }
        }
        var edit_button_handler = () => {
            if (poly != null) {
                if (enable_edit == true) {
                    enable_edit = false
                    poly.disable_edit()
                }
                else {
                    enable_edit = true
                    poly.enable_edit()
                }
            }
        }

        advancedTexture = create_gui(advancedTexture, draw_button_handler, move_button_handler, edit_button_handler, extrude_button_handler)

        // if (enable_draw) {


        scene.onPointerDown = function (event, pickInfo) {
            // .add((eventData) => {
            console.log(enable_draw)

            if (enable_draw) {
                // If there's a hit on some mesh
                console.log("clicked ", prev_point, pickInfo.pickedPoint)
                if (pickInfo.pickedPoint && prev_point != pickInfo.pickedPoint) {
                    // draw_button.isEnabled = false
                    switch (event.button) {
                        case 0:
                            if (start_pt == null) {
                                start_pt = pickInfo.pickedPoint
                            }
                            points.push(pickInfo.pickedPoint)
                            if (lines != null) {
                                lines.dispose()
                            }
                            lines = CreateLines("lines", { points: points }, scene)
                            var sph1 = CreateSphere("pointSphere", { diameter: 0.1 }, scene);
                            sph1.position = pickInfo.pickedPoint;
                            spheres.push(sph1)
                            prev_point = pickInfo.pickedPoint
                            break;
                        case 2:
                            console.log("RIGHT");
                            // if (start_pt != null) {
                            //     points.push(start_pt)
                            // }
                            if (lines != null) {
                                lines.dispose()
                            }
                            lines = CreateLines("lines", { points: points.concat([start_pt]) }, scene)
                            enable_draw = false
                            advancedTexture.getControlByName("extrude").isEnabled = true
                            break;
                    }
                }
            }
        }

        return scene;
    };
}

export default new DefaultSceneWithTexture();
