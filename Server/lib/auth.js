const auth = {
    isLoggedIn(req, res, next) {
        if (req.isAuthenticated()) { // Este método defuelve un bool que devuelve true si la session del usuario existe
            return next();
        }
        return res.redirect('/login');
    },

    isNotLoggedIn(req, res, next) {
        if (!req.isAuthenticated()) {
            return next();
        }
        return res.redirect('/inicio');
    },

    isBecario(req, res, next) {
        if(req.user.licencia == 2){
            return next();
        }
        console.log('no es becario');
        return res.redirect('/inicio');
    }, 

    isUser(req, res, next) {
        if(req.user.licencia == 1){
            return next();
        }
        if(req.user.licencia == 2)
        return res.redirect('/dashboard');
    },
    isLinea (req, res, next) {
        if(req.user.licencia == 3){
            return next();
        }
        return res.redirect('/login');
    },

    chooseIndex (req) {
        if(req.user.licencia == 2){
            return true;
        }
        return false;
    }


}



export default auth;