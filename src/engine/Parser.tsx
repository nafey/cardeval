import { logParams } from "./Logger";
import { Event, Trigger, Dict, Func } from "./Engine";
import Card from "./Card";
import Zone from "./Zone";

export default class Parser {

	refs: Dict = {};


	constructor(refs: Dict) {
		this.refs = refs;
	}


	evalZone = () => {

	}

	evalCardId = () => {

	}


	lookup = (key: string): any => {
		if (!key.startsWith("@")) throw new Error("Invalid lookup string for refs");

		key = key.substring(1);

		let path : string[] = key.split(".");
		let obj = this.refs;
		for (let i = 0; i < path.length; i++) {
			let nextKey = path[i];	
			obj = obj[nextKey];
		}

		return obj;
	}

	parseVal = (val: any) : any => {
		let ret;
		if (typeof val === "object") {
			ret = this.parseFunc(val);
		}
		else if (typeof val === "string" && val.startsWith("@") ) {
			ret = this.lookup(val);
		}
		else {
			ret = val;
		}

		return ret;
	}

	parseFunc = (func: Func) : any => {
		let val1 : any = this.parseVal(func.val1); 
		let val2 : any = this.parseVal(func.val2);

		if (func.op === "DIFF") {
			return val1 - val2;
		}	
		else if (func.op === "SUM") {
			return val1 + val2;	
		}

		throw new Error("Invalid Operation type for function");
	}	

	parseObject = (obj : any) : any => {
		if (obj?.op) {
			return this.parseFunc(obj);
		}	


		let ret : any = {};
		for (const [key, val] of Object.entries(obj)) {
			if (typeof val === "object") {
				ret[key] = this.parseObject(val);	
			}	
			else {
				ret[key] = this.parseVal(val);
			}
		}

		return ret;
	}

	parseEvent = (event: Event): Event => {
		// logParams("Parser.parseEvent", ["event"], [event.event]);

		if (!event?.event) throw new Error("Missing event name on Event obj");

		let ret: Event = {
			event: event.event
		};

		let eventKeys: string[] = Object.keys(event);

		eventKeys.forEach((eventKey: string) => {
			if (eventKey === "event") return;
			let eventVal = event[eventKey];
			// if (typeof eventVal !== "string") {
			// 	ret[eventKey] = eventVal;
			// 	return;
			// }

			if (["card", "skip"].includes(eventKey)) {
				ret[eventKey] = this.lookup(eventVal) as Card;
			} 
			else if (["zone", "from", "to", "in"].includes(eventKey)) {
				ret[eventKey] = this.lookup(eventVal) as Zone;
			}
			else if (typeof eventVal === "object") {
				ret[eventKey] = this.parseObject(eventVal);
			}
			else if (typeof eventVal === "string" && eventVal.startsWith("@")) {
				ret[eventKey] = this.lookup(eventVal);
			}

			else {
				ret[eventKey] = event[eventKey];
			}
		});

		return ret;
	}

	parseTrigger = (trigger: Trigger): Trigger => {
		logParams("Parser.parseTrigger", ["trigger"], [trigger.on]);
		if (!trigger?.on) throw new Error("Missing event trigger name");
		if (!trigger?.do) throw new Error("Missing do event trigger");

		let doEvent: Event = this.parseEvent(trigger.do);      

		let ret: Trigger = {
			on: trigger.on,
			do: doEvent
		}

		if (trigger?.zone) {
			ret.zone = this.lookup(trigger.zone) as Zone;
		}       

		if (trigger?.onSelf) ret.onSelf = trigger.onSelf;

		if (trigger?.ignore) this.lookup(trigger.ignore) as Card;

		return ret;
	}

}