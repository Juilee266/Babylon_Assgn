import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Vector3 } from "@babylonjs/core/Maths/math";
import { CreateGround } from "@babylonjs/core/Meshes/Builders/groundBuilder";
import { Button } from "@babylonjs/gui";
import { GROUND_HEIGHT, GROUND_WIDTH } from "./constants";

export function create_button(name, text, alignment, handler) {
    console.log("Creating button "+name)
    var button = Button.CreateSimpleButton(name, text);
    button.color = "white";
    button.background = "green";
    button.width = 0.2;
    button.height = "40px";
    button.cornerRadius = 20;
    button.horizontalAlignment = alignment

    button.onPointerDownObservable.add(handler);
    return button
}

export function create_ground(scene) {
    const ground = CreateGround(
        "ground",
        { width: GROUND_WIDTH, height: GROUND_HEIGHT },
        scene
    );
    const groundMaterial = new StandardMaterial("ground material", scene);
    ground.material = groundMaterial;
    ground.receiveShadows = true;

    return ground
}

export function create_light(scene) {
    const light = new DirectionalLight(
        "light",
        new Vector3(0, -1, 1),
        scene
    );
    light.intensity = 0.5;
    light.position.y = 10;
    return light
}

export function pointerclick_handler(event, pickInfo) {

}