// Path for HTML templates
export const templatepath = "./systems/b4e/templates";

// Returns the modifier for an ability score
export function getModifier(value) {
    let mod = 0;
    if(value <= 3){
        mod = value -6;
    }
    else if(value >= 4 && value <= 5){
        mod = -2;
    }
    else if(value >= 6 && value <= 8){
        mod = -1;
    }
    else if(value >= 9 && value <= 12){
        mod = 0;
    }
    else if(value >= 13 && value <= 15){
        mod = 1;
    }
    else if(value >= 16 && value <= 17){
        mod = 2;
    }
    else if(value >= 18){
        mod = value - 15;
    }

    return mod;
}