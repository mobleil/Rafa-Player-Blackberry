// Pre-load our images for hover effects
image3 = new Image();
image3.src =  'images/input/no.png';
image4 = new Image();
image4.src = 'images/input/noSel.png';
image5 = new Image();
image5.src = 'images/input/off.png';
image6 = new Image();
image6.src = 'images/input/offSel.png';
image7 = new Image();
image7.src = 'images/input/on.png';
image8 = new Image();
image8.src =  'images/input/onSel.png';	
image9 = new Image();
image9.src =  'images/input/yes.png';
image10 = new Image();
image10.src =  'images/input/yesSel.png';

/*
addEventListener('load',doInputLoad,false);

function doInputLoad() {
    var elements = document.getElementsByName('itext');
	if (elements != null)
		for (var i=0; i<elements.length; i++)
			elements[i].style.width = screen.width - elements[i].offsetLeft - 30 + 'px';
}
*/

function doSelect(id) {
    resetImages();
    var button = document.getElementById(id);
    button.style.backgroundPosition = 'bottom right';
    button.firstChild.style.backgroundPosition = 'bottom left';
}

function evaluateYesNo(id) {
    var element = document.getElementById(id);
    if (element.src.indexOf('/yes') > -1)
        return true;	
    else if (element.src.indexOf('/on') > -1)
        return true;	
    else
        return false;		    
}

function doYesNoClick(id) {
    resetImages();  
    var element = document.getElementById(id);
    if (element.src.indexOf('images/input/yes') > -1)
        element.src = 'images/input/noSel.png';	
    else if (element.src.indexOf('images/input/on') > -1)
        element.src = 'images/input/offSel.png';	
    else if (element.src.indexOf('images/input/no') > -1)
        element.src = 'images/input/yesSel.png';	
    else if (element.src.indexOf('images/input/off') > -1)
        element.src = 'images/input/onSel.png';
		
	if (element.value == 1)
		element.value = 0;
	else
		element.value = 1;
}

function doYesNoSelect(id) {
    if (blackberry.focus.getFocus() != id) 
        return;
    resetImages();

    var element = document.getElementById(id);
    if (element.src.indexOf('/yes.png') > -1)
        element.src = 'images/input/yesSel.png';	
    else if (element.src.indexOf('/on.png') > -1)
        element.src = 'images/input/onSel.png';	
    else if (element.src.indexOf('/off.png') > -1)
        element.src = 'images/input/offSel.png';
    else if (element.src.indexOf('/no.png') > -1)
        element.src = 'images/input/noSel.png';
}

function doYesNoUnSelect(element) {
    if (element.src.indexOf('images/input/yes') > -1)
        element.src = 'images/input/yes.png';	
    else if (element.src.indexOf('images/input/on') > -1)
        element.src = 'images/input/on.png';	 
    else if (element.src.indexOf('images/input/off') > -1)
        element.src = 'images/input/off.png';
    else if (element.src.indexOf('images/input/no') > -1)
        element.src = 'images/input/no.png';	 	 
}

function resetImages() {
	var elements = null;
	elements = document.getElementsByName("ichoice");
	if (elements != null)
		for (var i=0; i<elements.length; i++) {
			elements[i].style.backgroundPosition = 'top right';
			elements[i].firstChild.style.backgroundPosition = 'top left';
		}

	elements = null;
	elements = document.getElementsByName("icheck");
	if (elements != null)
		for (var i=0; i<elements.length; i++) {
			doYesNoUnSelect(elements[i]);
		}
}

function openSpinner(id) {
    doSelect(id);
    /*
        sample.ui.spinner
        ==================================
        static readwrite property String title; // Title on top of screen
        static readwrite property Number rowHeight; // Height of each row to display
        static readwrite property Number visibleRows; // Number of rows to display
        
        static Number open(items : String[], defaultIndexSelected : Number); // Returns the index of the selected item
        
    */

    // Configure our spinner
	var rowHeight = 0;
    var visibleRows = 0;
    if (screen.height < 480){
        rowHeight = 60;
        visibleRows = 3;
    }
    else {
        rowHeight = 75;
        visibleRows = 4;
    }

    // Create the items in the order in which to display them
	var RAFA = globalConfig['rafa'];
	var choice = null;
	var choiceindex = null;
	
	// find current form
	for (var i=0; i<RAFA.rules.length; i++) {
		if (RAFA.rules[i].type == "form") {
			var form = RAFA.rules[i];
			for (var j=0; j<form.elements.length; j++)
				if (form.elements[j].name == id) {
					choice = form.elements[j];
					break;
				}			
		}
		if (choice != null)
			break;
	}
	
	// if founded
	if (choice != null)
		if (choice.elements != null) {
			var items = new Array();
			var elements = choice.elements;
			var defaultelement = 0;
			for (var j=0; j<elements.length; j++) {
				items.push(elements[j].label);
				if (elements[j].type == "act")
					defaultelement = j;
			}
			var options = {'title': 'Pilihlah :',
				'rowHeight': rowHeight,
				'visibleRows': visibleRows,
				'selectedIndex': defaultelement,
				'items' : items};
			choiceindex = sample.ui.spinner.open(items, function (selectedIndex) {
				document.getElementById(id).firstChild.innerHTML = items[selectedIndex];
				alert(selectedIndex); 
			});
		}

    if (choiceindex != null)
        
}