console.log(pictures);
var chosenGallery = Object.keys(pictures)[0];

var albumContainer = document.getElementById("albums");
albumContainer.innerHTML = "";
var albums = Object.keys(pictures);
for (var i = 0; i < albums.length; i++) {
	var album = albums[i];
	var html = '<h3 class="albumEntry" id=\'ALBUMENTRY@' + album.trim() + '\'>' + album[0].toUpperCase() + album.slice(1).toLowerCase() + '</h3>';
	console.log(html)
	albumContainer.innerHTML += html;
}

for (var i = 0; i < albums.length; i++) {
	var album = albums[i];
	document.getElementById("ALBUMENTRY@" + album.trim()).onclick = function(elem) {
		var alb = elem.target.id.split("@")[1];
		chooseAlbum(alb);
	}
}

function chooseAlbum(album) {
	chosenGallery = album;
	render();
	slideIndex = 1;
	showSlides(slideIndex);
}

function render() {
	var thumbnailContainer = document.getElementById("thumbnailContainer");
	var slideContainer = document.getElementById("slideContainer");

	slideContainer.innerHTML = "";
	thumbnailContainer.innerHTML = "";
	for (var i = 0; i < pictures[chosenGallery].files.length; i++) {
		var picture = pictures[chosenGallery].files[i];
		var slide = 
		'<div class="mySlides">' +
		'	<div class="numbertext">' + (i+1) + ' / ' + pictures[chosenGallery].files.length + '</div>' +
		'   <a href="' + pictures[chosenGallery].files[i].path + '" target="_blank">' +
		'	  <img src="' + pictures[chosenGallery].files[i].path + '" class="imageSlide">' +
		'   </a>' +
		'</div>';

		var thumbnail = 
		'<div class="column" ><img class="demo cursor" src="' + pictures[chosenGallery].files[i].path + '" id="slideImage_' + (i+1) + '""></div>';

		slideContainer.innerHTML += slide;
		thumbnailContainer.innerHTML += thumbnail;
	}

	for (var i = 0; i < pictures[chosenGallery].files.length; i++) {
		document.getElementById("slideImage_" + (i+1)).onclick = function(elem) {
			var chosenId = elem.target.id.split("_")[1];
			currentSlide(parseInt(chosenId));
		}
	}
}

render();
var slideIndex = 1;
showSlides(slideIndex);

// Next/previous controls
function plusSlides(n) {
	showSlides(slideIndex += n);
}

// Thumbnail image controls
function currentSlide(n) {
	showSlides(slideIndex = n);
}

function showSlides(n) {
	var i;
	var slides = document.getElementsByClassName("mySlides");
	var dots = document.getElementsByClassName("demo");
	//var captionText = document.getElementById("caption");
	if (n > slides.length) { slideIndex = 1 }
	if (n < 1) { slideIndex = slides.length }
	for (i = 0; i < slides.length; i++) {
		slides[i].style.display = "none";
	}
	for (i = 0; i < dots.length; i++) {
		dots[i].className = dots[i].className.replace(" active", "");
	}
	slides[slideIndex - 1].style.display = "block";
	dots[slideIndex - 1].className += " active";
	dots[slideIndex - 1].scrollIntoView({behavior: "smooth", block: "nearest", inline: "nearest"});
	//captionText.innerHTML = dots[slideIndex - 1].alt;
}

document.getElementById("nextBtn").onclick = function() {
	plusSlides(1);
}

document.getElementById("prevBtn").onclick = function() {
	plusSlides(-1);
}