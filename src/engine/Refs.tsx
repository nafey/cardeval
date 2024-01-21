import Card from "./Card";
import { generateId } from "./Utils";
import Zone from "./Zone";


export default class Refs {
	playerId: string = generateId();
	name: string = "";
	zones: Record<string, Zone> = {};
	players : Record<string, Refs> = {};

	refs: Record<string, Card> = {}

	constructor (n: string = "") {
		this.name = n;
	}

	addZone = (zoneName: string, zone: Zone) => {
		zone.playerId = this.playerId;
		this.zones[zoneName] = zone;
	} 
	
}
