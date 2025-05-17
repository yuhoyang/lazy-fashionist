function get_pieces() {

	fetch('/get_pieces', {
		method: 'GET'
	})
		.then(response => response.json())
		.then(data => {
			tableBody = document.getElementById("pieces-table");
			tableBody.innerHTML = "";

			for (piece_category in data) {
				for (piece in data[piece_category]) {
					const row = document.createElement("tr");

					row.innerHTML = `
						<td>${piece_category}</td>
						<td>${piece}</td>`;
					tableBody.appendChild(row);
				}
			}
		})
}
get_pieces()

function addInputContainer() {
	const container = document.getElementById("inputContainers");
	const wrapper = document.createElement("div");

	wrapper.classList.add("input-group");

	wrapper.innerHTML = `
		<div class='input-column'>
			<input class="categoryInput" type="text" placeholder="category (optional)"></input>
		</div>
		<div class='input-column'>
			<input class="valueInput" type="text" placeholder="clothing piece" required></input>
		</div>
		<div class='remove-column'>
			<button type="button" class="remove-btn" innerText="Remove">Remove</button>
		</div>
		`

	wrapper.querySelector(".remove-btn").onclick = () => {
		wrapper.remove();
	}

	container.appendChild(wrapper);
}

document.getElementById("submit-pieces").addEventListener("click", function() {
	const catInput = document.querySelectorAll(".categoryInput");
	const valInput = document.querySelectorAll(".valueInput");
	const error_container = document.getElementById("error-display");
	const data = { }; // init data dict with id and tag array

	error_container.innerHTML = ""; // remove children

	// save category name and value into array
	for (let i=0;i<catInput.length;i++) {
		let key = catInput[i].value;
		if (!key) {
			key = "no_category"
		}
		const value = valInput[i].value;

		// if category is already stated once in frontend, pack elements in the same category in a list
		if (data[key]) {
			// if dictionary entry hasn't been converted to an array yet, do so
			if (!Array.isArray(data[key])) {
				data[key] = [data[key]];
			}
			data[key].push(value);
			continue;
		}
		else {
			data[key] = value;
		}
	}

	console.log(data)

	fetch('/add_pieces', {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data, false, 4)
	})
		.then(res => res.json())
		.then(data => {
			console.log("Server response:", data);

			// if error key, display error
			if (data.error){

				error_msg = document.createElement("p");
				error_msg.style = "color: red; font-size: 1rem";
				error_msg.textContent = `Oops! These pieces already exist as input categories: ${data["error"].join(", ")}`;
				error_container.appendChild(error_msg);
			}

			get_pieces();
		});
});
