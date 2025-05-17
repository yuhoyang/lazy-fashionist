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
		outfits = data;
		const gridBody = document.querySelector(".outfit-grid");
		// TODO: might need to change this, cuz unnecessary div tags maybe

		for (key in data) {
			const box = document.createElement("div");
			box.className = "box";
			box.id = key;

			for (piece in data[key]) {
				const p = document.createElement("p");
				p.textContent = piece;
				box.appendChild(p);
			}

			box.addEventListener("click", () => {
				box.classList.toggle("selected");
			});

			gridBody.appendChild(box);
		}
	});

// delete all selected boxes with class "box selected"
document.getElementById("delete-btn").addEventListener("click", function() {
	const selected_container = document.querySelectorAll(".box.selected");

	// save all deleted boxes into array
	for (let i=0;i<selected_container.length;i++){
		delete outfits[selected_container[i].id];
		selected_container[i].remove();
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
