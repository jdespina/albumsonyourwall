sizeTitle();
sizeTracks()

function sizeTitle() {
	var el = document.getElementById('title');
	//var textHeight = window.getComputedStyle(el, null).getPropertyValue('font-size');
	let textHeight = 1;
	let character = el.innerHTML;

	while (!($('#title').height() > 113)) {
		textHeight = textHeight + .1;
		let newSize = textHeight.toString() + "em"
		document.getElementById('title').style.fontSize = newSize;

	}
	if ($('#title').height() > 120) {
		textHeight = textHeight - .1;
		let newSize = textHeight.toString() + "em"
		document.getElementById('title').style.fontSize = newSize;

	}
	let chart = character.split(' ');
	let s = "";
	for (let i = 0; i < chart.length; i++) {
		if (chart[i] == "") {
			chart.splice(i, 1);
		}
	}
	if (chart.length == 1) {
		document.getElementById('title').style.textAlign = null
		let count = 0
		while (($('#title').width() > 310)) {
			textHeight = textHeight - .1;
			let newSize = textHeight.toString() + "em";
			document.getElementById('title').style.fontSize = newSize;
			if (count == 100) { break; } count++;
		}
	}
	var textSize = window.getComputedStyle(el, null).getPropertyValue('font-size');
}
function sizeTracks() {
	let textHeight = 1;

	if ($('#trackList').height() > 450) {
		let count = 0;
		while ($('#trackList').height() > 450) {
			if (count == 100) {
				break;
			}
			textHeight = textHeight - .1;
			let newSize = textHeight.toString() + "em";

			let tracks = document.getElementById('trackList').getElementsByTagName('p');
			for (let i = 0; i < tracks.length; i++) {
				tracks[i].style.fontSize = newSize;
			}
			count++;
		}
	}
}
// Define the function  
// to save the div 
function takeshot() {
	let titleFix = document.getElementById('title');
	titleFix.innerHTML += "";
	let node = document.getElementById('photo');
	let scale = 4;
	//domtoimage.toBlob(div).then(function (blob) {
	//	window.saveAs(blob, 'poster.png');
	//});
	domtoimage
		.toPng(node, {
			height: node.offsetHeight * scale,
			width: node.offsetWidth * scale,
			style: {
				transform: "scale(" + scale + ")",
				transformOrigin: "top left",
				width: node.offsetWidth + "px",
				height: node.offsetHeight + "px"
			}
		})
		.then(dataUrl => {
			window.saveAs(dataUrl, 'poster.png');
		})
		.catch(error => {
			this.shot_loading = false;
			console.error("oops, something went wrong!", error);
		});
}
