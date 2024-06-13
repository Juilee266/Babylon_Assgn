import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Vector3 } from "@babylonjs/core/Maths/math";
import { CreateGround } from "@babylonjs/core/Meshes/Builders/groundBuilder";
import { Button, Control, TextBlock } from "@babylonjs/gui";
import { GROUND_HEIGHT, GROUND_WIDTH } from "./constants";
import { enable_edit, enable_move } from "./defaultWithTexture";

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

export function create_gui(advancedTexture, draw_handler, move_handler, edit_handler, extrude_handler) {
    
    var current_text = new TextBlock()
    current_text.text = "Current mode: None"
    current_text.color = "white";
    current_text.fontSize = 24;
    current_text.top = "-40%"
    advancedTexture.addControl(current_text)

    var subtext = new TextBlock()
    subtext.text = "Please click on \"Enable Draw\" to start drawing."
    subtext.color = "white"
    subtext.fontSize = 16
    subtext.top = "-35%"
    advancedTexture.addControl(subtext)

    var draw_button = create_button("draw", "Enable Draw", Control.HORIZONTAL_ALIGNMENT_LEFT, () => {
        current_text.text = "Current mode: Drawing"
        subtext.text = "Left click to select vertices and right click to complete the polygon."
        draw_handler()
    })
    draw_button.top = "-10%"
    draw_button.isEnabled = true
    advancedTexture.addControl(draw_button)

    var move_button = create_button("move", "Enable Move", Control.HORIZONTAL_ALIGNMENT_LEFT, () => {
        current_text.text = "Current mode: Moving"
        subtext.text = "Drag to move the extruded shape."
        move_handler()
        if (enable_move) {
            move_button.background = "red"
            move_button.textBlock.text = "Disable Move"
        }
        else {
            move_button.background = "green"
            move_button.textBlock.text = "Enable Move" 
        }
    })
    move_button.isEnabled = false
    advancedTexture.addControl(move_button)

    var edit_button = create_button("edit", "Enable Edit", Control.HORIZONTAL_ALIGNMENT_RIGHT, () => {
        current_text.text = "Current mode: Editing"
        subtext.text = "Drag the vertices to change shape of the polygon."
        edit_handler()
        if (enable_edit) {
            edit_button.background = "red"
            edit_button.textBlock.text = "Disable Edit"
        }
        else {
            edit_button.background = "green"
            edit_button.textBlock.text = "Enable Edit" 
        }
    })
    edit_button.isEnabled = false
    edit_button.top = "-10%"
    advancedTexture.addControl(edit_button)

    var extrude_button = create_button("extrude", "Extrude", Control.HORIZONTAL_ALIGNMENT_RIGHT, () => {
        move_button.isEnabled = true
        edit_button.isEnabled = true
        draw_button.isEnabled = false
        extrude_handler()
        extrude_button.isEnabled = false
    })
    extrude_button.isEnabled = false
    advancedTexture.addControl(extrude_button)

    return advancedTexture

}