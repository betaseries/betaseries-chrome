# START
DB.init()
Badge.init()

chrome.alarms.create 'badge_update', {periodInMinutes:60}

chrome.alarms.onAlarm.addListener (alarm) ->
	if alarm.name is 'badge_update' && Fx.logged()
		Badge.update()