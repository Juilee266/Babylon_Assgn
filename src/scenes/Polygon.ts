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
import { CreateLines } from "@babylonjs/core/Meshes/Builders/linesBuilder";
import { Scene } from "@babylonjs/core/scene";
import { HighlightLayer } from "@babylonjs/core/Layers/highlightLayer";
import { enable_edit, enable_move } from "./defaultWithTexture";


export class Polygon {
    vertices: Mesh[]
    points: Vector3[]
    extruded_polygon: Mesh
    scene: Scene
    vertex_dragBehaviors: PointerDragBehavior[]
    poly_drag_behavior: PointerDragBehavior

    constructor(scene, points) {
        this.scene = scene
        this.extruded_polygon = null
        this.vertices = []
        this.points = points
        this.vertex_dragBehaviors = []
        this.poly_drag_behavior = null
    }

    extrude(height) {
        var polygonMaterial = new StandardMaterial("polygonMaterial", this.scene);
        polygonMaterial.diffuseColor = new Color3(1, 0, 0);

        this.extruded_polygon = ExtrudePolygon("poly", { shape: this.points, depth: height, sideOrientation: Mesh.DOUBLESIDE }, this.scene, earcut)
        this.extruded_polygon.material = polygonMaterial
        this.extruded_polygon.position = new Vector3(0, 2, 0)
        var boundingInfo = this.extruded_polygon.getBoundingInfo();

        var dragBehavior = new PointerDragBehavior({
            dragPlaneNormal: new Vector3(0, 1, 0)
        });

        var initialMeshPosition = this.extruded_polygon.position.clone();

        dragBehavior.onDragStartObservable.add(() => {
            initialMeshPosition.copyFrom(this.extruded_polygon.position);
        })

        dragBehavior.onDragObservable.add((event) => {
            var planePt = this.extruded_polygon.position
            
            var halfWidth = boundingInfo.boundingBox.extendSize.x;
            var halfDepth = boundingInfo.boundingBox.extendSize.z;
        
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

            var deltaX = planePt.x - initialMeshPosition.x;
            var deltaY = planePt.y - initialMeshPosition.y;
            var deltaZ = planePt.z - initialMeshPosition.z;
            
            this.points.forEach((pt) => {
                pt.x += deltaX
                pt.y += deltaY
                pt.z += deltaZ
            });
            this.extruded_polygon.position = planePt
            initialMeshPosition.copyFrom(this.extruded_polygon.position);
            this.adjust_vertices()

        })
        // if(this.poly_drag_behavior != null) {
        //     this.poly_drag_behavior.detach()
        // }
        
        this.extruded_polygon.addBehavior(dragBehavior);
        this.poly_drag_behavior = dragBehavior

        if(enable_move == false) {
            this.poly_drag_behavior.detach()
        }

        var hl = new HighlightLayer("hl1", this.scene, {
            isStroke: false,
        });
        // Add ActionManager for highlighting
        this.extruded_polygon.actionManager = new ActionManager(this.scene);

        // On mouse over
        this.extruded_polygon.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPointerOverTrigger, () => {
            if(enable_move) {
            this.scene.hoverCursor = "pointer";
            hl.addMesh(this.extruded_polygon, Color3.Red());}
        }));

        // On mouse out
        this.extruded_polygon.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, () => {
            if (enable_move) {
            hl.removeMesh(this.extruded_polygon);}
        }));
    }

    enable_move() {
        this.poly_drag_behavior.attach(this.extruded_polygon)
    }

    disable_move() {
        console.log("called")
        console.log("detaching")
        this.poly_drag_behavior.detach()
    }
    
    disable_edit() {
        this.vertices.forEach((sphere, index) => {
        if (this.vertex_dragBehaviors[index]) {
            this.vertex_dragBehaviors[index].detach();
        }
    });
    }

    enable_edit() {
        this.vertex_dragBehaviors = []
        this.vertices.forEach((vertex, index) => {
            var dragBehaviorPt = new PointerDragBehavior({
                dragPlaneNormal: new Vector3(0, 1, 0) 
            });

            dragBehaviorPt.onDragObservable.add((event) => {
                console.log("here")
                this.points[index].x = vertex.position.x;
                this.points[index].y = vertex.position.y;
                this.points[index].z = vertex.position.z;
                console.log(this.extruded_polygon)
                this.extruded_polygon.dispose();
                this.extrude(2)
            });
            this.vertices[index].addBehavior(dragBehaviorPt);
            this.vertex_dragBehaviors.push(dragBehaviorPt)
        })
    }

    adjust_vertices() {
        this.vertices.forEach((sphere) => {
            sphere.dispose()
        })
        this.vertices = []
        this.points.forEach((vertex, index) => {
            var handle = CreateSphere("handle "+index, { diameter: 0.15 }, this.scene);
            handle.position = vertex.clone();
            this.vertices.push(handle);

            var hl = new HighlightLayer("hl1", this.scene, {
                isStroke: false,
            });

             // Add ActionManager for highlighting
        handle.actionManager = new ActionManager(this.scene);

        // On mouse over
        handle.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPointerOverTrigger, () => {
            if(enable_edit) {
            this.scene.hoverCursor = "pointer";
            hl.addMesh(handle, Color3.Red());}
        }));

        // On mouse out
        handle.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, () => {
            if (enable_edit) {
            hl.removeMesh(handle);}
        }));
        });
        if (enable_edit) {
            this.enable_edit()
        }
        

    }
}