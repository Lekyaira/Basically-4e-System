// Item class
export class b4eItem extends Item {
    get skillTitle(){
        if(this.system.base >= 3){
            return "Master";
        }
        else if(this.system.base >= 2){
            return "Expert";
        }
        else if(this.system.base >= 1){
            return "Proficient";
        }
        else if(this.system.base == 0){
            return "Trained";
        }
        else {
            return "Deficient";
        }
    }

    get abilities(){
        return [
            "strength",
            "dexterity",
            "charisma",
            "intelligence",
            "luck",
            "fortitude",
            "reflexes",
            "will",
            "insight",
            "ac",
            "hp",
            "wp"
        ]
    }

    get defenses(){
        return [
            "fortitude",
            "reflexes",
            "will",
            "insight"
        ]
    }

    derived = {
        species: 0
    };
}