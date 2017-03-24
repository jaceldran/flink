/**
 * Menu
 */
var Module = (function(){

	/**
	 * global module vars
	 */
	var moduleKEY = "Menu", config, container, elements;

	/**
	 * call
	 * @param string method
	 * @param array args
	 */
	function call(method, args)
	{		
		if(!container) {
			build();
		}
		on("click");
	}

	/**
	 * refresh
	 */
	function refresh()
	{
		if (container) {
			container.parentNode.removeChild(container);
		}
		build();
		toggle("hidden");
	}

	/**
	 * build
	 */	
	function build()
	{		
		config = Flink.settings.menu;	
		container = document.createElement("nav");
		elements = document.createElement("div");
		var Say = Flink.Locale.say;

		// container style
		style = ["menu"];
		if (config.style) {
			style.push(config.style);
		}		
		container.className = style.join(" ");

		// elements style
		elements.className = "elements";

		// create elements
		for(var key in config.elements) {
			style = [Flink.settings.namespace];
			obj = config.elements[key];
			if (!obj.type) {obj.type = "a";}
			elm = document.createElement(obj.type);				
			elm.innerHTML = Say(obj.text);
			if (obj.style) {style.push(obj.style);}	
			if (obj.call) {
				style.push("call");
				elm.setAttribute("data-call", obj.call );
				elm.setAttribute("data-invoker", "Menu");
				//elm.addEventListener("click", function(event){
				//	on("click", this);
				//});
			}
			elm.className = style.join(" ");
			elements.appendChild(elm);
		}
		container.appendChild(elements);
		Flink.Frame.node("modale").appendChild(container);

		// refresh listeners for call actions
		Flink.listenClicks();

		// hide when click on main
		Flink.Frame.node("main").addEventListener("click", function(evt){
			toggle("hidden");
		})
	}

	/**
	 * toggle visibility
	 * @param string visibility Ensure visibilite to this value.
	 */
	function toggle(visibility)
	{
		var current = container.style.visibility;
		if (!visibility) {
			visibility = (current==="visible") ? "hidden" : "visible";
		}
		container.style.visibility = visibility;
	}

	/**
	 * addElement
	 * @param object element
	 */
	function addElement(element)
	{	
		Flink.settings.menu.elements[element.key] = element;
		refresh();
	}

	/**
	 * events
	 * @param string event
	 * @param object element
	 */
	function on(event, element)
	{
		if (event==="click") {			
			if (element && element.hasAttribute("data-invoker")) {
				toggle("hidden"); // if click on any option, hide panel
			} else {				
				toggle(); // if click on menu icon, toggle visibility
			}			
		}
	}

	/**
	 * export
	 */
	return {
		key: moduleKEY
		, call: function(method, args) {call(method, args);}
		, on: function(event, element) {on(event, element);}
		, addElement: function(element) {addElement(element);}
	}

})();

