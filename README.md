# Snaptrude Assignment - Juilee Joshi

This application was developed as part of the interview process of Snaptrude for the role of Algorithms Engineer.

## How to run

You can see a live demo of the application here - 
https://snaptrudealgorithmassignment-juiees-projects.vercel.app

To run the application locally, run the command "npm run start" in the root directory from terminal and open http://localhost:8080.

## Steps

1. Start the application either locally or with the deployment link.
2. Click on "Enable Draw" to start drawing a 2D shape on the plane.
3. Select vertices on the plane using left mouse click and use right click to complete the polygon.
4. Once the polygon is completed, you can click on "Extrude" to create a 3D object from the drawn shape.
5. To move the object click "Enable Move" and drag the object anywhere on the plane. Make sure you don't drag it too quickly. To disable moving, click on "Disable Move".
6. To change the shape of the extruded object, click "Enable Edit" and drag the spherical vertices on the object anywhere to change their positions and ultimately the shape. To disable editing, click on "Disable Edit". 
7. You can add more shapes and extrude them using "Enable Draw". When you enable move or edit mode, any of the objects can be moved and edited depending on where your cursor is.

## Scope for improvement

1. The application can be made responsive to make it work on smartphones.
2. The slight offsets between the vertices and the extruded object should be fixed. When the object is moved too fast, the offset increases in the current version.
