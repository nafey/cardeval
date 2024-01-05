import ReactJson from "react-json-view";
import  HSEngine, {HSCard} from "./HSEngine";
import { useState } from "react";
import Player from "src/engine/Player";
import HSCards from "src/hs/HSCards"; 

const engine : HSEngine = new HSEngine();
const cardsList : any = HSCards();

let o : Player = engine.getOtherPlayer();
o.zones.BF.addCard(new HSCard(cardsList.LOOT));
o.zones.BF.addCard(new HSCard(cardsList.RPTR));
o.zones.DECK.addCard(new HSCard(cardsList.MRDR));

let p : Player = engine.getActivePlayer();
p.zones.BF.addCard(new HSCard(cardsList.CROC));
p.zones.HAND.addCard(new HSCard(cardsList.RZRH));
p.zones.HAND.addCard(new HSCard(cardsList.IRON));

function HSView () {

	let [view, setView] = useState<Record<string, Record<string, string[]>>>(engine.getView())
	let onClick = () => {
		engine.attack(0, 0);
		// engine.play(p.playerId, p.getZone("HAND").cards[0].cardId);
		// engine.play(p.playerId, p.getZone("HAND").cards[1].cardId, {"targetType" : "MIN", "playerId" : engine.getOtherPlayer().playerId, "cardId" : o.getZone("BF").cards[0].cardId});
		// engine.draw(o.playerId);
		setView(engine.getView());
	}
	
	return (
		<div>
			<ReactJson src={view} theme={"monokai"} enableClipboard={false} displayDataTypes={false} displayObjectSize={false}/>
			<button onClick={onClick}>Action</button>
		</div>

	)
}
 export default HSView;