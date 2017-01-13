/*
 * Links
 */
var Module = (function() {

	/*
	 * global module vars 
	 */
	var moduleKEY="Links", ready, Say, Render, TColumns, Prompt;

	/*
	 * call
	 */
	function call(method, args)
	{
		Say = Flink.Locale.say;
		Render = Flink.View.render;
		TColumns = Flink.View.templateColumns;
		Prompt = Flink.Frame.prompt;
		Flink.Frame.setMain(content());
		Flink.Frame.breadCrumb({
			summary: { text: Say('Summary'), call: 'Summary'}
			, links: {text: Say(moduleKEY)}
		});
	}

	/*
	 * events
	 */
	function on(event, element)
	{		

	}

	/*
	 * compose content
	 */
	function content() 
	{
		// read
		var selector = "a:not(."+Flink.settings.namespace+")";
		var links = document.querySelectorAll(selector);
		
		// no links
		if (links.length===0) {
			return "<div class=\"alert\">" 
			+  Say ("not-found") + ": " + Say("links")
			+ "</div>";
		}

		// config columns
		var columns = {
			"link-text" : {
				show: true,
				style: "",
				pattern: "%text%"
			}
			, "link-href" : {
				show: true,
				style: "",
				pattern: "<a class=\"%style%\" href=\"%href%\" target=\"%target%\">%href%</a>"				
			}
			, "link-target": {
				show: false,
				style: "",
				pattern: "%target%"
			}
			, "link-type": {
				show: true,
				style: "",
				pattern: "%type%"
			}
			, "link-selectors": {
				show: true,
				style: "",
				pattern: "%selectors%"
			}
		};

		// init render		
		var r = [];
		var template = TColumns(columns);
		r.push("<table class=\"links\">");
		r.push(template.header);

		// render elements
		for (var i=0; i<links.length; i++) {
			var link = links[i];
			var object = {
				text: link.text || "-"
				, href:  link.href || location.href
				, target: link.target || "_self"
				, type: link.type || "-"
				, style: Flink.settings.cssNamespace
			}
			object.selectors = "";
			if (link.id) {
				object.selectors += "#" + link.id+" ";
			}			
			if (link.className) {
				object.selectors += "." + link.className.replace(/ /g," .");
			}
			if (!object.selectors) {
				object.selectors = "-";
			}
			r.push(Render(object, template.row));
		}

		// end render
		r.push("</table>");

		// return
		return r.join("\n");
	}

	/*
	 * export
	 */
	return {
		key: moduleKEY
		, call: function() {call();}
		, on: function(event) {on(event);}
	}

})();
