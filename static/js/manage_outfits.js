let outfits = {};

// code for class change if selected
document.querySelectorAll(".box").forEach(box => {
	box.addEventListener("click", () => {
		box.classList.toggle("selected");
	});
});

// get outfit data and list them on table
fetch('/get_outfits', {
	method: 'GET'
})
	.then(response => response.json())
	.then(data => {
		if ("error" in data) {
			console.warn(data["error"]);
			return;
		}

		outfits = data;
		console.log(data);
		const gridBody = document.querySelector(".outfit-grid");

		for (key in data) {
			delete data[key].__tags__; // to avoid displaying it as a piece
			const box = document.createElement("div");
			box.className = "box";
			box.id = key;

			for (piece in data[key]) {
				const p = document.createElement("p");
				p.textContent = data[key][piece];
				box.appendChild(p);
			}

			box.addEventListener("click", () => {
				box.classList.toggle("selected");
			});

			gridBody.appendChild(box);
		}
		outfits["deleted_outfits"] = [];
	});

// delete all selected boxes with class "box selected"
document.getElementById("delete-btn").addEventListener("click", function() {
	const selected_container = document.querySelectorAll(".box.selected");

	// save all deleted boxes into array
	for (let i=0;i<selected_container.length;i++){
		outfit = selected_container[i];
		outfits["deleted_outfits"].push([outfit.id, outfits[outfit.id]]);
		delete outfits[outfit.id];
		console.log(outfits["deleted_outfits"]);
		outfit.remove();
	}
});

// TODO: need to rework this. might have to implement ID system
document.getElementById("save-outfit").addEventListener("click", function() {
	fetch('/set_outfit', {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(outfits, false, 4)
	})
		.then(res => res.json())
		.then(data => {
			console.log("Server response:", data);
		});
});
