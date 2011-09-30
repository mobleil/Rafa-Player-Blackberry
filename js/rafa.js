var globalConfig = new Array();

// ------------------------------ LANGUAGE -------------------------------------
function base32_decode(content) {
	base32 = new Nibbler({
		dataBits: 8,
		codeBits: 5,
		keyString: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567',
		pad: '='
	});
	
	var retval = base32.decode(content.toUpperCase());
	return retval;
}

function isRAFAModule(name) {
	var retval = false;
	
	if (name == "advertise")
		retval = true;
	else if (name == "help")
		retval = true;
	else if (name == globalConfig['authapp'])
		retval = true;
	else if (name == "catalog")
		retval = true;
		
	return retval;
}

function RAFA2Rule(rulexml) {
	//required
	this.type = null;
	
	this.type = rulexml.getAttribute("name");
	if (this.type == "list") {
		//required
		this.method;
		this.elements = new Array();
		
		//optional
		this.title;
		this.help;
		
		var properties = new Array("method", "title", "help");
		var tmpElement = null;
		for (var i=0; i<properties.length; i++)
		{
			tmpElement = rulexml.getElementsByTagName(properties[i])[0];
			if (tmpElement!= null)
				eval("this."+properties[i]+"=tmpElement.childNodes[0].nodeValue");
		}

		tmpElement = rulexml.getElementsByTagName("elements")[0];
		var itemElements = tmpElement.getElementsByTagName("item");

		for (var i=0; i<itemElements.length; i++)
		{
			Element = new RAFA2ListItem(itemElements[i]);
			this.elements.push(Element);
		}
		
	} else if (this.type == "form") {
		//required
		this.name;
		this.method;
		this.elements = new Array();
		
		//optional
		this.title;
		this.help;
		
		var properties = new Array("name","method", "title", "help");
		var tmpElement = null;
		for (var i=0; i<properties.length; i++)
		{
			tmpElement = rulexml.getElementsByTagName(properties[i])[0];
			if (tmpElement!= null)
				eval("this."+properties[i]+"=tmpElement.childNodes[0].nodeValue");
		}
		tmpElement = rulexml.getElementsByTagName("elements")[0];
		for (var i=0; i<tmpElement.childNodes.length; i++) {
			node_type = tmpElement.childNodes[i].nodeType;
			if (node_type == 1) {
				node_name = tmpElement.childNodes[i].nodeName;
				if (node_name == "item") {
					Element = new RAFA2ListItem(tmpElement.childNodes[i]);
				} else if (node_name == "itext") {
					Element = new RAFA2iText(tmpElement.childNodes[i]);
				} else if (node_name == "icheck") {
					Element = new RAFA2iCheck(tmpElement.childNodes[i]);
				} else if (node_name == "ichoice") {
					Element = new RAFA2iChoice(tmpElement.childNodes[i]);
				}
				this.elements.push(Element);
			}
		}
	} else if (this.type == "alert") {
		//required
		this.method;
		this.text;
		this.value;
		
		//optional
		this.uuid;
		
		var tmpElement = null;
		tmpElement = rulexml.getElementsByTagName("method")[0];
		if (tmpElement!= null)
			this.method = tmpElement.childNodes[0].nodeValue;
		this.uuid = tmpElement.getAttribute("uuid");
		
		tmpElement = rulexml.getElementsByTagName("text")[0];
		if (tmpElement!= null)
			this.text = tmpElement.childNodes[0].nodeValue;
		this.value = tmpElement.getAttribute("value");
	} else if (this.type == "redirect") {
		//required
		this.method;
		
		//optional
		this.uuid;
		
		var tmpElement = null;
		tmpElement = rulexml.getElementsByTagName("method")[0];
		if (tmpElement!= null)
			this.method = tmpElement.childNodes[0].nodeValue;
		this.uuid = tmpElement.getAttribute("uuid");
	}
}

function RAFA2iChoiceItem(element) {
	//required
	this.value = null;
	this.label = null;
	
	//optional
	this.type = null;

	this.value = element.getAttribute("value");
	this.type = element.getAttribute("type");
	this.label = element.childNodes[0].nodeValue;
}

function RAFA2iChoice(element) {
	//required
	this.name = null;
	this.label = null;
	this.object = "ichoice";
	this.elements = new Array();
	
	this.name = element.getAttribute("name");
	this.label = element.getAttribute("label");
	
	var itemElements = element.getElementsByTagName("item");
	for (var i=0; i<itemElements.length; i++)
	{
		Element = new RAFA2iChoiceItem(itemElements[i]);
		this.elements.push(Element);
	}
}

function RAFA2iCheck(element) {
	//required
	this.name = null;
	this.label = null;
	this.object = "icheck";
	
	//optional
	this.value = null;
	
	this.name = element.getAttribute("name");
	this.value = element.getAttribute("value");
	this.label = element.childNodes[0].nodeValue;
}

function RAFA2iText(element) {
	//required
	this.name = null;
	this.label = null;
	this.object = "itext";
	
	//optional
	this.value = null;
	this.type = null;
	
	var properties = new Array("name", "value", "type");
	var tmpAttribute = null;
	for (var i=0; i<properties.length; i++)
	{
		tmpAttribute = element.getAttribute(properties[i]);
		if (tmpAttribute!= null)
			eval("this."+properties[i]+"=tmpAttribute");
	}
	this.label = element.childNodes[0].nodeValue;
}

function RAFA2ListItem(element) {
	//required
	this.name= null;
	this.object = "item";
	
	//optional
	this.value = null;
	this.type = null;
	this.desc = null;
	this.snip = null;
	this.img = null;
	
	var tmpAttribute = null;
	tmpAttribute = element.getAttribute("type");
	if (tmpAttribute != null) {
		this.type = tmpAttribute;
	}
	tmpAttribute = element.getAttribute("value");
	if (tmpAttribute != null) {
		this.value = tmpAttribute;
	}

	var properties = new Array("name", "snip", "desc", "img");
	var tmpElement = null;
	for (var i=0; i<properties.length; i++)
	{
		tmpElement = element.getElementsByTagName(properties[i])[0];
		if (tmpElement!= null) {
			if (properties[i] == "img") {
				this.img = base32_decode(tmpElement.childNodes[0].nodeValue);
			} else {
				eval("this."+properties[i]+"=tmpElement.childNodes[0].nodeValue");
			}
		}
	}
}

function RAFA2Channel(rafaxml) {
	//required
	this.uuid = null;
	//optional
	this.clear = null;

	//array of RAFA2Rule objects
	this.rules = new Array();

	var headElement = rafaxml.getElementsByTagName("head")[0];
	var ruleElements = rafaxml.getElementsByTagName("rule");

	//read header
	var properties = new Array("uuid", "clear");
	var tmpElement = null;
	for (var i=0; i<properties.length; i++)
	{
		tmpElement = headElement.getElementsByTagName(properties[i])[0];
		if (tmpElement!= null)
			eval("this."+properties[i]+"=tmpElement.childNodes[0].nodeValue");
	}
	
	for (var i=0; i<ruleElements.length; i++)
	{
		Rule = new RAFA2Rule(ruleElements[i]);
		this.rules.push(Rule);
		//chanElement.removeChild(itemElements[i]);
	}
}

// ------------------------------ NETWORK -------------------------------------
function getRAFA(url) {
	var uri = globalConfig['site'] + url;
	// Build ajax object to retrieve page
	xhr = new XMLHttpRequest();

	try {
		//prepare the xmlhttprequest object
		xhr.open("GET", uri);
		xhr.setRequestHeader("Content-Type", "text/xml; charset=utf-8");
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4)
			{
				if (xhr.status == 200)
				{
					if (xhr.responseText != null)
					{
						processRAFA(xhr.responseXML);
					}
					else
					{
						alert("Cannot connect to server");
						hidePreload();
						return false;
					}
				}
				else {
					alert("Cannot connect to server");
					hidePreload();
				}
			}
		}
		//send the request
		xhr.send(null);
	} catch(e) {
		alert("Cannot connect to server");
		hidePreload();
		throw e;
	}	
}

function postRAFA(url, postdata) {
	var uri = globalConfig['site'] + url;
	// Build ajax object to retrieve page
	xhr = new XMLHttpRequest();

	try {
		//prepare the xmlhttprequest object
		xhr.open("POST", uri);
		xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		xhr.setRequestHeader("Content-length", postdata.length);
		xhr.setRequestHeader("Connection", "close");
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4)
			{
				if (xhr.status == 200)
				{
					if (xhr.responseText != null)
					{
						processRAFA(xhr.responseXML);
					}
					else
					{
						alert("Cannot connect to server");
						hidePreload();
						return false;
					}
				}
				else {
					alert("Cannot connect to server");
					hidePreload();
				}
			}
		}
		//send the request
		xhr.send(postdata);
	} catch(e) {
		alert("Cannot connect to server");
		hidePreload();
		throw e;
	}
}

function runRAFA(url) {
	// Save active url
	globalConfig['url'] = url;

	showPreload();
	// Check if user already logged
	if (globalConfig['auth'] == "online") {
		postRAFA(url, "u="+globalConfig['user']);
	} else if (globalConfig['auth'] == "login") {
		getRAFA(url);
	} else {
		getRAFA(globalConfig['authapp']);
	}
}

// ------------------------------ AUTH -------------------------------------
function processRAFA(rafaxml) {
	if (rafaxml == null) {
		alert("Rafa language incorrect");
		hidePreload();
		return -1;
	} else {
		var RAFA = new RAFA2Channel(rafaxml);	
		if (RAFA == null) {
			alert("Rafa language incorrect");
			hidePreload();
			return -1;
		}

		// Save old app only if not module
		if (!isRAFAModule(globalConfig['app']))
			globalConfig['oldapp'] = globalConfig['app'];
		globalConfig['app'] = RAFA.uuid;
		showRAFA(RAFA);

		// Check if on authentication
		// (USER)(logout) -> try login (login)
		// (USER)(login) -> login failed (logout)
		// (NOT USER)(login) -> login successfully (online)
		if (globalConfig['app'] == globalConfig['authapp']) {
			if (globalConfig['auth'] == "logout") {
				globalConfig['auth'] = "login";
			} else if (globalConfig['auth'] == "login") {
				globalConfig['auth'] = "logout";
			}
		} else if (globalConfig['auth'] == "login") {
			member();
		} else if (globalConfig['auth'] == "logout") {
			logout();
		}
		
		var oldRafa = globalConfig['rafa'];
		globalConfig['rafa'] = RAFA;
		cache_save(oldRafa);		
	}
	hidePreload();
}

// Only called once, first time after login successfull
function member() {
	globalConfig['auth'] = "online";
	menuMember();
	db_save_profile(globalConfig['user'], globalConfig['pwd']);
}

function logout() {
	globalConfig['auth'] = "logout";
	globalConfig['oldapp'] = null;
	globalConfig['cache'].length = 0;
	globalConfig['user'] = null;
	
	menuStart();
}

// ------------------------------ SHOW UI -------------------------------------
function showRule(rule, title, help, id) {
	var res;
	if (screen.width <= 320)
		res = "low";
	else if (screen.width <=360)
		res = "med";
	else
		res = "high";
	var retval = "<h2 id=\"banner"+res+"\"></h2>";
	retval += "<div class=\"main-panel\">";
	if (title != null)
		retval += "<div class=\"panel-title\"><p align=\"left\">"+title+"</p></div>";
	retval += "<div class=\"panel-top-left\"></div><div class=\"panel-top-right\"></div><div class=\"panel-inside\"><div class=\"panel-nogap\" id=\""+id+"\">";
	retval += rule+"</div></div><div class=\"panel-bottom-left\"></div><div class=\"panel-bottom-right\"></div>";
	if (help != null)
		retval += "<div class=\"panel-help\"><p align=\"center\">"+help+"</p></div>";
	retval += "</div>";
	return retval;
}

function showList(listitem, method) {
	var isadv = "arrowList";
	var img_content = "";
	
	// Advertising
	if (listitem.type != null) {
		method = "adv";
		isadv = "arrowListAds";
	}
	var retval = "<div class=\""+isadv+"\" x-blackberry-focusable=\"true\" ";
	if (listitem.value != null) {
		retval += "onclick=\"actionRAFAList('"+method+"','"+listitem.value+"');\" ";
	}
	retval += "><span class=\"arrowListText\"><div class=\"name\">";

	if (listitem.img != null)
		retval += "<img class=\"gbr\" src='"+listitem.img+"'/>";

	retval += listitem.name+"</div>";
	if (listitem.value != null) {
		if (listitem.snip != null) {
			retval += "<div class=\"snipset\">"+listitem.snip+" <img class=\"arrow\" src=\"images/arrow.png\"/></div>";
		} else {
			retval += "<div class=\"snipset\"><img class=\"arrow\" src=\"images/arrow.png\"/></div>";
		}
	}
/*
	if (listitem.img != null)
		img_content = listitem.img;
*/
	if (listitem.desc != null)
		retval += "<div class=\"clear\"></div><div class=\"desc\">"+img_content+listitem.desc+"</div>";
	retval += "</span>";
	retval += "<div class=\"clear\"></div></div>";
	return retval;
}

function showiText(formitem) {
	var retval = "<div><div class=\"label\">"+formitem.label+":</div><input name=\"itext\" id=\""+formitem.name+"\" ";
	if (formitem.type == "pwd")
		retval += "type=\"password\" ";
	else
		retval += "type=\"text\" ";
	if (formitem.value != null)
		retval += "value=\""+formitem.value+"\" ";
	retval += "/><div class=\"clear\"></div></div>";
	return retval;
}

function showiCheck(formitem) {
	var yesno = null;
	var retval = "<div><div class=\"label\" style=\"margin-top:10px;\">"+formitem.label+":</div>";
	if (formitem.value == 1)
		yesno = "yes.png";
	else
		yesno = "no.png";
	retval += "<img class=\"rightAlign\" name=\"icheck\" id=\""+formitem.name+"\" x-blackberry-focusable=\"true\" src=\"images/input/"+yesno+"\" ";
	retval += "onmouseover=\"doYesNoSelect('"+formitem.name+"')\" onclick=\"doYesNoClick('"+formitem.name+"')\"/>";
	retval += "<div class=\"clear\"></div></div>";
	return retval;
}

function showiChoice(formitem, defaultlabel) {
	if (defaultlabel == null)
		defaultlabel = "Pilihlah";
	var retval = "<div><div class=\"label\" style=\"margin-top:10px;\">"+formitem.label+"</div><div class=\"rightAlign\">";
	retval += "<a class=\"dropDownButton\" name=\"ichoice\" id=\""+formitem.name+"\" x-blackberry-focusable=\"true\" onmousedown=\"doSelect('"+formitem.name+"')\" ";
	retval += "onmouseover=\"doSelect('"+formitem.name+"')\" onclick=\"openSpinner('"+formitem.name+"')\"><span>"+defaultlabel+"</span></a>";
	retval += "</div><div class=\"clear\"></div></div>";
	return retval;
}

function showSubmit(formname) {
	var retval = "<div class=\"arrowList\" x-blackberry-focusable=\"true\" onclick=\"actionRAFAForm('"+formname+"');\">";
	retval += "<div class=\"listSeparator\"></div><span class=\"arrowListText\"><div class=\"name\">SUBMIT</div><div class=\"snipset\"><img class=\"arrow\" src=\"images/arrow.png\"/></div></span><div class=\"clear\"></div></div>";
	return retval;
}

function showRAFA(RAFA) {
	var iscontent = true;
	var content = "";
	
	document.getElementById("dyn_content").innerHTML = "";
	for (var i=0; i<RAFA.rules.length; i++) {
		rule_type = RAFA.rules[i].type;
		if (rule_type == "list") {
			var method = RAFA.rules[i].method;
			listitems = RAFA.rules[i].elements;
			var list_content = "";
			console.log("List: "+listitems.length);
			for (var j=0; j<listitems.length; j++) {
				list_content += showList(listitems[j], method);
				if ((j+1) != listitems.length) {
					list_content += "<div class=\"listSeparator\"></div>";
				}
			}
			content += showRule(list_content, RAFA.rules[i].title, RAFA.rules[i].help, null);
		} else if (rule_type == "form") {
			formitems = RAFA.rules[i].elements;
			var list_content = "";
			for (var j=0; j<formitems.length; j++) {
				formobject = formitems[j].object
				if (formobject == "item") {
					list_content += showList(formitems[j], null);
				} else if (formobject == "itext") {
					list_content += showiText(formitems[j]);
				} else if (formobject == "icheck") {
					list_content += showiCheck(formitems[j]);
				} else if (formobject == "ichoice") {
					ichoiceitems = formitems[j].elements;
					defaultlabel = null;
					for (var k=0; k<ichoiceitems.length; k++) {
						if (ichoiceitems[k].type == "act") {
							defaultlabel = ichoiceitems[k].label;
							break;
						}
					}
					list_content += showiChoice(formitems[j], defaultlabel);
				}
			}
			list_content += showSubmit(RAFA.rules[i].name);
			content += showRule(list_content, RAFA.rules[i].title, RAFA.rules[i].help, RAFA.rules[i].name);
		} else if (rule_type == "alert") {
			iscontent = false;
			if (RAFA.rules[i].method == "back") {
				alert(RAFA.rules[i].text);
			} else {
				if (confirm(RAFA.rules[i].text)) {
					var url = RAFA.rules[i].method+"/"+RAFA.rules[i].value;
					if (RAFA.rules[i].uuid != null)
						url = RAFA.rules[i].uuid+url;
					runRAFA(url);
				}
			}
		} else if (rule_type == "redirect") {
			iscontent = false;
			var url = globalConfig['site']+RAFA.rules[i].uuid+"/"+RAFA.rules[i].method;
			runRAFA(url);
			break;
		}		
	}
	if (iscontent)
		document.getElementById("dyn_content").innerHTML = content;
}

function createPreload() {
	// Create preload div
	var res;
	if (screen.width <= 320)
		res = "low";
	else if (screen.width <=360)
		res = "med";
	else
		res = "high";
	var preload = "<div id=\"preload\" class=\"preload-"+res+"\">";
	preload += "<b class=\"b1\"></b><b class=\"b2\"></b><b class=\"b3\"></b><b class=\"b4\"></b><div class=\"contentb\">";
	preload += "<div><img src=\"images/preload.gif\" /></div></div><b class=\"b4\"></b><b class=\"b3\"></b><b class=\"b2\">";
	preload += "</b><b class=\"b1\"></b></div>";
	var preload_container = document.getElementById("preload_container");
	if (preload_container != null)
		preload_container.innerHTML = preload;
}

// ------------------------------ ACTION -------------------------------------
function actionRAFAForm(formname) {
	var RAFA = globalConfig['rafa'];
	var form = null;
	var element = null;
	
	// find current form
	for (var i=0; i<RAFA.rules.length; i++) {
		if (RAFA.rules[i].type == "form")
			if (RAFA.rules[i].name == formname) {
				form = RAFA.rules[i];
				break;
			}
	}
	// if founded
	if (form != null) {
		var url = RAFA.uuid+"/"+form.method;
		for (var i=0; i<form.elements.length; i++) {
			element = document.getElementById(form.elements[i].name);
			if (element != null) {
				if (form.elements[i].object == "ichoice") {
					var choiceitems = form.elements[i].elements;
					for (var j=0; j<choiceitems.length; j++) {
						if (choiceitems[j].label.indexOf(element.firstChild.innerHTML) > -1) {
							url += "/"+choiceitems[j].value;
							break;
						}
					}
				} else if (form.elements[i].object == "icheck") {
					if (element.src.indexOf('images/input/yes') > -1)
						url += "/1";
					else
						url += "/0";
				} else
					url += "/"+element.value;
				// Save username
				if (globalConfig['app'] == globalConfig['authapp']) {
					if (form.elements[i].name == "user")
						globalConfig['user'] = element.value;
					if (form.elements[i].name == "pwd")
						globalConfig['pwd'] = element.value;
				}
			}
		}
	}	
	runRAFA(url);
}

function actionRAFAList(listmethod, listvalue) {
	var url = globalConfig['app']+"/"+listmethod+"/"+listvalue;
	runRAFA(url);
}

// ------------------------------ CACHE -------------------------------------
function cache_load() {
	if (globalConfig['cache'].length > 0) {
		var RAFA = globalConfig['cache'].pop();
		console.log(RAFA.uuid);
		globalConfig['rafa'] = RAFA;
		globalConfig['app'] = RAFA.uuid;
		if (globalConfig['cache'].length > 0)
			globalConfig['oldapp'] = cache_lastitem().uuid;
		else
			globalConfig['oldapp'] = null;
		showRAFA(RAFA);
	}
}

function cache_save(oldRafa) {
	if (globalConfig['auth'] == "online") {
		// Check if new uuid
		if ((!isRAFAModule(globalConfig['app'])) && (globalConfig['oldapp'] != globalConfig['app']))
			cache_reset();
		else if (!isRAFAModule(oldRafa.uuid))
			globalConfig['cache'].push(oldRafa);
	}
}

function cache_lastitem() {
	var len = globalConfig['cache'].length - 1;
	return globalConfig['cache'][len];
}

function cache_reset() {
	globalConfig['cache'].length = 0;
}

// ------------------------------ BB MENU -------------------------------------
function menuStart() {
   try {
        //Optionally remove any default menu items:
        blackberry.ui.menu.clearMenuItems();
    }
    catch (e) {
        alert("Error creating blackberry menu");
    }
}

function menuMember() {
    try {
        var mi_market = new blackberry.ui.menu.MenuItem(false, 0, "Market", menuActionMarket);
        var mi_line = new blackberry.ui.menu.MenuItem(true, 1);
        var mi_run = new blackberry.ui.menu.MenuItem(false, 2, "Run", menuActionRun);
        var mi_refresh = new blackberry.ui.menu.MenuItem(false, 3, "Refresh", menuActionRefresh);
        var mi_help = new blackberry.ui.menu.MenuItem(false, 4, "Bantuan", menuActionHelp);

        //Optionally remove any default menu items:
        blackberry.ui.menu.clearMenuItems();

        //Add your own custom MenuItem objects to the menu:
        blackberry.ui.menu.addMenuItem(mi_market);
        blackberry.ui.menu.addMenuItem(mi_line);
        blackberry.ui.menu.addMenuItem(mi_run);
        blackberry.ui.menu.addMenuItem(mi_refresh);
        blackberry.ui.menu.addMenuItem(mi_help);
        
		//Optionally define the menu item that will receive default 
        blackberry.ui.menu.setDefaultMenuItem(mi_market);
    }
    catch (e) {
        alert("Error creating blackberry menu");
    }
}

function menuActionMarket() {
	runRAFA("catalog");
}

function menuActionRun() {
	var uuid = prompt("Run :","");
	if (uuid != null)
		if (uuid != '')
			runRAFA("catalog/run/"+uuid);
}

function menuActionHelp() {
	runRAFA("help");
}

function menuActionRefresh() {
	runRAFA(globalConfig['url']);
}

// ------------------------------ PRELOAD -------------------------------------
function showPreload() {
	var preload = document.getElementById("preload");
	if (preload != null)
		if (preload.style.display != "inherit")
			preload.style.display = "inherit";
}

function hidePreload() {
	var preload = document.getElementById("preload");
	if (preload != null)
		if (preload.style.display == "inherit")
			preload.style.display = "none";
}

// ------------------------------ DATABASE -------------------------------------
function db_save_profile(user, pwd) {
	/*
	if (globalConfig['db'] != null)
		globalConfig['db'].transaction(
			function (t) {
				t.executeSql("INSERT INTO username VALUES ('"+user+"','"+pwd+"')");
			}
		);
	*/
}

function db_load_profile() {
	/*
	if (globalConfig['db'] != null)
		globalConfig['db'].transaction(
			function (t) {
				t.executeSql("CREATE TABLE IF NOT EXISTS username (user text, passwd text)");
				t.executeSql('SELECT * FROM username LIMIT 1', [], 
					function (t, r) {
						if (r.rows.length > 0) {
							globalConfig['user'] = r.rows.item(0).user;
							globalConfig['pwd'] = r.rows.item(0).passwd;
							globalConfig['app'] = globalConfig['authapp'];
							globalConfig['auth'] = "login";
							
							var url = globalConfig['authapp']+"/signin/"+globalConfig['user']+"/"+globalConfig['pwd'];
							runRAFA(url);
						} else
							runRAFA(globalConfig['authapp']);
					}, 
					function (t, e) {
						// couldn't read database
						alert(e.message);
					}
				);
			}
		);
	*/
	runRAFA(globalConfig['authapp']);
}

// ------------------------------ BOOTSTRAP -------------------------------------
function init() {
	// Initialize Global Parameters
	globalConfig['app'] = null;
	globalConfig['oldapp'] = null;
	globalConfig['auth'] = "logout"; 	// logout -> login -> online/logout
	globalConfig['rafa'] = null;
	globalConfig['cache'] = new Array();
	globalConfig['user'] = null;
	globalConfig['pwd'] = null;
	globalConfig['site'] = "http://m.tukuya.com/";
	globalConfig['db'] = null;
	globalConfig['url'] = null;
	globalConfig['authapp'] = "userpoltek";
	
	// Screen initialize
	document.body.style.height = screen.height + 'px';

	// Menu
	menuStart();
	
	// Key override
	blackberry.system.event.onHardwareKey(blackberry.system.event.KEY_BACK, cache_load);
	
	// Open database
	//globalConfig['db'] = window.openDatabase('poltek', '1.0', 'Offline Database', 5*1024*1024, null);

	// Create preload div
	createPreload();
	
	// bootstrap
	db_load_profile();
}
