export default function HSCards () {

let cards : Record<string, any> = {
        "CROC": {
            "name": "River Croc",
            "attack": 2,
            "health": 3
        },
        "MUR_RDR": {
            "name": "Murloc Raider",
            "attack" : 2,
            "health" : 1
        },
        "BOAR" : {
            "name" : "Boar",
            "attack" : 1,
            "health" : 1
        },
        "RZR" : {
           "name" : "Razorfen Hunter",
           "attack" : 2,
           "health" : 3,
           "bcry" : {
                "type" : "SUMMON",
                "code" : "BOAR"
           } 
        },
        "RPTR" : {
            "name" : "Bloodfen Raptor",
            "attack": 3,
            "health": 2
        },
        "IRON" : {
            "name" : "Ironforge Dwarf",
            "attack" : 2,
            "health" : 2,
            "target" : "ANY",
            "bcry" : {
                "type" : "DAMAGE",
                "val" : 1
            }
        }
    }

    return cards;
}