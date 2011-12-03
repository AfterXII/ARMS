function writeLog(log) {
	frag = '<p>' + log + '</p>';
	$("#log").append(frag);
}

// Our global "database"
function FauxBase() {
	// Beer values
	this.beer = { "calories" : 150 };

	// Wine values
	this.wine = { "calories" : 120 };

	// Liquor values
	this.liquor = { "calories" : 100 };
	
	// Drinks list
	this.drinks = { 	"beer"   : 	this.beer,
							"wine"   : 	this.wine,
							"liquor" : 	this.liquor };

	// User settings
	//this.settings = { "name" : , "};

	this.getDrinks = function() {
		return this.drinks;
	}

	this.getSettings = function() {
		return this.settings;
	}

	// Return value on instantiation
	return true;
}

// "Database" manager class
function DatabaseManager() {
	this.currentDatabase = null;

	// Grab our actual data
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

	this.getValueOf = function(valueName) {
		writeLog("Finding value of " + valueName + " ... ");

		// Default return value is -1 for not found
		var ret = -1;

		if(this.currentDatabase != null) {
			writeLog("Not null");
			for(key in this.currentDatabase) {
				if(key == valueName) {
					ret = this.currentDatabase[key];
				}
			}
		} else {
			// No table loaded
		}

		return ret;

	};

	// Return value on instantiation
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
	var beerVal = dbManager.getValueOf("beer");
	writeLog("Value for beer is " + beerVal);
	writeLog("Calories for beer is " + beerVal["calories"]);
}

/*
 * Initialization functions
 * Set click bindings, initial position and visibility, etc.
*/
function init() {
	writeLog("blah");
	// Run tests
	runTests();

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
