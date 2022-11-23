import { getModifier } from "../core/utilities.js";

// Actor class
export class b4eActor extends Actor {

    // Character's species and templates
    species = [];
    get hasSpecies(){
        return this.species.length > 0;
    }

    // Derived statistics
    derived = {
        species: {},

        sp: 6,
        fly: 0,
        overland: 0,
        climb: 0,
        swim: 0,
        burrow: 0,

        strength: 10,
        dexterity: 10,
        charisma: 10,
        intelligence: 10,
        luck: 10,

        str: 0,
        dex: 0,
        cha: 0,
        int: 0,
        luk: 0,

        fortitude: 10,
        reflexes: 10,
        will: 10,
        insight: 10,
        ac:10
    }

    prepareDerivedData() {
        let data = this.system;
        let derived = this.derived;

        // Reset the species bonuses
        derived.species = {};

        this.prepareItems();

        // Set derived stats
        
        // Set ability scores
        this.prepareAbilityScores();

        // Set ability score modifiers
        derived.str = getModifier(derived.strength);
        derived.dex = getModifier(derived.dexterity);
        derived.cha = getModifier(derived.charisma);
        derived.int = getModifier(derived.intelligence);
        derived.luk = getModifier(derived.luck);

        // Set defenses
        derived.fortitude = 10 + derived.str + (derived.species['fortitude'] ? derived.species.fortitude : 0);
        derived.reflexes = 10 + derived.dex + (derived.species['reflexes'] ? derived.species.reflexes : 0);
        derived.will = 10 + derived.cha + (derived.species['will'] ? derived.species.will : 0);
        derived.insight = 10 + derived.int + (derived.species['insight'] ? derived.species.insight : 0);
        derived.ac = 10 + Math.max(derived.dex, derived.int) + (derived.species['ac'] ? derived.species.ac : 0);

        // Set speed
        derived.sp = (derived.species['sp'] ? derived.species.sp : 6);
        derived.fours = (derived.species['fours'] ? derived.species.fours : 0);
        derived.fly = (derived.species['fly'] ? derived.species.fly : 0);
        derived.overland = (derived.species['overland'] ? derived.species.overland : 0);
        derived.climb = (derived.species['climb'] ? derived.species.climb : 0);
        derived.swim = (derived.species['swim'] ? derived.species.swim : 0);
        derived.burrow = (derived.species['burrow'] ? derived.species.burrow : 0);

        // Set saved stats

        // Set HP
        data.hp.max = data.level + derived.str;
    }

    prepareAbilityScores(){
        let data = this.system;
        let derived = this.derived;
        derived.strength = data.strength + (derived.species['strength'] ? derived.species.strength : 0);
        derived.dexterity = data.dexterity + (derived.species['dexterity'] ? derived.species.dexterity : 0);
        derived.charisma = data.charisma + (derived.species['charisma'] ? derived.species.charisma : 0);
        derived.intelligence = data.intelligence + (derived.species['intelligence'] ? derived.species.intelligence : 0);
        derived.luck = data.luck + (derived.species['luck'] ? derived.species.luck : 0);
    }

    prepareItems(){
        const species = [];

        // Do we have a species yet?
        let hasSpecies = false;

        // Loop through all the actor's items
        for(let i of this.items){
            // Sort species
            if(i.type === "species"){
                if(hasSpecies){
                    // We already have a species. Get rid of this.
                    i.delete();
                }
                else {
                    // We don't have a species yet. Add the species and set the flag.
                    species.push(i);
                    hasSpecies = true;

                    // Set ability bonuses
                    for(let ab of i.system.abilities){
                        if(this.derived.species[ab.ability]){
                            this.derived.species[ab.ability] += ab.bonus;
                        }
                        else {
                            this.derived.species[ab.ability] = ab.bonus;
                        }
                        // this.derived[ab.ability] += ab.bonus;
                    }

                    // Set movement speeds
                    this.derived.species['sp'] = i.system.sp;
                    this.derived.species['fours'] = i.system.fours;
                    this.derived.species['fly'] = i.system.fly;
                    this.derived.species['overland'] = i.system.overland;
                    this.derived.species['climb'] = i.system.climb;
                    this.derived.species['swim'] = i.system.swim;
                    this.derived.species['burrow'] = i.system.burrow;
                }
            }
        }

        this.species = species;
    }
}