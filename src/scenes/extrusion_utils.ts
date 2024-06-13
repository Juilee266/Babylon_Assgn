import { PointerDragBehavior } from "@babylonjs/core/Behaviors/Meshes/pointerDragBehavior";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Vector3 } from "@babylonjs/core/Maths/math";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { ExtrudePolygon } from "@babylonjs/core/Meshes/Builders/polygonBuilder";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import * as earcut from "earcut";
import { MAX_X, MAX_Z, MIN_X, MIN_Z } from "./constants"
import { CreateSphere } from "@babylonjs/core/Meshes/Builders/sphereBuilder";
import { CreateLines } from "@babylonjs/core/Meshes/Builders/linesBuilder";

export function extrude_polygon(vertices, height, scene) {
    var polygonMaterial = new StandardMaterial("polygonMaterial", scene);
    polygonMaterial.diffuseColor = new Color3(1, 0, 0); // Red color
    
    const poly = ExtrudePolygon("poly", {shape: vertices, depth: height, sideOrientation: Mesh.DOUBLESIDE}, scene, earcut)
    poly.material = polygonMaterial
    poly.position = new Vector3(0, 2, 0)
    var boundingInfo = poly.getBoundingInfo();

    var halfWidth = boundingInfo.boundingBox.extendSize.x;
    var halfDepth = boundingInfo.boundingBox.extendSize.z;
    var dragBehavior = new PointerDragBehavior({
        dragPlaneNormal: new Vector3(0,1,0) 
    });
    dragBehavior.onDragObservable.add((event) => {
        var planePt = poly.position
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
        poly.position = planePt

    }) 
    poly.addBehavior(dragBehavior);
    
    
    return poly

}

export function create_spheres_with_behavior(points, spheres, scene, poly) {
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
}