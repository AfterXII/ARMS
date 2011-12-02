function writeLog(log) {
	return;
  frag = '<p>' + log + '</p>';
  $("#log").append(frag);
}

// Our global "database"
function FauxBase() {
	// Drinks list
	this.drinks = { "beer" : 1, "wine" : 2, "liquor" : 3};

	/*this.drinks = {
		1 : { "beer" : 5 },
		2 : { "liquor" : 6 },
		3 : { "wine" : 7 }
	};

	this.testz = {"blah" : 5};
	this.test = $.makeArray(this.testz);
	writeLog("value of blah is " + this.testz['blah']);*/

	this.getDrinks = function() {
		return this.drinks;
	}

	return true;
}

// "Database" manager class
function DatabaseManager() {
	this.currentDatabase = null;

	this.base = new FauxBase();
	
	this.loadTable = function(tableName) {
		writeLog("Loading table " + tableName + " ... ");
		switch(tableName.toLowerCase()) {
			case "drinks":
				this.currentDatabase = this.base.getDrinks();
				break;
			default: break;
		}
	};

	this.getDatabase = function() {
		return this.currentDatabase;
	};

	this.findValueOf = function(valueName) {
		writeLog("Finding value of " + valueName + " ... ");
		
		var index = -1;
		var i;
		for(i = 0; i < 3; i++) {
			writeLog("comparing " + valueName + " to " + this.currentDatabase[i]);
			if(this.currentDatabase[i] == valueName.toLowerCase()) {
				index = i;
			}
		}

		if(index != -1) {
			writeLog("Item found");
			return this.currentDatabase[index];
		} else {
			writeLog("Item not found.");
			return -1;
		}
	};

	return true;
}

// Add a drink to our consumption table
function addDrink(drinkName) {
  dbManager = new DatabaseManager();

  dbManager.loadTable("drinks");

  drinkName = drinkName.toLowerCase();

  // Check if drink is in the "database"
  if(dbManager.getValueOf(drinkName) != -1) {
    // Get the value for the entry
  }
}

/*
 * Changes flyout visibility for the particular element
 * Also changes button to selected or deselected and handles disabling other elements for a clean transition
*/
function changeFlyoutVisibility(name) {
  // Get flyout (content) div
  var flyout = $("#"+name+'_flyout');

  // Get button that was clicked
  var button = $("#"+name+'_button');

  // Check if flyout is currently visible
  if(flyout.is(":visible")) {
    // If it is, fade it out and de-select button
    flyout.fadeOut();
    button.removeClass('selected');
  } else {
    // Otherwise, de-select all other buttons
    $("#mainmenu").find('li').removeClass('selected');
    
    // Hide all flyout menus
    $(".flyout").hide();
   
    // Fade in the desired flyout menu
    flyout.fadeIn();

    // Show that the current button is selected
    button.addClass('selected');

    // Position the arrow to be above the current button
    var x = button.position().left + ( (button.width() / 2) - ( $(".flyoutarrow").width() / 2 ) );
    flyout.find('div').css('left', x);
  }
}

function runTests() {
	dbManager = new DatabaseManager();
	dbManager.loadTable("drinks");
	var table = dbManager.getDatabase();
	var beerVal = dbManager.findValueOf("beer");
	writeLog("Value for beer is " + beerVal);
}

/*
 * Initialization functions
 * Set click bindings, initial position and visibility, etc.
*/
function init() {
	writeLog("blah");
	// Run tests
	//runTests();

  // Flyout click bindings
  $("#plus_one_button").click(function() {
    changeFlyoutVisibility('plus_one');
  });
  $("#settings_button").click(function() {
    changeFlyoutVisibility('settings');
  });
  $("#utilities_button").click(function() {
    changeFlyoutVisibility('utilities');
  });

  // Module click bindings
}
