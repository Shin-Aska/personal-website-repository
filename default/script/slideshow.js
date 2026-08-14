(function () {
	"use strict";

	var albumNames = Object.keys(pictures);
	var chosenGallery = albumNames[0];
	var slideIndex = 0;
	var preloadCache = new Set();

	var albumContainer = document.getElementById("albums");
	var slideContainer = document.getElementById("slideContainer");
	var thumbnailContainer = document.getElementById("thumbnailContainer");
	var previousButton = document.getElementById("prevBtn");
	var nextButton = document.getElementById("nextBtn");

	function sortedFiles(album) {
		return pictures[album].files.slice().sort(function (a, b) {
			return a.path.localeCompare(b.path, undefined, { numeric: true, sensitivity: "base" });
		});
	}

	function preload(url) {
		if (!url || preloadCache.has(url)) return;
		preloadCache.add(url);
		var image = new Image();
		image.decoding = "async";
		image.src = url;
	}

	function preloadNeighbors(files, index) {
		if (files.length < 2) return;
		preload(files[(index + 1) % files.length].path);
		preload(files[(index - 1 + files.length) % files.length].path);
	}

	function renderAlbums() {
		albumContainer.replaceChildren();
		albumNames.forEach(function (album) {
			var button = document.createElement("button");
			button.type = "button";
			button.className = "albumEntry";
			button.textContent = album.charAt(0).toUpperCase() + album.slice(1).toLowerCase();
			button.dataset.album = album;
			button.addEventListener("click", function () {
				if (chosenGallery === album) return;
				chosenGallery = album;
				slideIndex = 0;
				renderGallery();
			});
			albumContainer.appendChild(button);
		});
	}

	function updateAlbumState() {
		albumContainer.querySelectorAll(".albumEntry").forEach(function (button) {
			var active = button.dataset.album === chosenGallery;
			button.classList.toggle("is-active", active);
			button.setAttribute("aria-pressed", active ? "true" : "false");
		});
	}

	function renderStage(files) {
		var picture = files[slideIndex];

		var figure = document.createElement("figure");
		figure.className = "gallery-stage";

		var count = document.createElement("figcaption");
		count.className = "numbertext";
		count.setAttribute("aria-live", "polite");
		count.textContent = (slideIndex + 1) + " / " + files.length;

		var link = document.createElement("a");
		link.href = picture.path;
		link.target = "_blank";
		link.rel = "noopener";
		link.setAttribute("aria-label", "Open " + picture.name + " at full size");

		var image = document.createElement("img");
		image.className = "imageSlide";
		image.src = picture.path;
		image.alt = picture.name.replace(/[-_]+/g, " ").replace(/\.[^.]+$/, "");
		image.width = picture.width;
		image.height = picture.height;
		image.decoding = "async";
		image.fetchPriority = "high";
		image.addEventListener("load", function () { image.classList.add("is-loaded"); });
		if (image.complete) image.classList.add("is-loaded");

		link.appendChild(image);
		figure.appendChild(link);
		figure.appendChild(count);
		slideContainer.replaceChildren(figure);
		preloadNeighbors(files, slideIndex);
	}

	function renderThumbnails(files) {
		thumbnailContainer.replaceChildren();
		files.forEach(function (file, index) {
			var button = document.createElement("button");
			button.type = "button";
			button.className = "thumbnailButton";
			button.dataset.index = index;
			button.setAttribute("aria-label", "Show image " + (index + 1) + " of " + files.length);
			button.setAttribute("aria-current", index === slideIndex ? "true" : "false");

			var thumbnail = document.createElement("img");
			thumbnail.className = "demo";
			thumbnail.src = file.thumbnail || file.path;
			thumbnail.alt = "";
			thumbnail.loading = index < 6 ? "eager" : "lazy";
			thumbnail.decoding = "async";

			button.appendChild(thumbnail);
			button.addEventListener("click", function () { showSlide(index); });
			thumbnailContainer.appendChild(button);
		});
	}

	function updateThumbnailState() {
		thumbnailContainer.querySelectorAll(".thumbnailButton").forEach(function (button) {
			button.setAttribute("aria-current", Number(button.dataset.index) === slideIndex ? "true" : "false");
		});
	}

	function renderGallery() {
		var files = sortedFiles(chosenGallery);
		updateAlbumState();
		renderStage(files);
		renderThumbnails(files);
	}

	function showSlide(index) {
		var files = sortedFiles(chosenGallery);
		slideIndex = (index + files.length) % files.length;
		renderStage(files);
		updateThumbnailState();

		var activeThumbnail = thumbnailContainer.querySelector('[aria-current="true"]');
		if (activeThumbnail) {
			var targetLeft = activeThumbnail.offsetLeft - (thumbnailContainer.clientWidth - activeThumbnail.clientWidth) / 2;
			thumbnailContainer.scrollTo({ left: targetLeft, behavior: "smooth" });
		}
	}

	previousButton.addEventListener("click", function () { showSlide(slideIndex - 1); });
	nextButton.addEventListener("click", function () { showSlide(slideIndex + 1); });

	document.querySelector(".pictureContainer").addEventListener("keydown", function (event) {
		if (event.key === "ArrowLeft") {
			event.preventDefault();
			showSlide(slideIndex - 1);
		} else if (event.key === "ArrowRight") {
			event.preventDefault();
			showSlide(slideIndex + 1);
		}
	});

	renderAlbums();
	renderGallery();
}());
