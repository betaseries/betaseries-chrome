/**
 * View class
 * @method View
 * @constructor
 * @param  {App} app App instance
 */
var View = function(app) {
	/**
	 * App instance
	 * @property app
	 * @type {App}
	 */
	this.app = app;
};

/**
 * Load the view
 * @method load
 */
View.prototype.load = function() {

	// construct the view
	var view = arguments[0];
	var params = (arguments.length >= 2) ? [].slice.call(arguments, 1) : [];
	var o = new window['View_' + view]();
	if (o.init) {
		o.init.apply(o, params);
	}

	// determine if same view
	var sameView = this.infos && this.infos.id == o.id;

	// remove listeners
	if (this.infos && this.infos.name) {
		$('.' + this.infos.name).off();
	}

	// memorize infos
	this.infos = o;

	// don't display if same view
	if (!sameView) {
		this.display();
	}

	// update view if needed
	if (o.update) {
		var time = (new Date().getDate()) + '.' + (new Date().getFullYear());
		var views = DB.get('views', {});
		var outdated = views[o.id] ? views[o.id].time != time : true;
		var force = views[o.id] ? views[o.id].force : true;
		if (outdated || force) {
			this.update();
		}
	}
};

/**
 * Update data for the current view
 * @method update
 */
View.prototype.update = function() {
	var _this = this;
	var o = this.infos;
	var params = o.params || '';

	if (o.url) {
		ajax.post(o.url, params, function(data) {
			// remove all cache ?
			Cache.remove(data.root.code);

			var cache = data.root[o.root];
			var time = (new Date().getDate()) + '.' + (new Date().getFullYear());
			var views = DB.get('views', {});

			// time up the view
			views[o.id] = {
				time: time,
				force: false
			};
			DB.set('views', views);

			// update view logic
			o.update(cache);

			// display view
			_this.display();
		});
	}
};

/**
 * Display the current view
 * @method display
 */
View.prototype.display = function() {
	var o = this.infos;

	// save historic
	this.app.historic.save();

	// content
	$('#page').html('');
	if (o.content) {
		$('#page').html(o.content());
	}
	$('#title').text(__('title_' + o.name));
	$('#page').removeClass().addClass(o.name);

	// listeners
	if (o.listen) {
		o.listen();
	}

	// adapt the height
	Fx.updateHeight();
};

/**
 * Refresh the current view
 * @method refresh
 */
View.prototype.refresh = function() {
	// mark this view for update
	Fx.toUpdate(this.infos.id);

	// reload the current view
	var args = this.infos.id.split('.');
	this.load.apply(this, args);
};