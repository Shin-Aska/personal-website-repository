(function () {
	"use strict";

	function normalize(value) {
		return value.toLocaleLowerCase().replace(/\s+/g, " ").trim();
	}

	function setExpanded(entry, expanded) {
		entry.button.setAttribute("aria-expanded", String(expanded));
		entry.row.classList.toggle("is-expanded", expanded);
		entry.detailRow.hidden = !expanded;
	}

	function initGameTable() {
		var table = document.getElementById("games-list");
		var search = document.getElementById("game-search");
		var count = document.getElementById("game-count");

		if (!table || !table.tBodies.length || !search || !count) {
			return;
		}

		var sourceRows = Array.prototype.slice.call(table.tBodies[0].rows);
		var entries = [];

		sourceRows.forEach(function (row, index) {
			var cells = row.cells;

			if (cells.length < 4) {
				return;
			}

			var gameName = cells[0].textContent.trim();
			var genre = cells[1].textContent.trim();
			var descriptionCell = cells[3];
			var descriptionText = descriptionCell.textContent;
			var detailId = "game-detail-" + index;
			var detailRow = document.createElement("tr");
			var detailCell = document.createElement("td");
			var detailContent = document.createElement("div");
			var button = document.createElement("button");
			var buttonLabel = document.createElement("span");

			row.classList.add("game-row");
			detailRow.className = "game-detail-row";
			detailRow.hidden = true;
			detailCell.className = "game-detail-cell";
			detailCell.colSpan = 3;
			detailContent.className = "game-detail-content";
			detailContent.id = detailId;

			while (descriptionCell.firstChild) {
				detailContent.appendChild(descriptionCell.firstChild);
			}

			detailContent.querySelectorAll("img").forEach(function (image) {
				image.loading = "lazy";
				image.decoding = "async";
				if (!image.alt) {
					image.alt = gameName + " gameplay preview";
				}
			});

			detailContent.querySelectorAll('a[target="_blank"]').forEach(function (link) {
				link.rel = "noopener noreferrer";
			});

			detailCell.appendChild(detailContent);
			detailRow.appendChild(detailCell);
			row.parentNode.insertBefore(detailRow, row.nextSibling);
			descriptionCell.hidden = true;

			button.className = "game-toggle";
			button.type = "button";
			button.setAttribute("aria-expanded", "false");
			button.setAttribute("aria-controls", detailId);
			button.setAttribute("aria-label", "Show details for " + gameName);
			buttonLabel.className = "game-toggle-label";
			buttonLabel.textContent = gameName;
			button.appendChild(buttonLabel);
			cells[0].textContent = "";
			cells[0].appendChild(button);

			var gameLink = cells[2].querySelector("a");
			if (gameLink) {
				gameLink.classList.add("game-visit-link");
				gameLink.textContent = "Visit game";
				gameLink.setAttribute("aria-label", "Visit " + gameName);
			}

			var entry = {
				button: button,
				detailRow: detailRow,
				row: row,
				searchText: normalize(gameName + " " + genre + " " + descriptionText)
			};

			button.addEventListener("click", function () {
				var shouldExpand = button.getAttribute("aria-expanded") !== "true";

				entries.forEach(function (otherEntry) {
					if (otherEntry !== entry) {
						setExpanded(otherEntry, false);
					}
				});

				setExpanded(entry, shouldExpand);
				button.setAttribute("aria-label", (shouldExpand ? "Hide" : "Show") + " details for " + gameName);
			});

			button.addEventListener("keydown", function (event) {
				if (event.key === "Escape" && button.getAttribute("aria-expanded") === "true") {
					setExpanded(entry, false);
					button.setAttribute("aria-label", "Show details for " + gameName);
				}
			});

			entries.push(entry);
		});

		var emptyRow = document.createElement("tr");
		var emptyCell = document.createElement("td");
		emptyRow.className = "game-empty-row";
		emptyRow.hidden = true;
		emptyCell.colSpan = 3;
		emptyCell.textContent = "No games match that search.";
		emptyRow.appendChild(emptyCell);
		table.tBodies[0].appendChild(emptyRow);

		function filterGames() {
			var query = normalize(search.value);
			var visibleCount = 0;

			entries.forEach(function (entry) {
				var matches = !query || entry.searchText.indexOf(query) !== -1;
				entry.row.hidden = !matches;
				if (!matches) {
					setExpanded(entry, false);
				}
				entry.detailRow.hidden = !matches || entry.button.getAttribute("aria-expanded") !== "true";
				visibleCount += matches ? 1 : 0;
			});

			emptyRow.hidden = visibleCount !== 0;
			count.textContent = visibleCount + (visibleCount === 1 ? " game" : " games");
		}

		search.addEventListener("input", filterGames);
		search.addEventListener("keydown", function (event) {
			if (event.key === "Escape" && search.value) {
				search.value = "";
				filterGames();
			}
		});

		table.closest(".game-index").classList.add("is-enhanced");
		filterGames();
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", initGameTable);
	} else {
		initGameTable();
	}
}());
