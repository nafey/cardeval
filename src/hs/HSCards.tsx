// type TriggerType  = "SELF_DAMAGE" | "SUMMON";
export enum CardType {
    MINION = "MINION",
    SPELL = "SPELL"
}

export enum HSClass {
    NEUTRAL = "NEUTRAL",
    DEMON_HUNTER = "DEMON_HUNTER",
    DRUID = "DRUID",
    HUNTER = "HUNTER",
    MAGE = "MAGE",
    PALADIN = "PALADIN",
    PRIEST = "PRIEST",
    ROGUE = "ROGUE",
    SHAMAN = "SHAMAN",
    WARLOCK = "WARLOCK",
    WARRIOR = "WARRIOR",
}

export enum Set {
    BASIC = "Basic",
    CLASSIC = "CLASSIC",
}

export enum Rarity {
    FREE = "FREE",
    COMMON = "COMMON",
    RARE = "RARE",
    EPIC = "EPIC",
    LEGENDARY = "LEGENDARY",
    UNCOLLECTIBLE = "UNCOLLECTIBLE",
}

export enum Tribe {
    BEAST = "BEAST",
    DEMON = "DEMON",
    MURLOC = "MURLOC",
    MECH = "MECH",
    NAGA = "NAGA",
    ELEMENTAL = "ELEMENTAL",
    TOTEM = "TOTEM",
    UNDEAD = "UNDEAD",
    DRAGON = "DRAGON",
}

export enum SpellSchool {
    ARCANE = "ARCANE",
    FEL = "FEL",
    HOLY = "HOLY",
    SHADOW = "SHADOW",
    NATURE = "NATURE",
    FROST = "FROST",
    FIRE = "FIRE", 
}

export enum TriggerType {
    SELF_DAMAGE = "SELF_DAMAGE",
    SUMMON = "SUMMON"
}

export enum TriggerConditions {
    FRIENDLY = "FRIENDLY"
}

export interface HSTrigger {
    on: TriggerType,
    do: HSEvent,
    if?: TriggerConditions,
}

export enum HSEventType {
    DRAW = "DRAW",
    SUMMON = "SUMMON",
    DAMAGE = "DAMAGE",
    HEAL = "HEAL"
}

export enum HSEventArea {
    TARGET = "TARGET",
    RANDOM_ENEMY = "RANDOM_ENEMY",
    FRIENDLY = "FRIENDLY",
    FRIENDLY_MIN = "FRIENDLY_MIN",
    ENEMY = "ENEMY",
    ENEMY_MIN = "ENEMY_MIN",
    ALL = "ALL"
}

export interface DrawEvent {
    event: HSEventType.DRAW,
    val: number
}

export interface DamageEvent {
    event: HSEventType.DAMAGE,
    to: HSEventArea,
    val: number
}

export interface SummonEvent {
    event: HSEventType.SUMMON,
    code: string
}

export interface HealEvent {
    event: HSEventType.HEAL,
    to: HSEventArea,
    val: number
}

export type HSEvent = DrawEvent | DamageEvent | SummonEvent | HealEvent;

export interface Minion {
    code: string,
    name: string,
    type: CardType.MINION,
    class: HSClass | HSClass[],
    cost: number,
    attack: number,
    health: number,
    taunt?: boolean,
    death?: HSEvent,
    bcry?: HSEvent,
    trigger?: HSTrigger,
    collectible?: boolean,
    tribe?: Tribe | Tribe[],
    set: Set,
    rarity: Rarity,
}

export interface Spell {
    code: string,
    name: string,
    class: HSClass | HSClass[],
    cost: number,
    type: CardType.SPELL,
    text: HSEvent | HSEvent[], 
    collectible?: boolean,
    spellSchool?: SpellSchool,
    set: Set,
    rarity: Rarity,
}

export type HSCard = Minion | Spell;

let hscards: Record<string, HSCard> = {};

hscards.CROC = 
{
    code: "CROC",
    name: "River Crocolisk",
    class: HSClass.NEUTRAL,
    cost: 2,
    type: CardType.MINION,
    attack: 2,
    health: 3,
    tribe: Tribe.BEAST,
    set: Set.BASIC,
    rarity: Rarity.FREE,
};

hscards.MRDR = 
{
    code: "MRDR",
    name: "Murloc Raider",
    class: HSClass.NEUTRAL,
    cost: 1,
    type: CardType.MINION,
    attack: 2,
    health: 1,
    tribe: Tribe.MURLOC,
    set: Set.BASIC,
    rarity: Rarity.FREE,
};

hscards.BOAR = 
{
    code: "BOAR",
    name: "Boar",
    class: HSClass.NEUTRAL,
    cost: 1,
    type: CardType.MINION,
    attack: 1,
    health: 1,
    collectible: false,
    tribe: Tribe.BEAST,
    set: Set.BASIC,
    rarity: Rarity.UNCOLLECTIBLE,
};

hscards.RZRH =
{
    code: "RZRH",
    name: "Razorfen Hunter",
    class: HSClass.NEUTRAL,
    cost: 3,
    type: CardType.MINION,
    attack: 2,
    health: 3,
    bcry: {
        event: HSEventType.SUMMON,
        code: "BOAR"
    },
    set: Set.BASIC,
    rarity: Rarity.FREE,
};

hscards.RPTR = 
{
    code: "RPTR",
    name: "Bloodfen Raptor",
    class: HSClass.NEUTRAL,
    type: CardType.MINION,
    cost: 2,
    attack: 3,
    health: 2,
    set: Set.BASIC,
    rarity: Rarity.FREE,
};

hscards.IRON =
{
    code: "IRON",
    name: "Ironforge Rifleman",
    class: HSClass.NEUTRAL,
    type: CardType.MINION,
    cost: 3,
    attack: 2,
    health: 2,
    bcry: {
        event: HSEventType.DAMAGE,
        to: HSEventArea.TARGET,
        val: 1
    },
    set: Set.BASIC,
    rarity: Rarity.FREE,
};

hscards.LOOT = 
{
    code: "LOOT",
    name: "Loot Hoarder",
    class: HSClass.NEUTRAL,
    type: CardType.MINION,
    cost: 2,
    attack: 2,
    health: 1,
    death: {
        event: HSEventType.DRAW,
        val: 1
    },
    set: Set.BASIC,
    rarity: Rarity.FREE,
};

hscards.GLDF = 
{
    code: "GLDF",
    name: "Goldshire Footman",
    class: HSClass.NEUTRAL,
    type: CardType.MINION,
    cost: 1,
    attack: 1,
    health: 2,
    taunt: true,
    set: Set.BASIC,
    rarity: Rarity.FREE,
};

hscards.KNFJ = 
{
    code: "KNFJ",
    name: "Knife Juggler",
    class: HSClass.NEUTRAL,
    type: CardType.MINION,
    cost: 2,
    attack: 3,
    health: 2,
    trigger: {
        on: TriggerType.SUMMON,
        if: TriggerConditions.FRIENDLY,
        do: {
            event: HSEventType.DAMAGE,
            to: HSEventArea.RANDOM_ENEMY,
            val: 1
        }
    },
    set: Set.CLASSIC,
    rarity: Rarity.RARE,
};

hscards.IMPB = 
{
    code: "IMPB",
    name: "Imp Gang Boss",
    class: HSClass.WARLOCK,
    type: CardType.MINION,
    cost: 3,
    attack: 2,
    health: 4,
    trigger: {
        on: TriggerType.SELF_DAMAGE,
        do: {
            event: HSEventType.SUMMON,
            code: "IMPI"
        }
    },
    tribe: Tribe.DEMON,
    set: Set.CLASSIC,
    rarity: Rarity.COMMON,
};

hscards.IMPI = 
{
    code: "IMPI",
    name: "Imp",
    class: HSClass.WARLOCK,
    type: CardType.MINION,
    cost: 1,
    attack: 1,
    health: 1,
    collectible: false,
    tribe: Tribe.DEMON,
    set: Set.CLASSIC,
    rarity: Rarity.UNCOLLECTIBLE,
};

hscards.ARCN = 
{
    code: "ARCN",
    name: "Arcane Shot",
    class: HSClass.HUNTER,
    type: CardType.SPELL,
    cost: 1,
    text: {
        event: HSEventType.DAMAGE,
        to: HSEventArea.TARGET,
        val: 2
    },
    set: Set.BASIC,
    rarity: Rarity.FREE,
}

hscards.VOOD = 
{
    code: "VOOD",
    name: "Voodo Doctor",
    class: HSClass.NEUTRAL,
    type: CardType.MINION,
    cost: 1,
    attack: 2,
    health: 1,
    bcry: {
        event: HSEventType.HEAL,
        to: HSEventArea.TARGET,
        val: 2
    },
    set: Set.BASIC,
    rarity: Rarity.FREE,
}

hscards.HELL = 
{
    code: "HELL",
    name: "Hellfire",
    class: HSClass.WARLOCK,
    type: CardType.SPELL,
    cost: 3,
    text: {
        event: HSEventType.DAMAGE,
        to: HSEventArea.ALL,
        val: 3
    },
    set: Set.BASIC,
    rarity: Rarity.FREE
}

hscards.HOLY = 
{
    code: "HOLY",
    name: "Holy Nova",
    class: HSClass.PRIEST,
    type: CardType.SPELL,
    cost: 3,
    text: [
        {
            event: HSEventType.DAMAGE,
            to: HSEventArea.ENEMY_MIN,
            val: 2
        },
        {
            event: HSEventType.HEAL,
            to: HSEventArea.FRIENDLY,
            val: 2
        }
    ],
    set: Set.BASIC,
    rarity: Rarity.FREE
}


export class HSCardList {
    getCodedList = (): Record<string, HSCard> => hscards
}