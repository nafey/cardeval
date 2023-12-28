
import { CardEngine } from "src/engine/CardEngine.js";
import ReactJson from 'react-json-view'
import { useState } from "react";
import SolitaireEngine, {SolitaireCard} from "src/demo/solitaire/SolitaireEngine";

let engine: CardEngine = SolitaireEngine();

engine.getState().addCard("T1", new SolitaireCard(false, { suit: "D", num : 1 }));
engine.getState().addCard("T1", new SolitaireCard(true, { suit: "D", num : 6 }));

engine.getState().addCard("T2", new SolitaireCard(false, { suit: "C", num: 11 }));
engine.getState().addCard("T2", new SolitaireCard(true, { suit: "S", num: 5 }));
engine.getState().addCard("T2", new SolitaireCard(true, { suit: "D", num: 4 }));

engine.getState().addCard("T3", new SolitaireCard(true, {suit: "C", num: 7}));


function SolitaireView() {
	let [fromZoneName, setFromZoneName] = useState<string>("");
	let [toZoneName, setToZoneName] = useState<string>("");
	


	const fromZoneInput = (event: React.ChangeEvent<HTMLInputElement>) => {
		setFromZoneName(event.target.value);
	};

	const toZoneInput = (event: React.ChangeEvent<HTMLInputElement>) => {
		setToZoneName(event.target.value);
	};

	let [view, setView] = useState<Record<string, string[]>>(engine.getState().getPlayer().getView())

	return (
		<>
			<ReactJson src={view} theme={"monokai"} enableClipboard={false} displayDataTypes={false} displayObjectSize={false}/>
			<div>
				<input 
					key={1}
					value={fromZoneName}
					onChange={fromZoneInput}
				>
				</input>
				<input
					key={2}
					value={toZoneName}
					onChange={toZoneInput}
				/>
				<button
					key="btn"
					onClick={() => {
						engine.pushAction(["MOVE", {fromZone: fromZoneName, toZone: toZoneName}]);
						setView(engine.getState().getPlayer().getView())
					}}
				>
					Submit
				</button>
			</div>
		</>
	)
}

export default SolitaireView;
