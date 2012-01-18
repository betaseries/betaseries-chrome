/**
 * Internationalisation
 */
var __ = function(msgname, placeholders){
	return chrome.i18n.getMessage(msgname, placeholders);
};

/**
 * Functions (Fx)
 *
 * @author Menencia
 */
var Fx = {

	_openTab: function(url, selected){
		chrome.tabs.create({"url": url, "selected": selected});
		return false;
	},

	/**
	 * Concaténer plusieurs objets (notifications page)
	 */
	_concat: function(){
		var ret = {};
		var n = 0;
		for(var i=0; i<arguments.length; i++){
			for(var p in arguments[i]){
				if(arguments[i].hasOwnProperty(p) && n<10){
					ret[n] = arguments[i][p];
					n++;
				}
			}
		}
		return ret;
	},
	
	_subFirst: function(str,nbr){
		var strLength = str.length;
		var strSub = str.substring(0, nbr);
		if (strSub.length < strLength) strSub += '..';
		return strSub;
	},
	
	_subLast: function(str,nbr){
		var strLength = str.length;
		var strSub = str.substring(strLength, Math.max(0, strLength-nbr));
		if (strSub.length < strLength) strSub = '..'+strSub;
		return strSub;
	},
	
	_inArray: function(elem, array){
		for (var n in array) {
			if (array[n] == elem) {
				return true;
			}
		}
		return false;
	},
	
	_cleanCache: function(){
		var login = DB.get('member.login');
		var time = Math.floor(new Date().getTime() / 1000);
		var persistentViews = [
			'blog',
			'planningMember.'+login,
			'membersEpisodes',
			'timelineFriends',
			'membersNotifications',
			'membersInfos.'+login
		];
		for (var i in localStorage){
			if (i.indexOf('update.') == 0) {
				var suffix = i.substring(7);
				if (!this._inArray(suffix, persistentViews) && (time - localStorage[i] >= 3600)) {
					DB.remove('update.' + suffix);
					DB.remove('page.' + suffix);
				}
			}
		}
	}

};
