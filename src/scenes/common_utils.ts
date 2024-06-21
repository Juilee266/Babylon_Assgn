import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3, Vector3 } from "@babylonjs/core/Maths/math";
import { CreateGround } from "@babylonjs/core/Meshes/Builders/groundBuilder";
import { Button, Control, TextBlock } from "@babylonjs/gui";
import { GROUND_HEIGHT, GROUND_WIDTH } from "./constants";
import { enable_draw, enable_edit, enable_move } from "./scene_setup";

export function create_button(name, text, alignment, handler) {
    console.log("Creating button " + name)
    var button = Button.CreateSimpleButton(name, text);
    button.color = "white";
    button.background = "green";
    button.width = 0.2;
    button.height = "40px";
    button.cornerRadius = 20;
    button.horizontalAlignment = alignment

    button.onPointerUpObservable.add(handler);
    return button
}

export function create_ground(scene) {
    const ground = CreateGround(
        "ground",
        { width: GROUND_WIDTH, height: GROUND_HEIGHT, subdivisions: 2},
        scene
    );
    const groundMaterial = new StandardMaterial("ground material", scene);
    groundMaterial.diffuseColor = new Color3(0.9, 0.9, 0.9);
    groundMaterial.alpha = 0.5;
    ground.material = groundMaterial;
    ground.receiveShadows = true;

    return ground
}

export function create_light(scene, position) {
    const light = new DirectionalLight(
        "light",
        position,
        scene
    );
    light.intensity = 0.3;
    light.position.y = 10;
    return light
}

export function setText(advancedTexture, is_right_clicked) {
    const mode_text = (advancedTexture.getControlByName("curr_text")) as TextBlock
    const subtext = (advancedTexture.getControlByName("subtext")) as TextBlock

    if ( is_right_clicked ) {
        mode_text.text = "Current mode: Ready to extrude";
        subtext.text = "Click 'Extrude' to create a 3D object.";
        return;
    }

    const draw_button = advancedTexture.getControlByName("draw") as Button
    const move_button = advancedTexture.getControlByName("move") as Button
    const edit_button = advancedTexture.getControlByName("edit") as Button
    const extrude = advancedTexture.getControlByName("extrude") as Button

    if (enable_draw) {
        mode_text.text = "Current mode: Draw"
        subtext.text = "Left click to select vertices and right click to complete the polygon."
    }
    else if (enable_edit && enable_move) {
        mode_text.text = "Current mode: Move/Edit"
        subtext.text = "Drag to move the extruded shape or drag the vertices to change shape of the polygon."
    }
    else if (enable_edit) {
        mode_text.text = "Current mode: Edit"
        subtext.text = "Drag the vertices to change shape of the polygon."
    }
    else if (enable_move) {
        mode_text.text = "Current mode: Move"
        subtext.text = "Drag to move the extruded shape."
    }
    else if (draw_button.isEnabled && move_button.isEnabled && edit_button.isEnabled) {
        mode_text.text = "Current mode: Extruded";
        subtext.text = "Move / edit the extruded object or draw a new shape.";
    }
    else {
        mode_text.text = "Current mode: _";
        subtext.text = "Please click on \"Enable Draw\" to start drawing.";
    }

}

export function create_gui(advancedTexture, draw_handler, move_handler, edit_handler, extrude_handler) {

    var current_text = new TextBlock("curr_text")
    current_text.text = "Current mode: _"
    current_text.color = "red"
    current_text.fontSize = 24;
    current_text.top = "-40%"
    advancedTexture.addControl(current_text)

    var subtext = new TextBlock("subtext")
    subtext.text = "Please click on \"Enable Draw\" to start drawing."
    subtext.color = "white"
    subtext.fontSize = 16
    subtext.top = "-35%"
    advancedTexture.addControl(subtext)

    var draw_button = create_button("draw", "Enable Draw", Control.HORIZONTAL_ALIGNMENT_LEFT, () => {
        draw_handler()
        move_button.isEnabled = false
        edit_button.isEnabled = false
        setText(advancedTexture, false)
    })
    draw_button.top = "-10%"
    advancedTexture.addControl(draw_button)

    var move_button = create_button("move", "Enable Move", Control.HORIZONTAL_ALIGNMENT_RIGHT, () => {
        move_handler()
        if (enable_move) {
            move_button.background = "red"
            move_button.textBlock.text = "Disable Move"
        }
        else {
            move_button.background = "green"
            move_button.textBlock.text = "Enable Move"
        }
        setText(advancedTexture, false)
    })
    move_button.top = "-10%"
    advancedTexture.addControl(move_button)

    var edit_button = create_button("edit", "Enable Edit", Control.HORIZONTAL_ALIGNMENT_RIGHT, () => {
        edit_handler()
        if (enable_edit) {
            edit_button.background = "red"
            edit_button.textBlock.text = "Disable Edit"
        }
        else {
            edit_button.background = "green"
            edit_button.textBlock.text = "Enable Edit"
        }
        setText(advancedTexture, false)
    })
    advancedTexture.addControl(edit_button)

    var extrude_button = create_button("extrude", "Extrude", Control.HORIZONTAL_ALIGNMENT_LEFT, () => {
        extrude_handler()
        edit_button.isEnabled = true
        move_button.isEnabled = true
        setText(advancedTexture, false)
    })
    advancedTexture.addControl(extrude_button)

    draw_button.isEnabled = true
    edit_button.isEnabled = false
    move_button.isEnabled = false
    extrude_button.isEnabled = false

    return advancedTexture

}