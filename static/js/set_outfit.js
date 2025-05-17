function get_pieces() {

	fetch('/get_pieces', {
		method: 'GET'
	})
		.then(response => response.json())
		.then(data => {
			tableBody = document.querySelector(".scroll-table");

			piecesTable = document.getElementById("pieces-table");
			piecesTable.innerHTML = "";

			for (pieceCategory in data) {
				for (piece in data[pieceCategory]) {
					const row = document.createElement("tr");

					row.innerHTML = `
						<td>${pieceCategory}</td>
						<td>${piece}</td>`;
					piecesTable.appendChild(row);

					row.addEventListener("click", () => {
						row.classList.toggle("selected");

						if (row.classList.contains('selected')) {
							outfitTable = document.querySelector(".outfit-table");
							outfitTable.appendChild(row);
							tablebody.scrolltop = tablebody.scrollheight
						}
						else {
							piecesTable.appendChild(row);
							tableBody.scrolltop = tableBody.scrollheight
						}

					});


				}
			}
		})
}
get_pieces();

function addInputContainer() {
	const container = document.getElementById("inputContainers");
	const wrapper = document.createElement("div");

	wrapper.innerHTML = `
		<div class='column input-column'>
			<input class="categoryInput" type="text" placeholder="clothing category" required></input>
		</div>
		<div class='column input-column'>
			<input class="valueInput" type="text" placeholder="clothing" required></input>
		</div>
		<div class='column remove-column'>
			<button type="button" class="remove-btn" innerText="Remove">Remove</button>
		</div>
		`

	wrapper.querySelector(".remove-btn").onclick = () => {
		wrapper.remove();
	}

	container.appendChild(wrapper);
}
/*
document.getElementById("tag-btn").addEventListener("click", function() {
	const container = document.getElementById("tags");
	const wrapper = document.createElement("div");

	wrapper.innerHTML = `
			<div class='column'>
				<input class="tagInput" type="text" placeholder="tag" required></input>
			</div>
			<div class='column'>
				<button type="button" class="remove-tag-btn" innerText="Remove">Remove</button>
			</div>
		`

	wrapper.querySelector(".remove-tag-btn").onclick = () => {
		wrapper.remove();
	}

	container.appendChild(wrapper);
});
*/
document.getElementById("submit-outfit").addEventListener("click", function() {
	const catInput = document.querySelectorAll(".categoryInput");
	const valInput = document.querySelectorAll(".valueInput");
	const tagInput = document.querySelectorAll(".tagInput");
	const data = { tags: [] }; // init data dict with id and tag array

	// save category name and value into array
	for (let i=0;i<catInput.length;i++) {
		const key = catInput[i].value;
		const value = valInput[i].value;
		data[key] = value;
	}

	// save tags into array
	for (let i=0;i<tagInput.length;i++) {
		const tag = tagInput[i].value;
		data["tags"].push(tag);
	}

	console.log(data)

	fetch('/add_outfit', {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data, false, 4)
	})
		.then(res => res.json())
		.then(data => {
			console.log("Server response:", data);
		});
});

fetch('/get_pieces', {
	method: 'GET'
})
.then(response => response.json())
.then(data => {
	const tableBody = document.getElementById("pieces-table");

	tableBody.addEventListener("click", (event) => {
		const table_child = event.target.closest("dynamic-table");
		if (table_child) {
			table_child.classList.toggle("selected");
		}
	});
	for (let i=0;i<data.length;i++) {
		const piece = data[i];

		const row = document.createElement("tr");
		row.innerHTML = `
			<td draggable=true class="dynamic-table">${piece}</td>`
		tableBody.appendChild(row);
	}
})
