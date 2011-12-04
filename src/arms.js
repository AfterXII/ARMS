// Beer values
beer = {
	"name" 		: "beer",
	"calories" 	: 150,
	"grams" 		: 10
};

// Wine values
wine = {
	"name" 		: "wine",
	"calories" 	: 120,
	"grams" 		: 10
};

// Liquor values
liquor = {
	"name" 		: "liquor",
	"calories" 	: 100,
	"grams" 		: 10
};

// Drinks list
drinks = {
	"beer" 	: this.beer,
	"wine" 	: this.wine,
	"liquor" : this.liquor
};

// User settings
// All default limit values are the legal limit
// All settings deemed to be a safety feature are true by default
settings = {
	"weight" 				: 150, 		// Integer
	"sex" 					: "male", 		// String
	"name" 					: "John Doe", 		// String
	"contactlocklimit" 	: 0.08, 		// Float, BAC value
	"calltaxionlimit" 	: true, 		// Boolean
	"calltaxilimit" 		: 0.08, 		// Float, BAC value
	"usegps" 				: true, 		// Boolean
	"baccalculate" 		: true, 		// Boolean
	"cachetaxi" 			: true, 		// Boolean
	"taxiinterval" 		: 30, 		// Integer, minutes
	"calltaxi" 				: false 		// Boolean
};

utilities = {
	"tools" 	: "",
	"histogram" :	""
};

yesNoButtons = "<div class=\"button\" id=\"yes_button\">Yes</div><div class=\"button\" id=\"no_button\">No</div>";

// Current data for this session
currentData = {
	"grams" 		: 1, 	// Grams of alcohol consumed
	"drinks" 	: 0, 	// Number of drinks consumed
	"calories" 	: 0, 	// Number of calories consumed
	"bac" 		: 0 	// Current BAC
};

// Table for consumed drinks - for histogram, reporting, etc.
consumed = [];

//
// Start actual ARMS module code
//

function writeLog(log) {
	return;
	frag = '<p>' + log + '</p>';
	$("#log").append(frag);
}

// Our global "database"
function FauxBase() {
	
	this.getDrinks = function() {
		return drinks;
	}

	this.getSettings = function() {
		return settings;
	}

	this.getUtilities = function() {
		return utilities;
	}

	this.getCurrentData = function() {
		return currentData;
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
			case "currentdata":
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

	// Print current database
	this.printDatabase = function() {
		writeLog("Printing database...");
		for(key in this.currentDatabase) {
			writeLog(key + " => " + this.currentDatabase[key]);
		}
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
	this.setValueOf = function(kee, value) {
		// Check that we've loaded a database first
		if(this.currentDatabase != null) {
			for(key in this.currentDatabase) {
				if(key == kee) {
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

// Drink class
// Used exclusively for adding drink history to table "consumed"
function Drink(drinkName, timestamp) {
	this.name = drinkName;
	this.timestamp = timestamp;
}

// Add a drink to our consumption table
function addDrink(drinkName) {
	// Add drink to consumed table
	thisDrink = new Drink(drinkName, null); // Null timestamp - this will be supported with SQLLite
	consumed.push(thisDrink);

	dbManager = new DatabaseManager();

	dbManager.loadTable("drinks");

	drinkName = drinkName.toLowerCase();
	
	var drink = dbManager.getValueOf(drinkName);

	// Check if drink is in the "database"
	if(drink != -1) {
		// Get the value for the entry
		var calories = drink["calories"];
		var grams = drink["grams"];

		writeLog("Calories: " + calories + ", grams: " + grams);

		// Load current data from database
		var dataDb = new DatabaseManager();
		dataDb.loadTable("currentData");
		var curCalories = dataDb.getValueOf("calories");
		var curGrams = dataDb.getValueOf("grams");
		var curDrinks = dataDb.getValueOf("drinks");

		writeLog("Current calories: " + curCalories + ", current grams: " + curGrams);

		// Increment values in database
		dataDb.setValueOf("calories", curCalories + calories);
		dataDb.setValueOf("grams", curGrams + grams);
		dataDb.setValueOf("bac", calculateBAC());
		dataDb.setValueOf("drinks", curDrinks + 1);

		// Refresh the GUI to set progress bars and text elements
		refreshGUIElements();
	}
}

function showUserAlert(alertType) {
	writeLog("Showing user alert type " + alertType);
	var frag;
	var fluke = false;
	switch(alertType.toLowerCase()) {
		case "userlimit":
			frag = "You have reached your defined limit! Would you like to see a list of nearby taxi services?";
			break;
		case "legallimit":
			frag = "You have reached the legal limit! Would you like to see a list of nearby taxi services?";
			break;
		default:
			fluke = true;
			break;
	}

	// If the alert was valid, show it
	if(!fluke) {
		var elem = $("#alertbox");
		elem.html(frag + yesNoButtons);
		elem.show();
	}

	// Add click bindings to buttons
	setAlertBindings();
}

function refreshGUIElements() {
	writeLog("Refreshing GUI elements...");
	var dbManager = new DatabaseManager();

	// Load settings table, get user defined BAC limit
	dbManager.loadTable("settings");
	var userLimit = dbManager.getValueOf("calltaxilimit");
	var legalLimit = 0.08;

	// Load data table, get current BAC and # of drinks
	//dbManager = new DatabaseManager();
	dbManager.loadTable("currentdata");
	var currentBAC = dbManager.getValueOf("bac");
	writeLog("Current BAC is " + currentBAC);
	var numDrinks = dbManager.getValueOf("drinks");
	writeLog("Refreshing GUI elements. BAC is " + currentBAC + " and # drinks is " + numDrinks);
	
	// Let's check if we've reached either limit
	// Alert the user if this is the case
	if(currentBAC >= userLimit) {
		showUserAlert("userlimit");
	}
	if(currentBAC >= legalLimit) {
		showUserAlert("legallimit");
	}

	// Calculate percentage to user limit
	var userLimitPercentage = (currentBAC / userLimit);
	writeLog("Percentage to user limit is " + userLimitPercentage);

	// Calculate percentage to legal limit
	var legalLimitPercentage = (currentBAC / legalLimit);

	// Make sure we don't expand over the container...
	if(userLimitPercentage * 100 >= 100) {
		userLimitPercentage = 100;
		$("#userlim_progress").css("background-color", "red");
	}
	if(legalLimitPercentage * 100 >= 100) {
		legalLimitPercentage = 100;
		$("#legallim_progress").css("background-color", "red");
	}

	// Update both progress bars
	var progressWidth; 	// Width of progress bar container
	var width; 				// New width for progress bar (based on percentage)
	
	var userLimProgressElement = $("#userlim_progress");
	progressWidth = $("#userlim_progress_container").width();
	width = progressWidth * userLimitPercentage;
	userLimProgressElement.css("width", width);

	var legalLimProgressElement = $("#legallim_progress");
	progressWidth = $("#legallim_progress_container").width();
	width = progressWidth * legalLimitPercentage;
	legalLimProgressElement.css("width", width);

	// Update # of drinks with grabbed value
	$("#counter_num").html(numDrinks);

	// Update BAC display with grabbed value
	$("#bac_num").html("Your current BAC is " + currentBAC);
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

	dbManager.loadTable("currentdata");

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

	dbManager.loadTable("currentdata");
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
		flyout.find('div').css('left', x - 24);
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

function setAlertBindings() {
	// Yes and no button click bindings
	$("#yes_button").click(function() {
		$("#alertbox").hide();
		$("#taxilist").show();
	});

	$("#no_button").click(function() {
		$("#alertbox").hide();
	});

}

/*
 * Initialization functions
 * Set click bindings, initial position and visibility, etc.
*/
function init() {
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
		var val = settingsList[key];
		var keyIn = "<input type=\"text\" class=\"plain\" id=\"" + key + "_input\" value=\"" + val + "\" />";
		var frag = "<li>" + key + keyIn + "</li>";
		elem.append(frag);
	}

	// Add change bindings to all inputs
	for(settingName in settingsList) {
		var elem = $("#"+settingName+"_input");
		elem.change(function() {
			// Change value in table to new value
			var val = $(this).val();
			writeLog("changing value for " + settingName + " to " + val);
			setConfigurationValue(settingName, val);
		});
	}

	// Load all utilities as buttons into utilities flyout
	var elem = $("#utilities_list");
	dbManager.loadTable("utilities");
	var utilitiesList = dbManager.getDatabase();
	for(key in utilitiesList) {
		var frag = "<li>" + key + "</li>";
		elem.append(frag);
	}

	// Load in all current settings
	refreshGUIElements();
}
