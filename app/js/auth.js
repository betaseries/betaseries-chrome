var Auth = Auth || {};

Auth.isLogged = function(){
	return (DB.get('session', null) != null);
};