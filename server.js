if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
const PORT = 3000;
const bcrypt = require("bcrypt");
const db = require("./db/index");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");

const initializePassport = require("./passport-config");
initializePassport(passport, getUserByEmail, getUserById);

async function getUserByEmail(email) {
    const userPromise = await db.db.query(
        "Select * from users where email=${email}",
        {
            email: email,
        }
    );
    return userPromise;
}

async function getUserById(id) {
    return await db.db.query("Select * from users where id=${id}", {
        id: id,
    });
}

app.set("view-engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(flash());
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
    })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));

app.get("/", checkAuthenticated, (req, res) => {
    res.render("index.ejs", { name: req.user.name });
});

app.get("/addFlash", checkAuthenticated, function (req, res) {
    req.flash("info", "Flash Message Added");
    res.render("flash_msg.ejs");
});

app.get("/login", checkNotAuthenticated, (req, res) => {
    res.render("login.ejs");
});

app.post(
    "/login",
    checkNotAuthenticated,
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/login",
        failureFlash: true,
    })
);

app.get("/register", checkNotAuthenticated, (req, res) => {
    res.render("register.ejs");
});

app.post("/register", checkNotAuthenticated, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const result = await db.db.none(
            "INSERT INTO users(id, name, email, password) VALUES(${id}, ${name}, ${email}, ${password})",
            {
                id: Date.now().toString(),
                name: req.body.name,
                email: req.body.email,
                password: hashedPassword,
            }
        );
        // if (result)  => should i wait on the promise returned?
        res.redirect("/login");
    } catch (e) {
        console.log(e);
        res.redirect("/register");
    }
});

app.delete("/logout", checkAuthenticated, (req, res, next) => {
    req.logOut(function (err) {
        if (err) {
            return next(err);
        }
        res.redirect("/login");
    });
});

function checkAuthenticated(req, res, next) {
    console.log(req.isAuthenticated());
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect("/");
    }
    next();
}

app.listen(PORT, () => console.log("Server Started!"));