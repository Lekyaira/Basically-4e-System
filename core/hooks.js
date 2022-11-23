import { b4eActor } from "../modules/b4e-actor.js";
import { b4eActorSheet } from "../sheets/b4e-actor-sheet.js";
import { b4eItem } from "../modules/b4e-item.js";
import { b4eItemSheet } from "../sheets/b4e-item-sheet.js"

// Initialize system
Hooks.once("init", async function () {
    console.log("Initializing Basically 4e System");

    CONFIG.Actor.documentClass = b4eActor;
    CONFIG.Item.documentClass = b4eItem;

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("b4e", b4eActorSheet, { makeDefault: true });
    Items.unregisterSheet("core", ActorSheet);
    Items.registerSheet("b4e", b4eItemSheet, { makeDefault: true });

    console.log("Basically 4e Initialization Complete");
});