import * as cardsList from "src/hs/cardlist.json";

export default function HSCards () {
    let list = cardsList as any;

    let cards : Record<string, any> = {};
    for (let i = 0; i < list.default.length; i++) {
        let c = list.default[i];
        cards[c.code] = list.default[i]; 
    }

    return cards;
}