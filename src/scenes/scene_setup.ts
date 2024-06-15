import { Scene } from "@babylonjs/core/scene";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { CreateSphere } from "@babylonjs/core/Meshes/Builders/sphereBuilder";
import { CreateSceneClass } from "../createScene";

import "@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent";
import "@babylonjs/core/Culling/ray";
import { AbstractEngine } from "@babylonjs/core/Engines/abstractEngine";
import { AdvancedDynamicTexture, Control } from "@babylonjs/gui";
import { create_ground, create_light, create_button, create_gui } from "./common_utils";
import { CreateLines } from "@babylonjs/core/Meshes/Builders/linesBuilder";
import { Polygon } from "./Polygon";


var points = []
var start_pt = null
export var enable_draw = false
export var enable_move = false
export var enable_edit = false

var polygons = []
var lines = null
var spheres = []
var curr_poly = null

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
            curr_poly = null
        }

        var extrude_button_handler = () => {
            if (curr_poly != null && curr_poly.extruded_polygon != null) {
                return;
            }
            curr_poly.adjust_vertices()
            curr_poly.extrude(2)
            // polygons.push(curr_poly)
            spheres.forEach((sphere) => {
                sphere.dispose()
            })
            lines.dispose()
        }

        var move_button_handler = () => {
            console.log("move_button_handler", polygons.length)
            if (enable_move == true) {
                
                polygons.forEach((poly) => {
                    if (poly != null) {
                        enable_move = false
                        poly.disable_move()
                    }
                })
            }
            else {
                polygons.forEach((poly) => {
                    if (poly != null) {
                        enable_move = true
                        poly.enable_move()
                    }
                })
            }

        }
        var edit_button_handler = () => {
            if (enable_edit == true) {
                polygons.forEach((poly) => {
                    if (poly != null) {
                        enable_edit = false
                        poly.disable_edit()
                    }
                })
            }
            else {
                polygons.forEach((poly) => {
                    if (poly != null) {
                        enable_edit = true
                        poly.enable_edit()
                    }
                })
            }
        }

        advancedTexture = create_gui(advancedTexture, draw_button_handler, move_button_handler, edit_button_handler, extrude_button_handler)


        scene.onPointerDown = function (event, pickInfo) {
            console.log(enable_draw)

            if (enable_draw) {
                // If there's a hit on some mesh
                console.log("clicked ", prev_point, pickInfo.pickedPoint, event.button)
                if (pickInfo.pickedPoint && prev_point != pickInfo.pickedPoint) {
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
                            var sph1 = CreateSphere("pointSphere", { diameter: 0.15 }, scene);
                            sph1.position = pickInfo.pickedPoint;
                            spheres.push(sph1)
                            prev_point = pickInfo.pickedPoint
                            console.log("HERE")
                            break;
                        case 2:
                            
                            if (lines != null) {
                                lines.dispose()
                            }
                            lines = CreateLines("lines", { points: points.concat([start_pt]) }, scene)
                            var poly = new Polygon(scene, points)
                            polygons.push(poly)
                            curr_poly = poly
                            enable_draw = false
                            console.log("enabled")
                            break;
                    }
                }
            }
        }

        return scene;
    };
}

export default new DefaultSceneWithTexture();
