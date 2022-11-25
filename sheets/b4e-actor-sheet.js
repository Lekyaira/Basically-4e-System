import { templatepath } from "../core/utilities.js";
import { b4eItem } from "../modules/b4e-item.js";

//////////////
// HOOKS    //
//////////////

// Set the character sheet's position and state when rendered
Hooks.on("renderb4eActorSheet", async (sheet) => {
    sheet.setPositionAndState();
});

// Set the character sheet's position and state when closed
Hooks.on("closeb4eActorSheet", async (sheet) => {
    sheet.savePositionAndState();
})

//////////////
// SHEET    //
//////////////

// Actor sheet class
export class b4eActorSheet extends ActorSheet {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["b4e", "sheet", "actor"],
            left: 100,
            top: 100,
            width: 900,
            height: 1100,
            resizable: false,
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "main" }]
        });
    }

    // Determined if we are editing the sheet or not
    editMode = false;

    get template() {
        this._minimized = this.actor.system.sheet.minimized;
        return `${templatepath}/character-sheet.html`;
    }

    async minimize() {
        this.setCompact(true);
    }

    async maximize() {
        this.setCompact(false);
    }

    // Determine whether the sheet is in edit mode or not, and alter CSS accordingly.
    setEditMode() {
        // Get CSS variables
        let rs = getComputedStyle(document.querySelector(':root'));
        let fontColor = rs.getPropertyValue("--font-color");
        let disableColor = rs.getPropertyValue("--disable-color");
        let highlightColor = rs.getPropertyValue("--highlight-color");

        if(this.editMode){
            $('.sheet-full .edit-control').css("display", "inline");
            $('.sheet-full .edit-field').css("border-bottom", "1px solid");
            $('.sheet-full .edit-sheet i').css("color", fontColor);
            $('.sheet-full .species-controls').css("display", "flex");
            $('.sheet-full input[type=text], input[type=number]').attr("disabled", false);
            $('.sheet-full .ability-scores .score-value').css("display", "inline");
        }
        else {
            $('.sheet-full .edit-control').css("display", "none");
            $('.sheet-full .edit-field').css("border-bottom", "none");
            $('.sheet-full .edit-sheet i').css("color", disableColor);
            $('.sheet-full .species-controls').css("display", "none");
            $('.sheet-full input[type=text], input[type=number]').attr("disabled", true);
            $('.sheet-full .vitals-value').attr("disabled", false);
            $('.sheet-full .ability-scores .score-value').css("display", "none");
        }
    }

    // Set the sheet to its stored position and compact state.
    setPositionAndState() {
        // Get the sheet's stored position data
        const pos = this.actor.system.sheet.position;

        // Check if the data is in initial state. If it is, set defaults.
        if(pos.left === null || pos.top === null || pos.width === null || pos.height === null){
            this.savePositionAndState();
            return;
        }

        // Set the sheet's position using stored position data.
        this.setPosition({
            left: pos.left,
            top: pos.top,
            width: pos.width,
            height: pos.height
        });

        // Set the sheet's compact state.
        this._minimized = this.actor.system.sheet.minimized;
    }

    // Save the sheet's position and compact state.
    savePositionAndState() {
        this.actor.system.sheet.position.left = this.position.left;
        this.actor.system.sheet.position.top = this.position.top;
        this.actor.system.sheet.position.width = this.position.width;
        this.actor.system.sheet.position.height = this.position.height;
        this.actor.system.sheet.minimized = this._minimized;
    }

    setCompact(compact){
        let sheet = this.actor.system.sheet;
        this.savePositionAndState();
        if(compact){
            sheet.minimized = true;
            sheet.position.width = 300;
            sheet.position.height = 500;
            // this._minimized = true;
            // this.setPosition({width: 300, height: 500});
        }
        else {
            sheet.minimized = false;
            sheet.position.width = 900;
            sheet.position.height = 1100;
            // this._minimized = false;
            // this.setPosition({width: 900, height: 1100});
        }
        this.setPositionAndState();
        this.render(true);
    }

    activateListeners(html) {
        super.activateListeners(html);

        // Check if we're in edit mode and set css appropriately
        this.setEditMode();

        // Roll ability check when ability is clicked
        $('.ability-scores .score-label').click(async ev => {
            let bonus = 0;
            let stat = $(ev.currentTarget).text();
            if(stat === "Strength"){
                bonus = this.actor.derived.str;
            }
            else if(stat === "Dexterity"){
                bonus = this.actor.derived.dex;
            }
            else if(stat === "Charisma"){
                bonus = this.actor.derived.cha;
            }
            else if(stat === "Intelligence"){
                bonus = this.actor.derived.int;
            }
            else if(stat === "Luck"){
                bonus = this.actor.derived.luk;
            }
            let roll = new Roll(`1d20 ${bonus >= 0 ? '+' : ''}${bonus}`);
            //await r.evaluate();
            await roll.toMessage({
                speaker: ChatMessage.getSpeaker({actor: this.actor}),
                flavor: `${stat} check: `
            });
        });

        // Roll skill check when skill is clicked
        $('.skill .skill-name').click(async ev => {
            let idString = $(ev.currentTarget).parents(".skill").attr("id");
            let id = idString.split(":")[1];
            let item = this.actor.items.get(id);
            let skill = item.name;
            let bonus = (item.system.base > 0 ? 2 : 0) + item.system.base + item.system.modifier + item.derived.species;
            
            // Roll the 1d20 + skill bonus and send to chat
            let roll = new Roll(`1d20 ${bonus >= 0 ? '+' : ''}${bonus}`);
            await roll.toMessage({
                speaker: ChatMessage.getSpeaker({actor: this.actor}),
                flavor: `${skill} check: `
            })
        });

        // Everything below is only needed if the sheet is editable
        if (!this.isEditable) return;

        // Toggle edit skills
        $('.edit-sheet').click(async ev => {
            this.editMode = !this.editMode;
            this.setEditMode();
        });

        // Delete a skill item
        $('.skill .skill-delete').click(async ev => {
            let idString = $(ev.currentTarget).parents(".skill").attr("id");
            let id = idString.split(":")[1];
            let item = this.actor.items.get(id);
            item.delete();
            this.render(false);
        });

        // Edit a skill item
        $('.skill .skill-edit').click(async ev => {
            let idString = $(ev.currentTarget).parents(".skill").attr("id");
            let id = idString.split(":")[1];
            let item = this.actor.items.get(id);
            item.sheet.render(true);
        });

        // Add a new skill
        $('.skills .skill-add').click(async ev => {
            const data = [{ name: "New Skill", type: "skill" }];
            Item.create(data, { parent: this.actor });
        });

        // Delete a species
        $('.sheet-full .delete-species').click(async ev => {
            let idString = $(ev.currentTarget).parents(".species-name").attr("id");
            let id = idString.split(":")[1];
            let item = this.actor.items.get(id);
            item.delete();
            this.render(false);
        })

        // Edit a species
        $('.sheet-full .edit-species').click(async ev => {
            let idString = $(ev.currentTarget).parents(".species-name").attr("id");
            let id = idString.split(":")[1];
            let item = this.actor.items.get(id);
            item.sheet.render(true);
        })
    }

    async getData() {
        // Retrieve the data structure from the base sheet.
        const context = super.getData();
        // Create a safe clone of item data
        const itemData = this.actor.items;

        // Prepare character data and items.
        if (this.actor.type == "character") {
            context.itemData = await this._prepareCharacterItemData(itemData);
        }

        return context;
    }

    async _prepareCharacterItemData(itemData) {
        const species = [];
        const skills = [];

        // Iterate through items, putting them into container by type
        for (let i of itemData) {
            i.img = i.img || DEFAULT_TOKEN;

            // Append to species
            if(i.type === "species"){
                species.push({
                    id: i.id,
                    img: i.img,
                    name: i.name
                });
            }
            // Append to skills
            if(i.type === "skill") {
                let speciesBonus = 0;
                // Loop through the derived skills to see if we get a match
                for(let sk of this.actor.derived.species.skills){
                    if(sk.skill === i.name) speciesBonus += sk.bonus;
                }
                // Add the bonus to the skill item
                i.derived.species = speciesBonus;
                skills.push({
                    id: i.id,
                    img: i.img,
                    name: i.name,
                    bonus: (i.system.base > 0 ? 2 : 0) + i.system.base + i.system.modifier + speciesBonus
                });
            }
        }
        // Iterate through derived species bonus to skills
        // If we don't have the skill, add it
        for(let sk of this.actor.derived.species.skills){
            if(sk.skill != "" && sk.bonus > 0){
                const i = skills.findIndex((e) => e.name === sk.skill);
                if(i == -1){    // We didn't find the item
                    // Add a new Item object to actor
                    let data = { 
                        name: sk.skill, 
                        type: "skill", 
                        system: {base: 0, modifier: 0},
                        derived: {species: sk.bonus}
                    };
                    this.actor.createEmbeddedDocuments("Item", [data]);
                }
                // Else modify the existing skill? Replace the stuff in the Items loop above?
            }  
        }
        // Iterate through the skills on the actor and delete those that are just species bonus,
        // but aren't in the species
        

        // Assign groups to actor data
        let data = {
            species: species,
            skills: skills
        };

        return data;
    }
}