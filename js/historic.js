/**
 * Historic class
 * @class Historic
 * @constructor
 * @param  {App} app App instance
 */
var Historic = function(app) {
	/**
	 * App instance
	 * @property app
	 * @type {App}
	 */
	this.app = app;
};

/**
 * Refresh the last view into historic
 * @method refresh
 */
Historic.prototype.refresh = function() {
	var historic = DB.get('historic');
	var length = historic.length;
	var args = historic[length - 1].split('.');
	this.app.view.load.apply(this.app.view, args);
	this.display(length);
};

/**
 * Save the current view into historix
 * @method save
 */
Historic.prototype.save = function() {
	var historic = DB.get('historic');
	var length = historic.length;
	var blackpages = ['Connection', 'Registration', 'Menu'];
	var view = this.app.view.infos.id;
	if (historic[length - 1] !== view && $.inArray(view, blackpages) < 0) {
		historic.push(view);
		DB.set('historic', historic);
		length++;
	}
	this.display(length);
};

/**
 * Go back into the historic
 * @method back
 */
Historic.prototype.back = function() {
	var historic = DB.get('historic');
	var length = historic.length;
	if (length >= 2) {
		historic.pop();
		var args = historic[length - 2].split('.');
		this.app.view.load.apply(this.app.view, args);
		DB.set('historic', historic);
		length--;
	}
	this.display(length);
};

/**
 * Show/hide the back icon
 * @method display
 * @param  {int} n Number of items into historic
 */
Historic.prototype.display = function(n) {
	var view = this.app.view.infos.id;
	var blackpages = ['Connection', 'Registration', 'Menu'];
	if (n >= 2 && $.inArray(view, blackpages) < 0) {
		$('#back').show();
	} else {
		$('#back').hide();
	}
};