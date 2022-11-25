import { templatepath } from "../core/utilities.js";

//////////////
// HOOKS    //
//////////////

// Set the item sheet size based on its type
Hooks.on("renderb4eItemSheet", async (sheet) =>{
    sheet.setSize();
});

//////////////
// SHEET    //
//////////////

// Item sheet class
export class b4eItemSheet extends ItemSheet {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["b4e", "sheet", "item"],
            width: 600,
            height: 600,
            resizable: false
        });
    }

    get template() {
        return `${templatepath}/${this.item.type}-sheet.html`;
    }

    async maximize() {
        this.setSize();
        super.maximize();
    }

    async _updateObject(event, formData){
        formData = expandObject(formData);
        console.log(formData);
        if(formData['system']){
            if(formData.system['abilities']){
                formData.system.abilities = Object.values(formData.system.abilities);
            }
            if(formData.system['skills']){
                formData.system.skills = Object.values(formData.system.skills);
            }
        }
        console.log(flattenObject(formData));
        super._updateObject(event, flattenObject(formData));
    }

    setSize() {
        if(this.item.type === "skill"){
            this.setPosition({width: 480, height: 170});
        }
        if(this.item.type === "species"){
            this.setPosition({width: 800, height: 400});
        }
    }

    activateListeners(html) {
        super.activateListeners(html);

        // Everything below is only needed if the sheet is editable
        if (!this.isEditable) return;

        $('.species-sheet .add-ability').click(ev => {
            const abilities = this.item.system.abilities;
            abilities.push({
                ability: this.item.abilities[0],
                bonus: 0
            });
            this.item.system.abilities = abilities;
            if(this.actor){
                this.actor.prepareDerivedData();
                this.actor.sheet.render();
            }
            this.render();
        });

        $('.species-sheet .delete-ability').click(ev => {
            let idString = $(ev.currentTarget).attr("id");
            let index = idString.split(":")[1];
            const abilities = this.item.system.abilities;
            abilities.splice(index, 1);
            this.item.system.abilities = abilities;
            if(this.actor){
                this.actor.prepareDerivedData();
                this.actor.sheet.render();
            }
            this.render();
        });

        $('.species-sheet .add-skill').click(ev => {
            const skills = this.item.system.skills;
            skills.push({
                skill: "",
                bonus: 0
            });
            this.item.system.skills = skills;
            if(this.actor){
                this.actor.prepareDerivedData();
                this.actor.sheet.render();
            }
            this.render();
        });

        $('.species-sheet .delete-skill').click(ev => {
            let idString = $(ev.currentTarget).attr("id");
            let index = idString.split(":")[1];
            const skills = this.item.system.skills;
            skills.splice(index, 1);
            this.item.system.skills = skills;
            if(this.actor){
                this.actor.prepareDerivedData();
                this.actor.sheet.render();
            }
            this.render();
        });
    }
}