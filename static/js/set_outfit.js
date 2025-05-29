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
						<td class="categoryInput">${pieceCategory}</td>
						<td class="valueInput">${piece}</td>`;
					piecesTable.appendChild(row);

					row.addEventListener("click", () => {
						row.classList.toggle("selected");

						if (row.classList.contains('selected')) {
							outfitTable = document.querySelector(".outfit-table");
							outfitTable.appendChild(row);
							tableBody.scrolltop = tableBody.scrollheight
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

	wrapper.classList.add("input-group");

	wrapper.innerHTML = `
		<div class='column input-column'>
			<input class="tagInput" type="text" placeholder="tag" required></input>
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

document.getElementById("submit-outfit").addEventListener("click", function() {
	const outfitTable = document.querySelector(".outfit-table");
	const inputContainer = document.getElementById("inputContainers");
	const catInput = outfitTable.querySelectorAll(".categoryInput");
	const valInput = outfitTable.querySelectorAll(".valueInput");
	const tagInput = inputContainer.querySelectorAll(".tagInput");
	const data = { __tags__: [] }; // init data dict with id and tag array

	// save category name and value into array
	for (let i=0;i<catInput.length;i++) {
		const key = catInput[i].textContent.trim();
		const value = valInput[i].textContent.trim();
		data[key] = value;
		console.log(value);
	}

	// save tags into array
	for (let i=0;i<tagInput.length;i++) {
		const tag = tagInput[i].value;
		data["__tags__"].push(tag);
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
