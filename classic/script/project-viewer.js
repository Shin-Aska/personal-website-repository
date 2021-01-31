function initProjectViewer() {
	var main = document.getElementById("projects");
	var children = main.children;
	for (var i = 0; i < children.length; i++) {
		if (children[i].getAttribute('id') == "empty") {
			continue;
		}
		children[i].style.display = "None";
		var activatorButton = document.getElementById(children[i].getAttribute("id") + "-button");
		activatorButton.onclick = function(element) {
			return function() {
				var main = document.getElementById("projects");
				var children = main.children;
				for (var i = 0; i < children.length; i++) {
					children[i].style.display = "None";
				}
				element.style.display = "Block";
				element.scrollIntoView();
				element.style.animation = "grow 1s";
			}
		}(children[i]);
	}
}