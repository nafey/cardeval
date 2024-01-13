import { generateId } from "./Utils";
import Zone from "./Zone";


export default class Player {
	playerId: string = generateId();
	name: string = "";
	zones: Record<string, Zone> = {};
	players : Record<string, Player> = {};
	vals: Record<string, number> = {};

	constructor (n: string = "") {
		this.name = n;
	}

	addZone = (zoneName: string, zone: Zone) => {
		zone.playerId = this.playerId;
		this.zones[zoneName] = zone;
	} 
	
}
