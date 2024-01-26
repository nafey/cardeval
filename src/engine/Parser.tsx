import { logParams } from "./Logger";
import { Event, Trigger, Refs } from "./Engine";
import Card from "./Card";
import Zone from "./Zone";

export default class Parser {
    refs : Refs = {};

    constructor(card: Card, grefs : Refs) {
        let ret : Record<string, any> = {};
        let crefs : Record<string, any> = card ? card.refs : {};
        let zrefs : Record<string, any> = card?.zone?.refs ? card.zone.refs : {};
        Object.keys(grefs).forEach((k : string) => {
            ret[k] = grefs[k];
        });

        Object.keys(zrefs).forEach((k : string) => {
            ret[k] = zrefs[k];
        });

        Object.keys(crefs).forEach((k : string) => {
            ret[k] = crefs[k];
        });

        this.refs = ret;
    }

    evalZone = () => {

    }

    evalCardId = () => {

    }

    readRefs = (lookup : string) : any => {
        if (!lookup.startsWith("@")) throw new Error("Invalid lookup string for refs");

        if (lookup === "@this.zone") return this.refs["this"].zone;
        return this.refs[lookup.substring(1)];
    }


    parseEvent = (event : Event) : Event => {
        logParams("hydrateEvent", ["event"], [event.event]);


        if (!event?.event) throw new Error("Missing event name on Event obj");
        let ret : Event = {
            event : event.event
        }       

        if (event?.card) {
            ret.card = this.readRefs(event.card) as Card;
        }

        if (event?.zone) {
            ret.zone = this.readRefs(event.zone) as Zone;
        }

        if (event?.update) {
            ret.update = event.update;
        }

        if (event?.code) {
            ret.code = event.code;
        }

        if (event?.in) {
            ret.in = this.readRefs(event.in) as Zone;
        }

        if (event?.onSelf) {
            ret.onSelf = event.onSelf;
        }

        return ret;
    }

    parseTrigger = (trigger : Trigger) : Trigger => {
        logParams("hydrateTrigger", ["trigger"], [trigger.on]);
        if (!trigger?.on) throw new Error("Missing event trigger name");
        if (!trigger?.do) throw new Error("Missing do event trigger");

        let doEvent : Event = this.parseEvent(trigger.do);      

        let ret : Trigger = {
            on : trigger.on,
            do : doEvent
        }

        if (trigger?.zone) {
            ret.zone = this.readRefs(trigger.zone) as Zone;
        }       

        if (trigger?.onSelf) ret.onSelf = trigger.onSelf;

        return ret;
    }
}