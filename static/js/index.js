document.getElementById("submit-city").addEventListener("click", function() {
	const city = document.getElementById("city-input").value;

	fetch(`/weather?city=${city}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		},
	})
		.then(response => response.json())
		.then(data => { // data = json
			const tableBody = document.getElementById("weather-table");

			// display values in a table
			for (let i=0;i<data.time.length;i++) {
				const time = data.time[i];
				const temp = data.temperature[i];
				const windspeed = data.windspeed[i];

				const tempColor = temp > 25 || temp < 5 ? "color: #B22222" : "";
				const windspeedColor = windspeed > 15 ? "color: #B22222" : "";
				const row = document.createElement("tr");

				row.innerHTML = `
					<td>${time}</td>
					<td style="${tempColor}">${temp}</td>
					<td style="${windspeedColor}">${windspeed}</td>`;
				tableBody.appendChild(row);
			}
		});
});
