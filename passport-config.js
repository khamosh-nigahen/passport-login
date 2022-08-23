const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

function initialize(passport, getUserByEmail, getUserById) {
    console.log('initialize func');
    const authenticateUser = async (email, password, done) => {
        const user = await getUserByEmail(email);
        console.log(user)
        if (user == null || user.length === 0) {
            return done(null, false, { message: "No User with that Email. Please register first." });
        }

        try {
            if (await bcrypt.compare(password, user[0].password)) {
                console.log("bcrypt passed");
                return done(null, user[0]);
            } else {
                return done(null, false, { message: "Password incorrect" });
            }
        } catch (e) {
            return done(e);
        }
    };

    passport.use(new LocalStrategy({usernameField: 'email'}, authenticateUser));
    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser(async (id, done) => {
        return done(null, await getUserById(id))
    })
}

module.exports = initialize;
