import { VertexData } from "@babylonjs/core/Meshes/mesh.vertexData";
import { Vector3 } from "@babylonjs/core/Maths/math"
import { Mesh } from "@babylonjs/core/Meshes/mesh"
import { ActionManager, ExecuteCodeAction } from "@babylonjs/core/Actions";
import { PointerDragBehavior } from "@babylonjs/core/Behaviors/Meshes/pointerDragBehavior";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Scene } from "@babylonjs/core/scene";
import { HighlightLayer } from "@babylonjs/core/Layers/highlightLayer";
import { enable_edit, enable_move } from "./scene_setup";
import { MAX_X, MAX_Z, MIN_X, MIN_Z } from "./constants";
import { CreateSphere } from "@babylonjs/core/Meshes/Builders/sphereBuilder";
import { Material } from "@babylonjs/core/Materials/material";
import * as earcut from 'earcut';

// This class represents an object created from the shape drawn.
export class ExtrudedObject {
    name: string
    base_surface_vertices: Vector3[];   // Vector points on object base
    upper_surface_vertices: Vector3[];  // Vector points on object upper surface
    base_surface: Mesh;  // Object base plane
    upper_surface: Mesh; // Object upper surface plane
    surface: Mesh;  // Extruded mesh without top and bottom faces
    scene: Scene;
    positions: any[];   // Collection of points to create Mesh object
    obj_drag_behavior: PointerDragBehavior // Drag behavior of object
    base_spheres: Mesh[]    // Spherical vertices on object base
    upper_spheres: Mesh[]   // Spherical vertices on object upper surface
    base_dragBehaviors: PointerDragBehavior[]   // Drag behavior of base surface vertices
    upper_dragBehaviors: PointerDragBehavior[]  // Drag behavior of upper surface vertices
    material: StandardMaterial

    constructor(name, scene, points) {
        this.name = name;
        this.base_surface_vertices = points;
        this.upper_surface_vertices = [];
        this.scene = scene;
        this.positions = [];
        this.base_spheres = []
        this.upper_spheres = []

        this.material = new StandardMaterial(this.name + "_material", this.scene);
        this.material.diffuseColor = new Color3(0, 1, 0);
        this.material.backFaceCulling = false;
    }

    create_sides(height) {
        // Creates extruded surface for base polygon with height 'height'
        this.base_surface_vertices.forEach((v) => {
            this.upper_surface_vertices.push(new Vector3(v.x, v.y + height, v.z));
        });
        this.load_surface();
    }

    load_positions() {
        // Loads combined points from base and upper surface to create a 3d object
        this.positions = []
        this.base_surface_vertices.forEach((v) => {
            this.positions.push(v.x, v.y, v.z);
        })
        this.upper_surface_vertices.forEach((v) => this.positions.push(v.x, v.y, v.z));
    }

    load_surface() {
        // Creates the surface object
        this.load_positions()
        var numVertices = this.base_surface_vertices.length;
        var indices = this.get_indices(numVertices);

        this.surface = new Mesh(this.name + "_surface", this.scene);
        var vertexData = new VertexData();
        vertexData.positions = this.positions;
        vertexData.indices = indices;
        vertexData.applyToMesh(this.surface);
        this.surface.material = this.material;

        // Highlighting the object when in move mode
        var hl = new HighlightLayer(this.name + "_hl1", this.scene, {
            isStroke: false,
        });

        this.surface.actionManager = new ActionManager(this.scene);

        // On mouse over
        this.surface.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPointerOverTrigger, () => {
            if (enable_move) {
                this.scene.hoverCursor = "pointer";
                hl.addMesh(this.surface, Color3.Red());
                hl.addMesh(this.base_surface, Color3.Red());
                hl.addMesh(this.upper_surface, Color3.Red());
            }
        }));

        // On mouse out
        this.surface.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, () => {
            if (enable_move) {
                hl.removeMesh(this.surface);
                hl.removeMesh(this.base_surface);
                hl.removeMesh(this.upper_surface);
            }
        }));

        // 3D surface drag behavior definition
        this.obj_drag_behavior = new PointerDragBehavior({
            dragPlaneNormal: new Vector3(0, 1, 0)
        });

        var initialMeshPosition = this.surface.position.clone();

        this.obj_drag_behavior.onDragStartObservable.add(() => {
            initialMeshPosition.copyFrom(this.surface.position);
        })

        var initialMeshPosition = this.surface.position.clone();

        this.obj_drag_behavior.onDragStartObservable.add(() => {
            initialMeshPosition.copyFrom(this.surface.position);
        })

        this.obj_drag_behavior.onDragObservable.add(throttle((event) => {

            const planePt = this.surface.position.clone();

            if (planePt.x > MAX_X) {
                planePt.x = MAX_X;
            } else if (planePt.x < MIN_X) {
                planePt.x = MIN_X;
            }
            if (planePt.z > MAX_Z) {
                planePt.z = MAX_Z;
            } else if (planePt.z < MIN_Z) {
                planePt.z = MIN_Z;
            }

            const deltaX = planePt.x - initialMeshPosition.x;
            const deltaY = planePt.y - initialMeshPosition.y;
            const deltaZ = planePt.z - initialMeshPosition.z;

            this.base_surface_vertices.forEach((pt) => {
                pt.x += deltaX
                pt.y += deltaY
                pt.z += deltaZ
            });
            this.upper_surface_vertices.forEach((pt) => {
                pt.x += deltaX
                pt.y += deltaY
                pt.z += deltaZ
            });

            this.surface.position = planePt
            initialMeshPosition.copyFrom(planePt);
            this.adjust_vertices()
        }, 50))

        this.surface.addBehavior(this.obj_drag_behavior);
        if (enable_move == false) {
            this.obj_drag_behavior.detach()
        }
    }

    update_spheres() {
        // updates positions of spheres based on vertices.
        this.base_spheres.forEach((v, i) => {
            v.position.copyFrom(this.base_surface_vertices[i])
        })
        this.upper_spheres.forEach((v, i) => {
            v.position.copyFrom(this.upper_surface_vertices[i])
        })
    }
    

    extrude(height) {
        // Created a 3d shape from base vertices with height as input.
        this.create_sides(height);
        this.base_surface = this.create_plane_surface(this.name + "_base_surface", this.base_surface_vertices);
        this.upper_surface = this.create_plane_surface(this.name + "_upper_surface", this.upper_surface_vertices);

        this.scene.registerBeforeRender(() => {
            const newPosition = this.surface.position.clone();

            newPosition.x = Math.max(MIN_X, Math.min(newPosition.x, MAX_X));
            newPosition.z = Math.max(MIN_Z, Math.min(newPosition.z, MAX_Z));

            this.surface.position.copyFrom(newPosition);

            this.updateSurfacePositions()
        });

        this.adjust_vertices();
    }

    updateSurfacePositions() {
        // Moves base and upper surface along with the 3d object
        this.base_surface.position.copyFrom(this.surface.position);
        this.upper_surface.position.copyFrom(this.surface.position);
    }


    get_indices(numVertices) {
        // Returns indices for triangulation algorithm to create filled surfaces
        const indices = [];
        for (var i = 0; i < numVertices; i++) {
            var next = (i + 1) % numVertices;
            // First triangle
            indices.push(i, next, numVertices + i);
            // Second triangle
            indices.push(next, numVertices + next, numVertices + i);
        }
        return indices;
    }

    create_plane_surface(name, points) {
        // Creates a plane surface based on points in the same plane
        const numVertices = points.length;
        let flattenedArray: number[] = [];

        points.forEach(vector => {
            flattenedArray.push(vector.x, vector.z);
        });
        const indices = earcut(flattenedArray)

        const customMesh = new Mesh(name, this.scene);
        var vertexData = new VertexData();
        let positions = [];
        vertexData.indices = new Uint32Array(indices);
        points.forEach((v) => {
            positions.push(v.x, v.y, v.z);
        });
        vertexData.positions = new Float32Array(positions);
        vertexData.applyToMesh(customMesh);
        customMesh.material = this.material;
        return customMesh;
    }

    enable_move() {
        // Enable drag movement of object
        this.obj_drag_behavior.attach(this.surface);
    }

    disable_move() {
        // Disable drag movement of object
        this.obj_drag_behavior.detach()
    }

    disable_edit() {
        // Disable repositioning of individual vertices of object base
        this.base_spheres.forEach((sphere, index) => {
            if (this.base_dragBehaviors[index]) {
                this.base_dragBehaviors[index].detach();
            }
        });
        this.upper_spheres.forEach((sphere, index) => {
            if (this.upper_dragBehaviors[index]) {
                this.upper_dragBehaviors[index].detach();
            }
        });
    }

    enable_edit() {
        // Enable repositioning of individual vertices of object base by dragging
        this.base_dragBehaviors = []
        this.upper_dragBehaviors = []

        this.base_spheres.forEach((vertex, index) => {
            // Drag movement of spheres definition
            var dragBehaviorPt = new PointerDragBehavior({
                dragPlaneNormal: new Vector3(1, 1, 1)
            });

            dragBehaviorPt.onDragObservable.add((event) => {
                this.base_surface_vertices[index].x = vertex.position.x;
                this.base_surface_vertices[index].y = vertex.position.y;
                this.base_surface_vertices[index].z = vertex.position.z;
                this.surface.dispose();
                this.base_surface.dispose();
                this.base_surface = this.create_plane_surface(this.name + "_base_surface", this.base_surface_vertices);
                this.upper_surface.dispose();
                this.upper_surface = this.create_plane_surface(this.name + "_upper_surface", this.upper_surface_vertices);
                this.load_surface();
            });

            vertex.addBehavior(dragBehaviorPt);
            this.base_dragBehaviors.push(dragBehaviorPt);
        })

        this.upper_spheres.forEach((vertex, index) => {
            // Drag movement of spheres definition
            var dragBehaviorPt = new PointerDragBehavior({
                dragPlaneNormal: new Vector3(1, 1, 1)
            });
            dragBehaviorPt.onDragObservable.add((event) => {
                this.upper_surface_vertices[index].x = vertex.position.x;
                this.upper_surface_vertices[index].y = vertex.position.y;
                this.upper_surface_vertices[index].z = vertex.position.z;
                this.surface.dispose();
                this.upper_surface.dispose();
                this.upper_surface = this.create_plane_surface(this.name + "_upper_surface", this.upper_surface_vertices);
                this.base_surface.dispose();
                this.base_surface = this.create_plane_surface(this.name + "_base_surface", this.base_surface_vertices);
                this.load_surface();
            });
            vertex.addBehavior(dragBehaviorPt);
            this.upper_dragBehaviors.push(dragBehaviorPt);
        })
    }

    adjust_vertices() {
        // Update spheres based on vertices
        this.base_spheres.forEach((sphere) => {
            sphere.dispose()
        });

        this.upper_spheres.forEach((sphere) => {
            sphere.dispose()
        });

        this.base_spheres = []
        this.upper_spheres = []


        const hl = new HighlightLayer(this.name + "_hl_sphere", this.scene, {
            isStroke: false,
        });

        this.base_surface_vertices.forEach((pt, i) => {
            let handle = CreateSphere(this.name + "_handle_base" + i, { diameter: 0.15 }, this.scene);
            handle.position = pt.clone();

            handle.actionManager = new ActionManager(this.scene);

            // On mouse over
            handle.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPointerOverTrigger, () => {
                this.scene.hoverCursor = "pointer";
                if (enable_edit) {
                    hl.addMesh(handle, Color3.Red());
                }
            }));

            // On mouse out
            handle.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, () => {
                this.scene.hoverCursor = "";
                if (enable_edit) {
                    hl.removeMesh(handle);
                }
            }));

            this.base_spheres.push(handle);
        });

        this.upper_surface_vertices.forEach((pt, i) => {
            let handle = CreateSphere(this.name + "_handle_upper_" + i, { diameter: 0.15 }, this.scene);
            handle.position = pt.clone();

            // Highlighting the object when in move mode
            var hl = new HighlightLayer("hl1", this.scene, {
                isStroke: false,
            });

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
            this.upper_spheres.push(handle);
        })
        if (enable_edit) {
            this.enable_edit()
        }

    }
}


function throttle(func, limit) {
    let lastFunc;
    let lastRan;
    return function(...args) {
        if (!lastRan) {
            func.apply(this, args);
            lastRan = Date.now();
        } else {
            clearTimeout(lastFunc);
            lastFunc = setTimeout(() => {
                if ((Date.now() - lastRan) >= limit) {
                    func.apply(this, args);
                    lastRan = Date.now();
                }
            }, limit - (Date.now() - lastRan));
        }
    };
}
