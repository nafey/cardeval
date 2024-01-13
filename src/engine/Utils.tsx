import Card from "./Card";

export function generateId () {
    let characters = "0123456789abcdef"
    let str = characters[1 + Math.floor(Math.random() * 15)]
    for(let i = 0; i < 20; i++){
        str += characters[Math.floor(Math.random() * 16)]
    }

    return str;
}

export function match (obj1 : any, obj2 : any) : boolean {
    let keys : string[] = Object.keys(obj2);
    for (let i = 0; i < keys.length; i++) {
        let k : string = keys[i];
        if (!(k in obj1)) return false; 

        let val1 : any = obj1[k];   
        let val2 : any = obj2[k];   

        if (typeof val1 !== typeof val2) return false;

        if (typeof val1 === "string" || typeof val1 === "number" || typeof val1 === "boolean") return val1 === val2;    
        return match(obj1[k], obj2[k]);
    }
    return true;
}

export function compareCards (a: Card, b: Card)  {
    return Object.entries(a).sort().toString() === Object.entries(b).sort().toString()
}
