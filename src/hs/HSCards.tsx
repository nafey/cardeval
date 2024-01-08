import * as cardsList from "src/hs/cardlist.json";

enum EffectType {
    SUMMON = "SUMMON",
    DAMAGE = "DAMAGE"
}

enum TargetType {
    TARGET = "TARGET",
    RANDOM_ENEMY = "RANDOM_ENEMY"
}

enum TriggerType {
    SELF_DAMAGE = "SELF_DAMAGE"
}

interface Effect {
    effect : EffectType,
    code? : string,
    to? : TargetType,
    val? : number
}

interface Trigger {
    trigger : TriggerType,
    do : Effect
}

export interface ListCard {
    code : string,
    name : string,
    attack : number,
    health : number,
    taunt : boolean,
    death?: Effect,
    bcry?: Effect,
    on?: Trigger
}

export default function HSCards () {
    let list = cardsList as ListCard[];

    let cards : Record<string, ListCard> = {};
    for (let i = 0; i < list.default.length; i++) {
        let c = list.default[i];
        cards[c.code] = list.default[i]; 
    }



    return cards;
}