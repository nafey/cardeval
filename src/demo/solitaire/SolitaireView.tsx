import ReactJson from 'react-json-view'
import { useState } from "react";
import SolitaireEngine, {SolitaireCard} from "src/demo/solitaire/SolitaireEngine";
import Player from 'src/engine/Player';

let engine : SolitaireEngine = new SolitaireEngine();

let p : Player = engine.getPlayer()

p.zones.T1.addCard(new SolitaireCard({ suit: "D", num : 1 }, false));
p.zones.T1.addCard(new SolitaireCard({ suit: "D", num : 6 }, true));
p.zones.T2.addCard(new SolitaireCard({ suit: "C", num : 11 }, false));
p.zones.T2.addCard(new SolitaireCard({ suit: "S", num : 5 }, true));
p.zones.T2.addCard(new SolitaireCard({ suit: "D", num : 4 }, true));
p.zones.T3.addCard(new SolitaireCard({ suit: "D", num : 7 }, true));

function SolitaireView() {
	let [fromZoneName, setFromZoneName] = useState<string>("");
	let [toZoneName, setToZoneName] = useState<string>("");

	const fromZoneInput = (event: React.ChangeEvent<HTMLInputElement>) => {
		setFromZoneName(event.target.value);
	};

	const toZoneInput = (event: React.ChangeEvent<HTMLInputElement>) => {
		setToZoneName(event.target.value);
	};

	let [view, setView] = useState<Record<string, string[]>>(engine.getView());

	return (
		<>
			<ReactJson src={view} theme={"monokai"} enableClipboard={false} displayDataTypes={false} displayObjectSize={false}/>
			<div>
				<input 
					value={fromZoneName}
					onChange={fromZoneInput}
				>
				</input>
				<input
					value={toZoneName}
					onChange={toZoneInput}
				/>
				<button
					onClick={() => {
						engine.moveHandler(fromZoneName, toZoneName);
						setView(engine.getView())
					}}
				>
					Submit
				</button>
			</div>
		</>
	)
}

export default SolitaireView;
