import cardsList from "src/hs/cardlist.json" with { type: "json"};

interface Effect {
    effect : string,
    code? : string,
    to? : string,
    val? : number
}

interface Trigger {
    trigger : string,
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
    on?: Trigger
}

export class HSCardList {
    getList = () : Record<string, ListCard> => {
        let list : ListCard[] = cardsList;

        let cards : Record<string, ListCard> = {};
        for (let i = 0; i < list.length; i++) {
            let c = list[i];
            cards[c.code] = list[i]; 
        }

        return cards;
    }
}

export default function HSCards () {
    let list : ListCard[] = cardsList;

    let cards : Record<string, ListCard> = {};
    for (let i = 0; i < list.length; i++) {
        let c = list[i];
        cards[c.code] = list[i]; 
    }



    return cards;
}