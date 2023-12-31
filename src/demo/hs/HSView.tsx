import ReactJson from "react-json-view";
import HSEngine from "./HSEngine";
import { useState } from "react";
import Card from "src/engine/Card";
import Player from "src/engine/Player";
import HSCards from "src/demo/hs/HSCards.json"; 

const engine : HSEngine = new HSEngine();

let p : Player = engine.getActivePlayer();
p.getZone("BF").addCard( new Card(true, HSCards.CROC));


let o : Player = engine.getOtherPlayer();
o.getZone("BF").addCard( new Card(true, HSCards.MUR_RDR));




function HSView () {

	let [view, setView] = useState<Record<string, Record<string, string[]>>>(engine.getView())
	let onClick = () => {
		engine.attack(0, 0)
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