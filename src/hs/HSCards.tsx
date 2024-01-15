
// type TriggerType  = "SELF_DAMAGE" | "SUMMON";
export enum TriggerType {
    SELF_DAMAGE = "SELF_DAMAGE",
    SUMMON = "SUMMON"
}

export enum EffectType {
    DRAW = "DRAW",
    SUMMON = "SUMMON",
    DAMAGE = "DAMAGE"     
}

export enum EffectTargetType {
    TARGET = "TARGET",
    RANDOM_ENEMY = "RANDOM_ENEMY"
}

export interface Effect {
    effect : EffectType,
    code? : string,
    to? : EffectTargetType,
    val? : number
}

export interface Trigger {
    on : TriggerType,
    do : Effect
}

export interface ListCard {
    code : string,
    name : string,
    attack : number,
    health : number,
    taunt? : boolean,
    death?: Effect,
    bcry?: Effect,
    trigger?: Trigger
}

export class HSCardList {
    getCodedList = () : Record<string, ListCard> => {
        let list : ListCard[] = cardList;

        let cards : Record<string, ListCard> = {};
        for (let i = 0; i < list.length; i++) {
            let c = list[i];
            cards[c.code] = list[i]; 
        }

        return cards;
    }

    getList = () => cardList;

}

let hscards : Record<string, ListCard> = {};

let cardList = [
    {
        code : "CROC",
        name: "River Croc",
        attack: 2,
        health: 3
    },
    {
        code : "MRDR",
        name: "Murloc Raider",
        attack : 2,
        health : 1
    },
    {
        code : "BOAR",
        name : "Boar",
        attack : 1,
        health : 1
    },
    {
       code : "RZRH",
       name : "Razorfen Hunter",
       attack : 2,
       health : 3,
       bcry : {
            effect : EffectType.SUMMON,
            code : "BOAR"
       } 
    },
    {
        code : "RPTR",
        name : "Bloodfen Raptor",
        attack: 3,
        health: 2
    },
    {
        code : "IRON",
        name : "Ironforge Rifleman",
        attack : 2,
        health : 2,
        bcry : {
            effect : EffectType.DAMAGE,
            to : EffectTargetType.TARGET,
            val : 1
        }
    },
    {
        code : "LOOT",
        name : "Loot Hoarder",
        attack : 2,
        health : 1,
        death : {
            effect : EffectType.DRAW,
            val : 1
        }
    },
    {
        code : "GLDF",
        name : "Goldshire Footman",
        attack : 1,
        health : 2,
        taunt : true
    },
    {
        code : "KNFJ",
        name : "Knife Juggler",
        attack : 3,
        health : 2,
        trigger : {
            on : TriggerType.SUMMON,
            if : "FRIENDLY",
            do : {
                effect : EffectType.DAMAGE,
                to : EffectTargetType.RANDOM_ENEMY,
                val : 1
            }
        }
    },
    {
        code : "IMPB",
        name : "Imp Gang Boss",
        attack : 2,
        health : 4,
        trigger : {
            on : TriggerType.SELF_DAMAGE,
            do : {
                effect : EffectType.SUMMON,
                code : "IMPI"
            }
        }
    },
    {
        code : "IMPI",
        name : "Imp",
        attack : 1,
        health : 1
    }
]

