/**
 * View Menu - class
 * @method View_Menu
 * @constructor
 */
var View_Menu = function() {};

/**
 * Initialize the view
 * @method init
 */
View_Menu.prototype.init = function() {
	this.id = 'Menu';
	this.name = 'Menu';
};

/**
 * Build HTML content
 * @method content
 * @return {string} HTML output
 */
View_Menu.prototype.content = function() {
	var output = '';
	var menu_order = DB.get('options').menu_order;

	for (var i = 0; i < menu_order.length; i++) {
		var m = menu_order[i];

		// visible option
		if (!m.visible) {
			continue;
		}

		// menu style
		var style = '';
		if (m.img_style) {
			style = 'style="' + m.img_style + '" ';
		}

		output += '<a href="" id="menu-' + m.name + '" class="menulink">';
		output += '<img src="' + m.img_path + '" ' + style + '/>';
		output += __('menu_' + m.name) + '</a>';
	}

	return output;
};

/**
 * Add listeners for the view
 * @method listen
 */
View_Menu.prototype.listen = function() {
	$('.Menu').on('click', '.menulink', function() {
		event.preventDefault();
		var id = $(this).attr('id').substring(5);

		if (id === 'Options') {
			Fx.openTab(chrome.extension.getURL('../html/options.html'), true);
		} else if (id === 'Logout') {
			Fx.logout();
		} else {
			app.view.load(id);
		}
	});
};