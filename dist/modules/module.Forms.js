/**
 * Forms
 */
var Module = (function(){	
	/**
	 * globals
	 */
	var moduleKEY = "Forms", ready, forms, namespace, Say, TColumns, Render;

	/**
	 * call
	 */
	function call()
	{
		Render = Flink.View.render;
		Say = Flink.Locale.say;
		TColumns = Flink.View.templateColumns;
		namespace = Flink.settings.namespace;
		readForms();
		showNavigation();
	}
	
	/**
	 * events
	 * @param object|string event
	 * @param object element
	 */
	function on(event, element)
	{

	}

	/**
	 * show render of forms navigation as main content
	 * @param integer index
	 */
	function showNavigation(index)
	{
		Flink.Frame.setMain(navigation(forms));
		Flink.Frame.breadCrumb({
			summary: { text: Say('Summary'), call: 'Summary'}
			, forms: { text: Say(moduleKEY)}
		});		
	}

	/**
	 * show render of elements as main content
	 * @param integer index
	 */
	function showElements(index)
	{
		var form = forms[index]
		, name = form.getAttribute("name")||"document.forms["+index+"]";
		Flink.Frame.setMain ( elements ( form ) );
		Flink.Frame.breadCrumb({
			forms: {call: moduleKEY, text: Say(moduleKEY)}
			, name: {text: name}
		});
	}	

	/**
	 * readforms
	 */
	function readForms()
	{
		forms = [];
		for (var i=0,l=document.forms.length;i<l;i++) {
			if (document.forms[i].classList.contains(namespace)) {
				continue;
			}
			forms.push(document.forms[i]);
		}
	}

	/**
	 * compose navigation
	 * @param {array} collection of forms 
	 */
	function navigation(forms) 
	{
		if (forms.length===0) {
			return "<div class=\"alert\">" 
			+  Say ("not-found") + ": " + Say("forms")
			+ "</div>";
		}	
		var form;
		var columns = {
			"form-name" : {show: true,style: "wauto", 
				pattern:"<a href=\"#\" " 
				+ "onclick=\"Flink.Forms.showElements(%index%)\">%name%</a>"}
			, "form-method" : {show: true, pattern: "%method%"}
			, "form-action": {show: true, pattern: "%action%"}
			, "form-enctype": {show: true, pattern: "%enctype%"}
			, "form-selectors": {show: true, pattern: "%selectors%"}
			, "count-elements": {show: true,style: "wauto center",
				pattern: "<span class=\"count\">%count-elements%</span>"}
		};

		// init render
		var r = [];
		var template = TColumns(columns);
		r.push("<table class=\"forms-navigation\">");
		r.push(template.header);

		// render elements
		for (var i=0; i<forms.length; i++) {
			var form = forms[i];
			var object = {
				index: i
				, name: form.getAttribute("name") || "document.forms[" + i + "]"
				, method: form.getAttribute("method") || "get"
				, action: form.getAttribute("action") || "-"
				, selectors: selectors(form) || "-"
				, enctype: form.enctype || "-"
				, "count-elements": form.elements.length
			};		
			r.push(Render(object, template.row));
		}

		// end render
		r.push("</table>");

		// return
		return r.join("\n");		
	}

	/**
	 * compose elements form
	 * @param {object} form element.
	 */
	function elements(form) 
	{
		var columns = {
			"element-label" : {
				show:true, 
				pattern:"%label%"
			},
			"element-name" : {
				show:true,
				pattern: "%name%"
			},
			"element-type": {
				show:true,
				pattern: "%type%"
			}
			, "element-selectors": {
				show: true,
				pattern: "%selectors%"				
			}			
			, "element-value": {
				show: true,
				pattern: "<span class=\"value-%type%\">%value%</span>"
			}
		};

		// init render
		var r = [];
		var template = TColumns(columns);		
		r.push("<table class=\"form-elements\">");
		r.push(template.header);

		// render form elements
		for(var i=0; i<form.elements.length; i++) {
			var elm = form.elements[i];
			var object = {
				name: elm.name || "-" 
				, type: elm.type || "-" 
				, value: elm.value || "-" 
				, id: elm.id || "-"
				, label: "-"
				, selectors: selectors(elm) || "-"
			}
			var label = findLabel(elm);
			if (label) {
				object.label = label.innerText; 
			}
			r.push(Render(object, template.row));
		}

		// end render
		r.push("</table>");

		// return
		return r.join("\n");
	}

	/**
	 * find label of input element 
	 * @param object form element.
	 */
	function findLabel (element) 
	{		
		// search for "wrap" labels
		var label = "-";	
		if (element.closest) { // IE does not implements closest method :(
			label = element.closest("label");
		}	
		
		// if not found search for "for" labels	
		if (!label && element.id) {
			var selector = "label[for=\"" + element.id + "\"]";
			label = document.querySelector(selector);			
		}
		
		// try with placeholder
		/*if (!label && element.placeholder) {
			label = element.placeholder;
		}*/
		
		if (label===undefined) {
			label = "-";
		}
		
		return label;
	};

	/**
	 * get css selectors of object
	 * @return object object
	 */
	function selectors(object)
	{
		var css = "";
		if (object.id) {
			css += "#" + object.id+" ";
		}
		if (object.className) {
			css += "." + object.className.replace(/ /g," .");
		}
		if (!css) {
			css = "-";
		}
		return css;	
	}

	/**
	 * export
	 */
	return {
		key: moduleKEY
		, showElements: function(index) {return showElements(index);}
		, call: function() {call();}
		, on: function(event) {on(event);}
	}

})();
