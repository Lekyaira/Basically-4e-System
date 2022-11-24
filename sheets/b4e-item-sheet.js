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
        if(formData['system']){
            if(formData.system['abilities']){
                formData.system.abilities = Object.values(formData.system.abilities);
            }
        }
        super._updateObject(event, flattenObject(formData));
    }

    setSize() {
        if(this.item.type === "skill"){
            this.setPosition({width: 400, height: 140});
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
    }
}