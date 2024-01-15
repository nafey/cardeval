// type TriggerType  = "SELF_DAMAGE" | "SUMMON";
export enum CardType {
    MINION = "MINION",
    SPELL = "SPELL"
}

export enum TriggerType {
    SELF_DAMAGE = "SELF_DAMAGE",
    SUMMON = "SUMMON"
}

export enum TriggerConditions {
    FRIENDLY = "FRIENDLY"
}

export interface Trigger {
    on: TriggerType,
    do: Effect,
    if?: TriggerConditions,
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

export interface DrawEffect {
    effect: EffectType.DRAW,
    val: number
}

export interface DamageEffect {
    effect : EffectType.DAMAGE,
    to: EffectTargetType,
    val: number
}

export interface SummonEffect {
    effect : EffectType.SUMMON,
    code : string
}

type Effect = DrawEffect | DamageEffect | SummonEffect;

export interface Minion {
    code: string,
    name: string,
    type: CardType.MINION,
    attack: number,
    health: number,
    taunt?: boolean,
    death?: Effect,
    bcry?: Effect,
    trigger?: Trigger
}

export interface Spell {
    code: string,
    name: string,
    type: CardType.SPELL,
    text: Effect, 
}

export type ListCard = Minion | Spell;

export class HSCardList {
    getCodedList = (): Record<string, ListCard> => {
        return hscards;
    }
}

let hscards: Record<string, ListCard> = {};


hscards.CROC = 
{
    code: "CROC",
    name: "River Croc",
    type : CardType.MINION,
    attack: 2,
    health: 3
};

hscards.MRDR = 
{
    code: "MRDR",
    name: "Murloc Raider",
    type : CardType.MINION,
    attack: 2,
    health: 1
};

hscards.BOAR = 
{
    code: "BOAR",
    name: "Boar",
    type : CardType.MINION,
    attack: 1,
    health: 1
};

hscards.RZRH =
{
    code: "RZRH",
    name: "Razorfen Hunter",
    type : CardType.MINION,
    attack: 2,
    health: 3,
    bcry: {
        effect: EffectType.SUMMON,
        code: "BOAR"
    } 
};

hscards.RPTR = 
{
    code: "RPTR",
    name: "Bloodfen Raptor",
    type : CardType.MINION,
    attack: 3,
    health: 2
};

hscards.IRON =
{
    code: "IRON",
    name: "Ironforge Rifleman",
    type : CardType.MINION,
    attack: 2,
    health: 2,
    bcry: {
        effect: EffectType.DAMAGE,
        to: EffectTargetType.TARGET,
        val: 1
    }
};

hscards.LOOT = 
{
    code: "LOOT",
    name: "Loot Hoarder",
    type : CardType.MINION,
    attack: 2,
    health: 1,
    death: {
        effect: EffectType.DRAW,
        val: 1
    }
};

hscards.GLDF = 
{
    code: "GLDF",
    name: "Goldshire Footman",
    type : CardType.MINION,
    attack: 1,
    health: 2,
    taunt: true
};

hscards.KNFJ = 
{
    code: "KNFJ",
    name: "Knife Juggler",
    type : CardType.MINION,
    attack: 3,
    health: 2,
    trigger: {
        on: TriggerType.SUMMON,
        if: TriggerConditions.FRIENDLY,
        do: {
            effect: EffectType.DAMAGE,
            to: EffectTargetType.RANDOM_ENEMY,
            val: 1
        }
    }
};

hscards.IMPB = 
{
    code: "IMPB",
    name: "Imp Gang Boss",
    type : CardType.MINION,
    attack: 2,
    health: 4,
    trigger: {
        on: TriggerType.SELF_DAMAGE,
        do: {
            effect: EffectType.SUMMON,
            code: "IMPI"
        }
    }
};

hscards.IMPI = 
{
    code: "IMPI",
    name: "Imp",
    type : CardType.MINION,
    attack: 1,
    health: 1
};


