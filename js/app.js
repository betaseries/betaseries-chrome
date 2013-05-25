/**
 * App class
 * @class App
 * @constructor
 */
var App = function() {

	this.historic = null;

	this.view = null;
};

/**
 * Initialize
 * @method init
 */
App.prototype.init = function() {
	// init DB
	DB.init();

	// check version
	Fx.checkVersion();

	// Init history
	this.historic = new Historic(this);

	// Load first view
	var homepage = Fx.logged() ? 'MyEpisodes' : 'Connection';
	this.view = new View(this);
	this.view.load(homepage);

	this.listen();
};

/**
 * Add listeners for header
 * @method listen
 */
App.prototype.listen = function() {
	var _this = this;

	$('body').on('mouseenter', '*[title], *[smart-title]', function() {
		var title;

		title = $(this).attr('title');
		if (title !== null) {
			$(this).removeAttr('title');
			$(this).attr('smart-title', title);
		} else {
			title = $(this).attr('smart-title');
		}
		$('#help').show();
		$('#help-text').html(title);
	}).on('mouseleave', '*[title], *[smart-title]', function() {
		$('#help').hide();
		$('#help-text').html('');
	}).on('click', '*[title], *[smart-title]', function() {
		$('#help').hide();
		$('#help-text').html('');
	});

	$('#logoLink').click(function() {
		Fx.openTab(ajax.site_url, true);
	}).attr('title', __("logo"));

	$('#versionLink').click(function() {
		Fx.openTab('https://chrome.google.com/webstore/detail/dadaekemlgdonlfgmfmjnpbgdplffpda', true);
	}).attr('title', __("version"));

	$('#back').click(function() {
		_this.historic.back();
		return false;
	}).attr('title', __("back"));

	$('#sync').click(function() {
		_this.view.refresh();
	}).attr('title', __('sync'));

	$('#sync').addClass('paused');

	$('#search').click(function() {
		_this.view.load('Search');
		return false;
	}).attr('title', __("menu_Search"));

	$('#my-episodes').click(function() {
		_this.view.load('MyEpisodes');
		return false;
	}).attr('title', __("menu_MyEpisodes"));

	$('#menu').click(function() {
		if (_this.view.infos.id === 'Menu') {
			_this.historic.refresh();
		} else {
			_this.view.load('Menu');
		}
	}).attr('title', __('menu'));

	$('#message').on('click', '.close', function() {
		event.preventDefault();
		$('#message').fadeOut();
	});
};