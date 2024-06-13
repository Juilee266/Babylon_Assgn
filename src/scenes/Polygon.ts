import { Vector3 } from "@babylonjs/core/Maths/math"
import { Mesh } from "@babylonjs/core/Meshes/mesh"
import { PointerDragBehavior } from "@babylonjs/core/Behaviors/Meshes/pointerDragBehavior";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { ExtrudePolygon } from "@babylonjs/core/Meshes/Builders/polygonBuilder";
import * as earcut from "earcut";
import { MAX_X, MAX_Z, MIN_X, MIN_Z } from "./constants"
import { CreateSphere } from "@babylonjs/core/Meshes/Builders/sphereBuilder";
import { CreateLines } from "@babylonjs/core/Meshes/Builders/linesBuilder";
import { Scene } from "@babylonjs/core/scene";

export class Polygon {
    vertices: Mesh[]
    points: Vector3[]
    extruded_polygon: Mesh
    scene: Scene

    constructor(scene, points) {
        this.scene = scene
        this.extruded_polygon = null
        this.vertices = []
        this.points = points
    }

    extrude(height) {
        console.log("Number = ", this.points)
        var polygonMaterial = new StandardMaterial("polygonMaterial", this.scene);
        polygonMaterial.diffuseColor = new Color3(1, 0, 0); // Red color

        this.extruded_polygon = ExtrudePolygon("poly", { shape: this.points, depth: height, sideOrientation: Mesh.DOUBLESIDE }, this.scene, earcut)
        this.extruded_polygon.material = polygonMaterial
        this.extruded_polygon.position = new Vector3(0, 2, 0)
        var boundingInfo = this.extruded_polygon.getBoundingInfo();

        var halfWidth = boundingInfo.boundingBox.extendSize.x;
        var halfDepth = boundingInfo.boundingBox.extendSize.z;
        var dragBehavior = new PointerDragBehavior({
            dragPlaneNormal: new Vector3(0, 1, 0)
        });

        var initialMeshPosition = this.extruded_polygon.position.clone();

        dragBehavior.onDragStartObservable.add(() => {
            initialMeshPosition.copyFrom(this.extruded_polygon.position);
        })

        dragBehavior.onDragObservable.add((event) => {
            var planePt = this.extruded_polygon.position
            var deltaX = planePt.x - initialMeshPosition.x;
            var deltaY = planePt.y - initialMeshPosition.y;
            var deltaZ = planePt.z - initialMeshPosition.z;
            
            this.points.forEach((pt) => {
                pt.x += deltaX
                pt.y += deltaY
                pt.z += deltaZ
            });
            
            if (planePt.x + halfWidth > MAX_X) {
                planePt.x = MAX_X
                console.log("beyond maxX")
            }
            else if (planePt.x - halfWidth < MIN_X) {
                planePt.x = MIN_X
                console.log("beyond minX")
            }
            if (planePt.z + halfDepth > MAX_Z) {
                planePt.z = MAX_Z
                console.log("beyond maxZ")
            }
            else if (planePt.z - halfDepth < MIN_Z) {
                planePt.z = MIN_Z
                console.log("beyond minZ")
            }
            this.extruded_polygon.position = planePt
            initialMeshPosition.copyFrom(this.extruded_polygon.position);
            this.adjust_vertices()

        })
        this.extruded_polygon.addBehavior(dragBehavior);
    }

    adjust_vertices() {
        this.vertices.forEach((sphere) => {
            sphere.dispose()
        })
        this.vertices = []
        this.points.forEach((vertex, index) => {
            var handle = CreateSphere("handle "+index, { diameter: 0.1 }, this.scene);
            handle.position = vertex.clone();
            this.vertices.push(handle);
        
            var dragBehaviorPt = new PointerDragBehavior({
                dragPlaneNormal: new Vector3(0, 1, 0) 
            });

            dragBehaviorPt.onDragObservable.add((event) => {
                console.log("here")
                this.points[index].x = handle.position.x;
                this.points[index].y = handle.position.y;
                this.points[index].z = handle.position.z;
                console.log(this.extruded_polygon)
                this.extruded_polygon.dispose();
                this.extrude(2)
            });

            handle.addBehavior(dragBehaviorPt);
        
            
        });

    }
}