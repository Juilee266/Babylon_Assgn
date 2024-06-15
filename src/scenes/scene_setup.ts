import { Scene } from "@babylonjs/core/scene";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { CreateSphere } from "@babylonjs/core/Meshes/Builders/sphereBuilder";
import { CreateSceneClass } from "../createScene";
import "@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent";
import "@babylonjs/core/Culling/ray";
import { AbstractEngine } from "@babylonjs/core/Engines/abstractEngine";
import { AdvancedDynamicTexture, Control, TextBlock } from "@babylonjs/gui";
import { create_ground, create_light, create_button, create_gui, setText } from "./common_utils";
import { CreateLines } from "@babylonjs/core/Meshes/Builders/linesBuilder";
import { Polygon } from "./Polygon";


var points = []                 // Maintains Vector3 points selected 
var start_pt = null             // start vector of current polygon
export var enable_draw = false  // if true, you can select vertices on the ground
export var enable_move = false  // if true, you can move any object on the ground
export var enable_edit = false  // if true, you can edit vertices of any object

var polygons = []       // Maintains a list of all polygons on the ground
var lines = null        // Maintains lines drawn for current polygon before it is extruded
var spheres = []        // Maintains a list of spherical vertices for current polygon
var curr_poly = null    // current polygon object

export class DefaultSceneWithTexture implements CreateSceneClass {
    createScene = async (
        engine: AbstractEngine,
        canvas: HTMLCanvasElement
    ): Promise<Scene> => {

        const scene = new Scene(engine);

        const camera = new ArcRotateCamera(
            "MY_CAMERA",
            0,
            Math.PI / 3,
            15,
            new Vector3(0, 0, 0),
            scene
        );

        // This targets the camera to scene origin
        camera.setTarget(Vector3.Zero());

        // This attaches the camera to the canvas
        camera.attachControl(canvas, true);

        // Create ground plane
        const ground = create_ground(scene)

        // Create light source
        const light1 = create_light(scene, new Vector3(-1,-1,-1))
        const light2 = create_light(scene, new Vector3(0,0,0))
        const light3 = create_light(scene, new Vector3(0,1,0))
        const light4 = create_light(scene, new Vector3(1,-1,0))
        const light5 = create_light(scene, new Vector3(1,0,0))

        // For GUI
        var advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");

        // Called with the handler of "Enable Draw" button
        var draw_button_handler = () => {
            enable_draw = true
            points = []
            start_pt = null
            spheres = []
            curr_poly = null
            lines = null
        }

        // Called with the handler of "Extrude" button
        var extrude_button_handler = () => {
            if (curr_poly != null && curr_poly.extruded_polygon != null) {
                return;
            }

            // Remove 2D vertices. They are added with behavior in adjust_vertices
            spheres.forEach((sphere) => {
                sphere.dispose()
            })

            curr_poly.adjust_vertices()
            curr_poly.extrude(2)

            
            // Remove 2D lines
            lines.dispose()

            // Enable Draw button
            advancedTexture.getControlByName("draw").isEnabled = true;
            advancedTexture.getControlByName("extrude").isEnabled = false;

        }

        // Called with the handler of "Enable Move" button
        var move_button_handler = () => {
            if (enable_move == true) {

                polygons.forEach((poly) => {
                    if (poly != null) {
                        enable_move = false
                        poly.disable_move();
                        setText(advancedTexture, false)
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

        // Called with the handler of "Enable Edit" button
        var edit_button_handler = () => {
            if (enable_edit == true) {
                polygons.forEach((poly) => {
                    if (poly != null) {
                        enable_edit = false
                        poly.disable_edit();
                        setText(advancedTexture, false)
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

        // Create all the buttons along with textblocks
        advancedTexture = create_gui(advancedTexture, draw_button_handler, move_button_handler, edit_button_handler, extrude_button_handler)

        // Called when a clicked on the ground
        scene.onPointerDown = function (event, pickInfo) {
            setTimeout(() => {
                
            if (enable_draw) {
                if (pickInfo.pickedPoint) {
                    switch (event.button) {
                        // Left click: Add points to current shape
                        case 0:
                            if (start_pt == null) {
                                start_pt = pickInfo.pickedPoint
                            }
                            points.push(pickInfo.pickedPoint)
                            if (lines != null) {
                                lines.dispose()
                            }
                            lines = CreateLines("lines", { points: points }, scene)
                            let sph1 = CreateSphere("pointSphere", { diameter: 0.15 }, scene);
                            sph1.position = pickInfo.pickedPoint;
                            spheres.push(sph1)
                            break;

                        // Right click: Finish shape by joining first and last vertex
                        case 2:
                            if (!points || points.length < 3) {
                                break;
                            }
                            if (lines) {
                                lines.dispose()
                            }
                            advancedTexture.getControlByName("extrude").isEnabled = true
                            lines = CreateLines("lines", { points: points.concat([start_pt]) }, scene)
                            let poly = new Polygon(scene, points)
                            polygons.push(poly)
                            curr_poly = poly
                            enable_draw = false

                            // Disable Draw button
                            advancedTexture.getControlByName("draw").isEnabled = false;
                            setText(advancedTexture, true)
                            
                            
                            break;
                    }
                }
            }
            }, 300);
        }

        return scene;
    };
}

export default new DefaultSceneWithTexture();
