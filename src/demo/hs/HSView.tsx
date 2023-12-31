import ReactJson from "react-json-view";
import HSEngine from "./HSEngine";
import { useState } from "react";
import Card from "src/engine/Card";
import Player from "src/engine/Player";

const engine : HSEngine = new HSEngine();

let p : Player = engine.getActivePlayer();
p.getZone("BF").addCard( new Card(true, {
	name: "River Croc",
	attack: 2,
	health: 3
}));

let o : Player = engine.getOtherPlayer();
o.getZone("BF").addCard( new Card(true, {
	name: "Murloc Raider",
	attack: 2,
	health: 1
}));




function HSView () {

	let [view, setView] = useState<Record<string, string[]>>(engine.getView())
	let onClick = () => {
		engine.attack(0, 0)
		setView(engine.getView());
	}
	
	return (
		<div>
			<ReactJson src={view} theme={"monokai"} enableClipboard={false} displayDataTypes={false} displayObjectSize={false}/>
			<button onClick={onClick}>Submit</button>
		</div>

	)
}

export default HSView;