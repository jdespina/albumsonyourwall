const search = document.getElementById("searchInput");
const result = document.getElementById("search_results");

function getResult() {
	const urlParams = new URLSearchParams(window.location.href);
	//let access = localStorage.getItem("authToken");
	$.ajax({
		url: '/search',
		data: {
			'search_term': search.value,
		}
	}).done(function (data) {
		if (JSON.stringify(data) == "{}") {
			result.innerHTML = "No Result";
		}
		else {
			result.innerHTML = data.search_result;
		}
	});
}

search.addEventListener('input', () => {
	const urlParams = new URLSearchParams(window.location.href);
	//let access = localStorage.getItem("authToken");
	$.ajax({
		url: '/search',
		data: {
			'search_term': search.value,
		}
	}).done(function (data) {
		if (JSON.stringify(data) == "{}") {
			result.innerHTML = "No Result";
		}
		else {
			result.innerHTML = data.search_result;
		}
	});
});