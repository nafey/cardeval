import ReactJson from "react-json-view";
import  HSEngine, {HSCard} from "./HSEngine";
import { useState } from "react";
// import Card from "src/engine/Card";
import Player from "src/engine/Player";
import HSCards from "src/demo/hs/HSCards.tsx"; 

const engine : HSEngine = new HSEngine();
const cardsList : any = HSCards();

let o : Player = engine.getOtherPlayer();
o.getZone("BF").addCard( new HSCard(true, cardsList.LOOT));
o.getZone("BF").addCard(new HSCard(true, cardsList.RPTR));
o.getZone("DECK").addCard(new HSCard(true, cardsList.MURRDR));

let p : Player = engine.getActivePlayer();
p.getZone("BF").addCard( new HSCard(true, cardsList.CROC));
p.getZone("HAND").addCard(new HSCard(true, cardsList.RZR));
p.getZone("HAND").addCard(new HSCard(true, cardsList.IRON));


function HSView () {

	let [view, setView] = useState<Record<string, Record<string, string[]>>>(engine.getView())
	let onClick = () => {
		// engine.attack(0, 1)
		// engine.play(p.playerId, p.getZone("HAND").cards[0].cardId);
		engine.play(p.playerId, p.getZone("HAND").cards[1].cardId, {"targetType" : "MIN", "playerId" : engine.getOtherPlayer().playerId, "cardId" : o.getZone("BF").cards[0].cardId});
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