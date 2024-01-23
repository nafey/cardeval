import Card from "./Card";
import { generateId } from "./Utils";
import Zone from "./Zone";


export default class Context {
	playerId: string = generateId();
	name: string = "";
	zones: Record<string, Zone> = {};
	players : Record<string, Context> = {};
	refs: Record<string, Card> = {}

	constructor () {
	}

	addZone = (zoneName: string, zone: Zone) => {
		zone.playerId = this.playerId;
		this.zones[zoneName] = zone;
	} 
	
}
