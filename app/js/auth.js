var Auth = Auth || {};

Auth.isLogged = function(){
	return (this.db.get('session', null) != null);
};