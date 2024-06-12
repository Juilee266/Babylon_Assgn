import { Button } from "@babylonjs/gui";

export function createButton(name, text, alignment, handler) {
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