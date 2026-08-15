(function () {
  "use strict";

  function parseColumnIndexes(value, columnCount) {
    return (value || "").split(",").map(function (item) {
      return Number.parseInt(item, 10);
    }).filter(function (index, position, indexes) {
      return Number.isInteger(index) && index >= 0 && index < columnCount &&
        indexes.indexOf(index) === position;
    });
  }

  function setExpanded(button, detailRow, expanded) {
    button.setAttribute("aria-expanded", String(expanded));
    button.setAttribute("aria-label", (expanded ? "Hide details for " : "Show details for ") + button.dataset.rowLabel);
    detailRow.hidden = !expanded;
  }

  document.querySelectorAll(".article-table[data-expand-columns]").forEach(function (table, tableIndex) {
    var headerCells = Array.from(table.querySelectorAll("thead tr:last-child th"));
    var sourceRows = Array.from(table.querySelectorAll("tbody > tr"));
    var expandableColumns = parseColumnIndexes(table.dataset.expandColumns, headerCells.length);
    var toggleColumn = Number.parseInt(table.dataset.toggleColumn || "0", 10);

    if (!headerCells.length || !sourceRows.length || !expandableColumns.length) { return; }
    if (!Number.isInteger(toggleColumn) || expandableColumns.indexOf(toggleColumn) !== -1) {
      toggleColumn = headerCells.findIndex(function (_, index) { return expandableColumns.indexOf(index) === -1; });
    }
    if (toggleColumn < 0) { return; }

    expandableColumns.forEach(function (index) { headerCells[index].hidden = true; });

    sourceRows.forEach(function (sourceRow, rowIndex) {
      var cells = Array.from(sourceRow.children);
      var toggleCell = cells[toggleColumn];
      if (!toggleCell || expandableColumns.some(function (index) { return !cells[index]; })) { return; }

      var rowLabel = toggleCell.textContent.trim() || "this row";
      var detailId = "article-table-details-" + tableIndex + "-" + rowIndex;
      var button = document.createElement("button");
      var label = document.createElement("span");
      var detailRow = document.createElement("tr");
      var detailCell = document.createElement("td");
      var detailContent = document.createElement("div");

      button.type = "button";
      button.className = "article-table-toggle";
      button.dataset.rowLabel = rowLabel;
      button.setAttribute("aria-controls", detailId);
      button.setAttribute("aria-expanded", "false");
      button.setAttribute("aria-label", "Show details for " + rowLabel);
      label.className = "article-table-toggle-label";
      while (toggleCell.firstChild) { label.appendChild(toggleCell.firstChild); }
      button.appendChild(label);
      toggleCell.appendChild(button);

      detailRow.className = "article-table-detail-row";
      detailRow.hidden = true;
      detailCell.className = "article-table-detail-cell";
      detailCell.colSpan = headerCells.length - expandableColumns.length;
      detailContent.className = "article-table-detail-content";
      detailContent.id = detailId;

      expandableColumns.forEach(function (columnIndex) {
        var sourceCell = cells[columnIndex];
        var section = document.createElement("section");
        var heading = document.createElement("h3");
        var body = document.createElement("div");
        section.className = "article-table-detail-section";
        heading.className = "article-table-detail-label";
        heading.textContent = headerCells[columnIndex].textContent.trim();
        body.className = "article-table-detail-body";
        while (sourceCell.firstChild) { body.appendChild(sourceCell.firstChild); }
        if (body.querySelector("img")) { section.classList.add("has-media"); }
        section.appendChild(heading);
        section.appendChild(body);
        detailContent.appendChild(section);
        sourceCell.hidden = true;
      });

      detailCell.appendChild(detailContent);
      detailRow.appendChild(detailCell);
      sourceRow.insertAdjacentElement("afterend", detailRow);

      button.addEventListener("click", function () {
        var shouldExpand = button.getAttribute("aria-expanded") !== "true";
        table.querySelectorAll(".article-table-toggle[aria-expanded='true']").forEach(function (openButton) {
          if (openButton !== button) {
            var openContent = document.getElementById(openButton.getAttribute("aria-controls"));
            setExpanded(openButton, openContent.closest("tr"), false);
          }
        });
        setExpanded(button, detailRow, shouldExpand);
      });
      button.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && button.getAttribute("aria-expanded") === "true") {
          setExpanded(button, detailRow, false);
        }
      });
    });

    table.closest(".article-table-wrap").classList.add("is-enhanced");
  });
}());
