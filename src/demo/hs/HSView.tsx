import ReactJson from "react-json-view";
import HSEngine from "./HSEngine";
import { useState } from "react";
import { CardEngine } from "src/engine/CardEngine";
import GameState from "src/engine/GameState";
import Card from "src/engine/Card";

const engine : CardEngine = HSEngine();
const state: GameState = engine.getState();


state.addCard("ME", new Card(true, {
	name: "River Croc",
	attack: 2,
	health: 3
}));


state.addCard("OPP", new Card(true, {
	name: "Murloc Raider",
	attack: 2,
	health: 1
}));


engine.pushAction(["ATTACK", {fromPos: 0, toPos: 0}])

function HSView () {

	let [view, setView] = useState<Record<string, string[]>>(engine.getState().getPlayer().getView())
	return (
		<div>
			<ReactJson src={view} theme={"monokai"} enableClipboard={false} displayDataTypes={false} displayObjectSize={false}/>
			<button onClick={() => engine.pushAction(["ATTACK", {fromPos: 0, toPos: 0}])}>Submit</button>
		</div>

	)
}

export default HSView;