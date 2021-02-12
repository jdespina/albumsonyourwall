let pho = document.getElementById('photo');
var bC = document.getElementById("backColor");
var trackC = document.getElementById('trackColor');
var titleC = document.getElementById('titleColor');
var dateC = document.getElementById('dateColor');
var artistC = document.getElementById('artistColor');
var borderC = document.getElementById('borderColor');
bC.addEventListener("input", viewBackColor, false);
trackC.addEventListener("input", viewTrackColor, false);
titleC.addEventListener("input", viewTitleColor, false);
dateC.addEventListener("input", viewDateColor, false);
artistC.addEventListener("input", viewArtistColor, false);
borderC.addEventListener("input", viewBorderColor, false);
function viewTrackColor(e) {
	let tracks = document.getElementById('trackList').getElementsByTagName('p');
	for (let i = 0; i < tracks.length; i++) {
		tracks[i].style.color = event.target.value;;
	}
	//document.getElementById("trackList").style.color = event.target.value;
}
function viewTitleColor(e) {
	document.getElementById("title").style.color = event.target.value;
}
function viewDateColor(e) {
	document.getElementById("date").style.color = event.target.value;
}
function viewArtistColor(e) {
	document.getElementById("artists").style.color = event.target.value;
}
function viewBackColor(e) {
	pho.style.backgroundColor = event.target.value;
}
function viewBorderColor(e) {
	pho.style.borderColor = event.target.value;
}