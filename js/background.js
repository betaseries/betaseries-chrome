chrome.alarms.onAlarm.addListener(function(alarm) {
	var last_checked, period_search_notifications;
	if (Fx.logged()) {
		if (alarm.name === 'search_episodes') {
			last_checked = DB.get('new_episodes_checked', null);
			if (!last_checked || last_checked < date('Y.m.d')) {
				Badge.search_episodes();
			}
		}
		if (alarm.name === 'search_notifications') {
			period_search_notifications = DB.get('options').period_search_notifications;
			if (!period_search_notifications) {
				Badge.search_notifications();
			}
		}
	}
});