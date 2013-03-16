chrome.alarms.onAlarm.addListener (alarm) ->
	if Fx.logged()
		if alarm.name is 'search_episodes'
			last_checked = DB.get('options').new_episodes_checked
			Badge.search_episodes() if !last_checked || last_checked < date('Y.m.d')
		if alarm.name is 'search_notifications'
			period_search_notifications = DB.get('options').period_search_notifications
			Badge.search_notifications() if !period_search_notifications