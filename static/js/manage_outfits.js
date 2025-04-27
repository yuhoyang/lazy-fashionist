const deleted_boxes = [];
let index_deleted_boxes = 0;

// code for class change if selected
document.querySelectorAll(".box").forEach(box => {
	box.addEventListener("click", () => {
		box.classList.toggle("selected");
	});
});

// get outfit data and list them on table
fetch('/list_outfit', {
	method: 'GET'
})
	.then(response => response.json())
	.then(data => {
		const gridBody = document.getElementById("outfit-grid");
		// TODO: might need to change this, cuz unnecessary div tags maybe
		const box = document.createElement("div");
		box.className = "box";

		for (let i=0;i<data.length;i++) {
			box.id = data[i].id;
			box.innerHTML = `
				<img src="https://via.placeholder.com/100" />
				<p>${data[i]}</p>
				`;
			gridBody.appendChild(box);
		}
	});

// delete all selected boxes with class "box selected"
document.getElementById(".delete-btn").addEventListender("click", function() {
	const selected_container = document.querySelectorAll(".box.selected");

	// save all deleted boxes into array
	for (let i=0;i<selected_container.length;i++){
		deleted_boxes.push(selected_container[i].id);
		index_deleted_boxes++;
	}
	selected_container.remove();
});

// TODO: need to rework this. might have to implement ID system
document.getElementById("save-outfit").addEventListener("click", function() {
	const catInput = document.querySelectorAll(".categoryInput");
	const valInput = document.querySelectorAll(".valueInput");
	const data = {};

	for (let i=0;i<catInput.length;i++) {
		const key = catInput[i].value;
		const value = valInput[i].value;
		data[key] = value;
	}

	console.log(data)

	fetch('/set_outfit', {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data, false, 4)
	})
		.then(res => res.json())
		.then(data => {
			console.log("Server response:", data);
		});
});
