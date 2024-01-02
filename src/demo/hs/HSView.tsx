import ReactJson from "react-json-view";
import HSEngine, {HSCard} from "./HSEngine";
import { useState } from "react";
// import Card from "src/engine/Card";
import Player from "src/engine/Player";
import HSCards from "src/demo/hs/HSCards.json"; 

const engine : HSEngine = new HSEngine();


let o : Player = engine.getOtherPlayer();
o.getZone("BF").addCard( new HSCard(true, HSCards.MUR_RDR));
o.getZone("BF").addCard(new HSCard(true, HSCards.RPTR));

let p : Player = engine.getActivePlayer();
p.getZone("BF").addCard( new HSCard(true, HSCards.CROC));
p.getZone("HAND").addCard(new HSCard(true, HSCards.RZR));

function HSView () {

	let [view, setView] = useState<Record<string, Record<string, string[]>>>(engine.getView())
	let onClick = () => {
		// engine.attack(0, 0)
		engine.play(p.playerId, p.getZone("HAND").cards[0].cardId);
		setView(engine.getView());
	}
	
	return (
		<div>
			<ReactJson src={view} theme={"monokai"} enableClipboard={false} displayDataTypes={false} displayObjectSize={false}/>
			<button onClick={onClick}>Attack</button>
		</div>

	)
}

export default HSView;