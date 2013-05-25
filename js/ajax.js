var ajax = {
	url_api: "https://api.betaseries.com",
	site_url: "https://www.betaseries.com",
	key: "6db16a6ffab9",
	post: function(category, params, successCallback, errorCallback) {
		params = params || '';

		var member = DB.get('session', {});
		var token = member.token === null ? '' : '&token=' + member.token;

		// show loading icon
		$('#sync img').attr('src', '../img/sync.gif');

		// ajax request
		$.ajax({
			type: 'POST',
			url: this.url_api + category + '.json',
			data: 'key=' + this.key + params + token,
			dataType: 'json',

			success: function(data) {
				$('#sync img').attr('src', '../img/sync.png');

				if (successCallback !== null) {
					successCallback(data);
				}
			},

			error: function() {
				$('#sync img').attr('src', '../img/sync.png');

				if (errorCallback !== null) {
					return errorCallback();
				}
			}
		});
	}
};