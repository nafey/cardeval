import { logParams } from "./Logger";
import { Event, Trigger, Refs } from "./Engine";
import Card from "./Card";
import Zone from "./Zone";

export default class Parser {
    refs : Refs = {};


    constructor(refs : Refs) {
        this.refs = refs;
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
        // logParams("Parser.parseEvent", ["event"], [event.event]);

        if (!event?.event) throw new Error("Missing event name on Event obj");

        let ret : Event = {
            event : event.event
        };

        let eventKeys : string[] = Object.keys(event);

        eventKeys.forEach((eventKey : string) => {
            if (eventKey === "event") return;
            let eventVal = event[eventKey];
            if (typeof eventVal !== "string") {
                ret[eventKey] = eventVal;
                return;
            }

            if (["card", "skip"].includes(eventKey)) {
                ret[eventKey] = this.readRefs(eventVal) as Card;
            } 
            else if (["zone", "from", "to", "in"].includes(eventKey)) {
                ret[eventKey] = this.readRefs(eventVal) as Zone;
            }
            else {
                ret[eventKey] = event[eventKey];
            }
        });

        return ret;
    }

    parseTrigger = (trigger : Trigger) : Trigger => {
        logParams("Parser.parseTrigger", ["trigger"], [trigger.on]);
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

        if (trigger?.ignore) this.readRefs(trigger.ignore) as Card;

        return ret;
    }

}