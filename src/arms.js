function writeLog(log) {
	return;
	frag = '<p>' + log + '</p>';
	$("#log").append(frag);
}

// Our global "database"
function FauxBase() {
	// Beer values
	this.beer = {
		"name" 		: "beer",
		"calories" 	: 150,
		"grams" 		: 0
	};

	// Wine values
	this.wine = {
		"name" 		: "wine",
		"calories" 	: 120,
		"grams" 		: 0
	};

	// Liquor values
	this.liquor = {
		"name" 		: "liquor",
		"calories" 	: 100,
		"grams" 		: 0
	};
	
	// Drinks list
	this.drinks = {
		"beer" 	: this.beer,
		"wine" 	: this.wine,
		"liquor" : this.liquor
	};

	// User settings
	// All default limit values are the legal limit
	// All settings deemed to be a safety feature are true by default
	this.settings = {
		"weight" 				: "", 		// Integer
		"sex" 					: "", 		// String
		"name" 					: "", 		// String
		"contactlocklimit" 	: 0.8, 		// Float, BAC value
		"calltaxionlimit" 	: true, 		// Boolean
		"calltaxilimit" 		: 0.8, 		// Float, BAC value
		"usegps" 				: true, 		// Boolean
		"baccalculate" 		: true, 		// Boolean
		"cachetaxi" 			: true, 		// Boolean
		"taxiinterval" 		: 30, 		// Integer, minutes
		"calltaxi" 				: false 		// Boolean
	};

	this.utilities = {
		"tools" 	: "1",
		"histogram" :	"histogram"
	};

	// Current data for this session
	this.currentData = {
		"grams" 		: 0, 	// Grams of alcohol consumed
		"drinks" 	: 0, 	// Number of drinks consumed
		"calories" 	: 0 	// Number of calories consumed
	};
	
	this.getDrinks = function() {
		return this.drinks;
	}

	this.getSettings = function() {
		return this.settings;
	}

	this.getUtilities = function() {
		return this.utilities;
	}

	this.getCurrentData = function() {
		return this.currentData;
	}

	// Return value on instantiation
	return true;
}

// "Database" manager class
function DatabaseManager() {
	this.currentDatabase = null;

	// Grab our actual data
	this.base = new FauxBase();

	// Load a table to perform operations on
	this.loadTable = function(tableName) {
		writeLog("Loading table " + tableName + " ... ");

		// currentDatabase remains null if an invalid name is provided
		// Also return false on failure, true on success
		switch(tableName.toLowerCase()) {
			case "drinks":
				this.currentDatabase = this.base.getDrinks();
				break;
			case "settings":
				this.currentDatabase = this.base.getSettings();
				break;
			case "utilities":
				this.currentDatabase = this.base.getUtilities();
				break;
			case "currentData":
				this.currentDatabase = this.base.getCurrentData();
				break;
			default: return false;
		}

		return true;
	};

	// Get the current database, useful for testing or list processing
	this.getDatabase = function() {
		return this.currentDatabase;
	};

	// Get the value of a particular entry in the table
	// Ex. if table "drinks" is loaded, get row "beer":
	// 	dbManager.loadTable("drinks");
	// 	dbManager.getValueOf("beer"):
	// 	-> returns FauxBase.beer
	this.getValueOf = function(valueName) {
		writeLog("Finding value of " + valueName + " ... ");

		// Default return value is -1 for error 
		var ret = -1;

		if(this.currentDatabase != null) {
			writeLog("Not null");
			for(key in this.currentDatabase) {
				if(key == valueName) {
					ret = this.currentDatabase[key];
				}
			}
		}

		return ret;

	};

	// Set value of a particular entry in the table
	// Returns false if key not found, true if setting changed
	this.setValueOf = function(key, value) {
		// Check that we've loaded a database first
		if(this.currentDatabase != null) {
			for(key in this.currentDatabase) {
				if(key == valueName) {
					this.currentDatabase[key] = value;
					return true;
				}
			}
		}
		return false;
	};

	// Return value on instantiation
	return true;
}

// Add a drink to our consumption table
function addDrink(drinkName) {
	dbManager = new DatabaseManager();

	dbManager.loadTable("drinks");

	drinkName = drinkName.toLowerCase();
	
	var drink = dbManager.getValueOf(drinkName);

	// Check if drink is in the "database"
	if(drink != -1) {
		// Get the value for the entry
		var calories = drink["calories"];
		var grams = drink["grams"];

		// Load current data from database
		var dataDb = new DatabaseManager();
		dataDb.loadTable("currentData");
		var curCalories = dataDb.getValueOf("calories");
		var curGrams = dataDb.getValueOf("grams");

		// Increment values in database
		dataDb.setValueOf("calories", curCalories + calories);
		dataDb.setValueOf("grams", curGrams + grams);

		// Refresh the GUI to set progress bars and text elements
		refreshGUIElements();
	}
}

function refreshGUIElements() {
	alert("yo!");
}

// Adjust user configuration setting
function setConfigurationValue(key, value) {
	dbManager = new DatabaseManager();

	dbManager.loadTable("settings");

	key = key.toLowerCase();

	// Check that setting exists first
	if(dbManager.getValueOf(key) != -1) {
		// If it does, set new value
		return dbManager.setValueOf(key, value);
	}
}

// Adjust current data values
function setCurrentDataValue(key, value) {
	dbManager = new DatabaseManager();

	dbManager.loadTable("currentData");

	key = key.toLowerCase();

	if(dbManager.getValueOf(key) != -1) {
		return dbManager.setValueOf(key, value);
	}
}

function calculateBAC() {
	writeLog("Calculating BAC...");

	dbManager = new DatabaseManager();
	dbManager.loadTable("settings");

	var weight = dbManager.getValueOf("weight");
	var weightInGrams = (weight / 2.205) * 1000;

	var sex = dbManager.getValueOf("sex").toLowerCase();

	var waterPercent = (sex == "male") ? .58 : .49;

	var bloodInGrams = (weightInGrams * waterPercent);

	dbManager.loadTable("currentData");
	var gramsAlcoholConsumed = dbManager.getValueOf("grams");

	var BAC = (gramsAlcoholConsumed / bloodInGrams) * 100;

	// Return rounded BAC value
	return Math.round(BAC * 100) / 100;
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

	var arrow = flyout.find('div');
	//arrow.css("background-color", "green");

	// Set position for flyout based on height
	var h = flyout.height();
	var t = $("#mainmenu").position().top;
	var a = $(".flyoutarrow").height();
	flyout.css("top", t - h);
	arrow.css("top", h - (a/2));

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
	writeLog("Name for beer is " + beerVal["name"]);

	// Test print settings
	writeLog("Settings:");
	dbManager.loadTable("settings");
	var settingsVal = dbManager.getDatabase();
	for(key in settingsVal) {
		writeLog(key + " : " + settingsVal[key]);
	}
}

/*
 * Initialization functions
 * Set click bindings, initial position and visibility, etc.
*/
function init() {
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

	// Drink adding click bindings
	$("#wine_button").click(function() {
		addDrink("wine");
	});

	$("#beer_button").click(function() {
		addDrink("beer");
	});

	$("#liquor_button").click(function() {
		addDrink("liquor");
	});

	// Load all settings as buttons into settings flyout
	var elem = $("#settings_list");
	dbManager = new DatabaseManager();
	dbManager.loadTable("settings");
	var settingsList = dbManager.getDatabase();
	for(key in settingsList) {
		var frag = "<li>" + key + "</li>";
		elem.append(frag);
	}

	// Load all utilities as buttons into utilities flyout
	var elem = $("#utilities_list");
	dbManager.loadTable("utilities");
	var utilitiesList = dbManager.getDatabase();
	for(key in utilitiesList) {
		var frag = "<li>" + key + "</li>";
		elem.append(frag);
	}
}
