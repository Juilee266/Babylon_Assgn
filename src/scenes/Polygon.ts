import { Vector3 } from "@babylonjs/core/Maths/math"
import { Mesh } from "@babylonjs/core/Meshes/mesh"
import { ActionManager, ExecuteCodeAction } from "@babylonjs/core/Actions";
import { PointerDragBehavior } from "@babylonjs/core/Behaviors/Meshes/pointerDragBehavior";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { ExtrudePolygon } from "@babylonjs/core/Meshes/Builders/polygonBuilder";
import * as earcut from "earcut";
import { MAX_X, MAX_Z, MIN_X, MIN_Z } from "./constants"
import { CreateSphere } from "@babylonjs/core/Meshes/Builders/sphereBuilder";
import { Scene } from "@babylonjs/core/scene";
import { HighlightLayer } from "@babylonjs/core/Layers/highlightLayer";
import { enable_edit, enable_move } from "./scene_setup";


// This class represents an object created from the shape drawn.

export class Polygon {
    vertices: Mesh[]        // Spherical vertices on polygon base
    points: Vector3[]       // Vector points on polygon base
    extruded_polygon: Mesh  // extruded polygon Mesh object
    scene: Scene            // scene to which polygon is attached
    vertex_dragBehaviors: PointerDragBehavior[] // Drag behavior of each sphere in vertices
    poly_drag_behavior: PointerDragBehavior     // Drag behavior of polygon

    constructor(scene, points) {
        this.scene = scene
        this.extruded_polygon = null
        this.vertices = []
        this.points = points
        this.vertex_dragBehaviors = []
        this.poly_drag_behavior = null
    }

    extrude(height) {
        // Creates an extruded polygon of height 'height'
        var polygonMaterial = new StandardMaterial("polygonMaterial", this.scene);
        polygonMaterial.diffuseColor = new Color3(0.7, 0.7, 0.7);

        // Extrude polygon represented by points
        this.extruded_polygon = ExtrudePolygon("poly", { shape: this.points, depth: height, sideOrientation: Mesh.DOUBLESIDE }, this.scene, earcut)
        this.extruded_polygon.material = polygonMaterial

        // Move polygon up by height
        this.extruded_polygon.position = new Vector3(0, height, 0)

        let dragBehavior = new PointerDragBehavior({
            dragPlaneNormal: new Vector3(0, 1, 0)
        });

        var initialMeshPosition = this.extruded_polygon.position.clone();

        dragBehavior.onDragStartObservable.add(() => {
            console.log("On drag start")
            initialMeshPosition.copyFrom(this.extruded_polygon.position);
        })

        dragBehavior.onDragObservable.add((event) => {
            console.log("On drag")
            
            var planePt = this.extruded_polygon.position

            let boundingInfo = this.extruded_polygon.getBoundingInfo();
            const halfWidth = boundingInfo.boundingBox.extendSize.x;
            const halfDepth = boundingInfo.boundingBox.extendSize.z;

            if (planePt.x + halfWidth > MAX_X) {
                planePt.x = MAX_X - halfWidth;
            } else if (planePt.x - halfWidth < MIN_X) {
                planePt.x = MIN_X + halfWidth;
            }
            if (planePt.z + halfDepth > MAX_Z) {
                planePt.z = MAX_Z - halfDepth;
            } else if (planePt.z - halfDepth < MIN_Z) {
                planePt.z = MIN_Z + halfDepth;
            }

            const deltaX = planePt.x - initialMeshPosition.x;
            const deltaY = planePt.y - initialMeshPosition.y;
            const deltaZ = planePt.z - initialMeshPosition.z;

            this.points.forEach((pt) => {
                pt.x += deltaX
                pt.y += deltaY
                pt.z += deltaZ
            });
            this.extruded_polygon.position = planePt
            initialMeshPosition.copyFrom(this.extruded_polygon.position);
            this.adjust_vertices()
        })

        // Attach behavior to polygon
        this.extruded_polygon.addBehavior(dragBehavior);
        this.poly_drag_behavior = dragBehavior

        if (enable_move == false) {
            this.poly_drag_behavior.detach()
        }

        // Highlighting the polygon when in move mode
        var hl = new HighlightLayer("hl1", this.scene, {
            isStroke: false,
        });

        this.extruded_polygon.actionManager = new ActionManager(this.scene);

        // On mouse over
        this.extruded_polygon.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPointerOverTrigger, () => {
            if (enable_move) {
                this.scene.hoverCursor = "pointer";
                hl.addMesh(this.extruded_polygon, Color3.Red());
            }
        }));

        // On mouse out
        this.extruded_polygon.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, () => {
            if (enable_move) {
                hl.removeMesh(this.extruded_polygon);
            }
        }));
    }

    enable_move() {
        // Enable drag movement of polygon
        this.poly_drag_behavior.attach(this.extruded_polygon)
    }

    disable_move() {
        // Disable drag movement of polygon
        this.poly_drag_behavior.detach()
    }

    disable_edit() {
        // Disable repositioning of individual vertices of polygon base
        this.vertices.forEach((sphere, index) => {
            if (this.vertex_dragBehaviors[index]) {
                this.vertex_dragBehaviors[index].detach();
            }
        });
    }

    enable_edit() {
        // Enable repositioning of individual vertices of polygon base by dragging
        this.vertex_dragBehaviors = []
        this.vertices.forEach((vertex, index) => {
            var dragBehaviorPt = new PointerDragBehavior({
                dragPlaneNormal: new Vector3(0, 1, 0)
            });

            dragBehaviorPt.onDragObservable.add((event) => {
                this.points[index].x = vertex.position.x;
                this.points[index].y = vertex.position.y;
                this.points[index].z = vertex.position.z;
                this.extruded_polygon.dispose();
                this.extrude(2)
            });
            this.vertices[index].addBehavior(dragBehaviorPt);
            this.vertex_dragBehaviors.push(dragBehaviorPt)
        })
    }

    adjust_vertices() {
        // Recreate base vertices and add them again with updated point positions.
        this.vertices.forEach((sphere) => {
            sphere.dispose()
        })
        this.vertices = []
        this.points.forEach((vertex, index) => {
            let handle = CreateSphere("handle " + index, { diameter: 0.15 }, this.scene);
            handle.position = vertex.clone();
            this.vertices.push(handle);

            let hl = new HighlightLayer("hl1", this.scene, {
                isStroke: false,
            });

            // Highlight the vertices in edit mode
            handle.actionManager = new ActionManager(this.scene);

            // On mouse over
            handle.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPointerOverTrigger, () => {
                if (enable_edit) {
                    this.scene.hoverCursor = "pointer";
                    hl.addMesh(handle, Color3.Red());
                }
            }));

            // On mouse out
            handle.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, () => {
                if (enable_edit) {
                    hl.removeMesh(handle);
                }
            }));
        });
        if (enable_edit) {
            this.enable_edit()
        }


    }
}