
// includes
const config = require("config");
const express = require("express");
const crypto = require("crypto");
const cookieParser = require("cookie-parser");
const qs = require("querystring");
const adal = require("adal-node");
const nJwt = require("njwt");
const request = require("request");

// create the web server
const app = express();
app.use(cookieParser());
app.use(express.static("client"));
express.request.accessToken = function() {
    if (this.cookies.accessToken) return this.cookies.accessToken;
    if (this.get("Authorization")) return this.get("Authorization").replace("Bearer ", "");
    return null;
}

// globals
const authority = config.get("authority");
const clientId = config.get("clientId");
const clientSecret = config.get("clientSecret");
const resource = config.get("resource");
const redirectUri = config.get("redirectUri");
const jwtKey = config.get("jwtKey");
const issuer = config.get("issuer");
const groupPrefix = config.get("groupPrefix");

// user-defined functions
function random(min, max) {
    const f_min = Math.ceil(min);
    const f_max = Math.floor(max);
    const num = Math.floor(Math.random() * (f_max - f_min + 1)) + f_min;
    return num;
}

function randomFromListToArray(list, count) {
    const output = [];
    while (output.length < count) {
        const index = random(0, list.length - 1);
        const value = list[index];
        if (output.indexOf(value) < 0) output.push(value);
    }
    return output;
}

function randomFromList(list) {
    const index = random(0, list.length - 1);
    return list[index];
}

function randomResponseTime() {
    const roll = random(1, 100);
    if (roll < 70) {
        return {
            category: "good",
            time: random(4, 30)
        };
    } else if (roll < 85) {
        return {
            category: "warn",
            time: random(31, 100)
        };
    } else {
        return {
            category: "bad",
            time: random(101, 1000)
        };
    }
}

String.prototype.toArrayOfStrings = function() {
    return this.split(",").map((code) => {
        return code.trim();
    });
}

String.prototype.toArrayOfIntegers = function() {
    return this.split(",").map((code) => {
        code = code.trim();
        return (isNaN(code)) ? null : parseInt(code);
    }).filter((code) => {
        return (code != null);
    });
}

Array.prototype.hasIntersection = function(arr) {
    if (this.length < 1 || arr.length < 1) return false;

    for (let i = 0; i < this.length; i++) {
        const src = this[i];
        const found = arr.filter(dst => { return src == dst }); // so the comparison isn't type-specific
        if (found.length > 0) return true;
    }

    return false;
}

// >40, <30, etc.
Array.prototype.isMatchWithAll = function(val) {
    if (this.length < 1) return false;

    const filtered = this.filter(item => {
        let num = item.substring(1);
        if (isNaN(num)) return false;
        num = parseInt(num);
        switch (item.substring(0, 1)) {
            case ">":
                return (val > num);
            case "<":
                return (val < num);
            default:
                return false;
        }
    });

    return (filtered.length === this.length);
}

// get a list of all applications
app.get("/applications", function(req, res) {

console.log("token: " + req.accessToken());

    const apps = [];

    const count = random(5, 9);
    for (let i = 0; i < count; i++) {

        // generate the frame
        const app = {
            name: "Application " + (i + 1),
            protection: {
                allowed: random(10000, 20000),
                blocked: random(0, 15000),
                status: "unknown"
            },
            availability: {
                success: random(10000, 20000),
                fail: random(0, 1500),
                status: "unknown"
            },
            response: {
                avg: 0,
                status: "unknown"
            }
        };

        // assign protection status
        if (app.protection.blocked > app.protection.allowed) {
            app.protection.status = "bad";
        } else if (app.protection.blocked > (app.protection.allowed / 2)) {
            app.protection.status = "warn";
        } else {
            app.protection.status = "good";
        }

        // assign availability status
        const availability = app.availability.success / (app.availability.success + app.availability.fail);
        if (availability > 0.95) {
            app.availability.status = "good";
        } else if (availability > 0.90) {
            app.availability.status = "warn";
        } else {
            app.availability.status = "bad";
        }

        // generate a response time
        const response = randomResponseTime();
        app.response.status = response.category;
        app.response.avg = response.time;

        apps.push(app);
    }

    res.send(apps);
});

// get a list of all metrics
app.get("/metrics", function(req, res) {

    // generate the frame to hold the data
    const metrics = {
        protection: {
            allowed: 0,
            blocked: 0,
            status: "unknown"
        },
        availability: {
            success: 0,
            fail: 0,
            status: "unknown"
        },
        response: {
            avg: 0,
            status: "unknown"
        }
    };

    // generate protection
    metrics.protection.allowed = random(10000, 20000);
    metrics.protection.blocked = random(0, 15000);
    if (metrics.protection.blocked > metrics.protection.allowed) {
        metrics.protection.status = "bad";
    } else if (metrics.protection.blocked > (metrics.protection.allowed / 2)) {
        metrics.protection.status = "warn";
    } else {
        metrics.protection.status = "good";
    }

    // generate availability
    metrics.availability.success = random(10000, 20000);
    metrics.availability.fail = random(0, 1500);
    const availability = metrics.availability.success / (metrics.availability.success + metrics.availability.fail);
    if (availability > 0.95) {
        metrics.availability.status = "good";
    } else if (availability > 0.90) {
        metrics.availability.status = "warn";
    } else {
        metrics.availability.status = "bad";
    }

    // generate a range of response times
    const response = randomResponseTime();
    metrics.response.status = response.category;
    metrics.response.avg = response.time;

    res.send(metrics);
});

// get a list of all threats
app.get("/threats", function(req, res) {

    // generate the frame to hold the data
    const threats = {
        byType: [],
        byCountry: []
    }

    // group by type
    listOfViolations().forEach(category => {
        category.violations.forEach(violation => {
            if (random(1, 4) === 1) { // only generate some
                threats.byType.push(violation);
            }
        });
    });

    // group by location
    listOfCountries().forEach(country => {
        if (random(1, 2) === 1) { // only generate some
            country.count = random(1, 30);
            threats.byCountry.push(country);
        }
    });

    res.send(threats);
});

// get all the traffic data
app.get("/traffic", function(req, res) {

    // generate the frame to hold the data
    const traffic = {
        timeframe: [],
        rps: {
            http: [],
            https: []
        },
        in: {
            http: [],
            https: []
        },
        out: {
            http: [],
            https: []
        }
    };

    // generate the timeframe (past hour)
    const coeff = 1000 * 60 * 1; // round to nearest min
    const now = new Date(Math.round(new Date().getTime() / coeff) * coeff);
    for (let i = 60; i > 0; i--) {
        const slice = now - (i * 60 * 1000); // -60 min, -59 min, ...
        traffic.timeframe.push(slice);
    }

    // randomize the data
    const randomize = (min, max, count) => {
        const data = [];
        for (let i = 0; i < count; i++) {
            data.push(random(min, max));
        }
        return data;
    };
    traffic.rps.http = randomize(14, 20, 60);
    traffic.rps.https = randomize(14, 20, 60);
    traffic.in.http = randomize(15000, 20000, 60);
    traffic.in.https = randomize(15000, 20000, 60);
    traffic.out.http = randomize(150000, 200000, 60);
    traffic.out.https = randomize(150000, 200000, 60);

    res.send(traffic);
});

// get the list of violations
function listOfViolations() {
    const violations = [];

    for (let i = 0; i < 6; i++) {
        const cid = (i + 1);
        const category = {
            id: cid,
            name: "Violation Category " + cid,
            violations: []
        };
        for (let j = 0; j < 4; j++) {
            const tid = (cid + ((j + 1) / 10));
            const type = {
                id: tid,
                name: "Violation Type " + tid,
                mode: randomFromList([ "off", "learn", "block" ]),
                count: random(0, 1000)
            };
            category.violations.push(type);
        }
        violations.push(category);
    }

    return violations;
}

app.get("/violations", function(req, res) {
    res.send(listOfViolations());
});

// get the list of all countries
function listOfCountries() {
    return [
        { id: "us", name: "United States" },
        { id: "cn", name: "China" },
        { id: "fr", name: "France" },
        { id: "de", name: "Germany" },
        { id: "gb", name: "United Kingdom" },
        { id: "ru", name: "Russia" },
        { id: "ua", name: "Ukraine" },
        { id: "hk", name: "Hong Kong" },
        { id: "md", name: "Moldova" },
        { id: "al", name: "Albania" }
    ];
}

app.get("/countries", function(req, res) {
    res.send(listOfCountries());
});

// get all specific logs
app.get("/logs", function(req, res) {
    const now = new Date();

    // status
    const status = req.query.status;

    // violations
    let violations = req.query.violations;
    if (violations) violations = violations.toArrayOfStrings();

    // response code
    let responseCode = req.query.responseCode;
    if (responseCode) responseCode = responseCode.toArrayOfIntegers();

    // response time
    let responseTime = req.query.responseTime;
    if (responseTime) responseTime = responseTime.toArrayOfStrings();

    // from date/time
    let from = req.query.from;
    if (isNaN(from)) {
        from = now - (24 * 60 * 60 * 1000);
    } else {
        from = parseInt(from);
    }

    // to date/time
    let to = req.query.to;
    if (isNaN(to)) {
        to = now;
    } else {
        to = parseInt(to);
    }

    // country
    let country = req.query.country;
    if (country) country = country.toArrayOfStrings();

    // generate a list of violations
    const violations_list = listOfViolations().reduce((output, category) => {
        category.violations.forEach(violation => {
            output.push(violation.id);
        });
        return output;
    }, []);

    // generate data
    const logs = [];
    for (let i = from; i < to; i += (60 * 1000)) {
        const _status = randomFromList([ "allowed", "blocked" ]);
        const _violations = (_status === "blocked") ? randomFromListToArray(violations_list, random(1, 3)) : [];
        const _rating = (status === "allowed") ? 0 : random(1, 5);
        const _response = randomResponseTime();
        const _responseCode = randomFromList([ 200, 200, 200, 200, 404, 500 ]);
        const _country = randomFromList(listOfCountries());
        const _supportId = "00000000" + random(1, 99999999);
        if (
            (!status || status == _status) &&
            (!violations || violations.hasIntersection(_violations)) &&
            (!responseCode || responseCode.indexOf(_responseCode) > -1) &&
            (!responseTime || responseTime.isMatchWithAll(_response.time)) &&
            (!country || country.indexOf(_country.id) > -1)
        ) {
            logs.push({
                status: _status,
                violations: _violations,
                rating: _rating,
                time: i,
                srcIP: random(1, 255) + "." + random(1, 255) + "." + random(1, 255) + "." + random(1, 255),
                countryId: _country.id,
                country: _country.name,
                url: randomFromList([ "http://application.com/admin", "http://application.com/login", "https://application.com/dashboard", "https://application.com/dashboard?scope=month" ]),
                responseCode: _responseCode,
                responseCategory: _response.category,
                responseTime: _response.time,
                securityPolicy: randomFromList([ "security_policy_1.1", "security_policy_1.2", "security_policy_1.3" ]),
                supportId: _supportId.substr(_supportId.length - 8),
                severity: (_status === "blocked") ? "Error" : "OK",
                username: randomFromList([ "N/A", "N/A", "N/A", "N/A", "pelasne", "haroldw" ]),
                sessionId: randomFromList([ "a3309aacb2d105a1", "c47e148k49d9fh4s", "3k32jcc88841383a", "ejfjcjvv1347dkv3" ]),
                dstIP: "10.0.0." + random(1, 255)
            });
        }
    }

    res.send(logs);
});

// redirect through the AAD consent pattern
function consent(res, add) {
    crypto.randomBytes(48, function(err, buf) {
        if (err) {
            res.status(500).send("Server Error: a crypto token couldn't be created to secure the session.");
        } else {
            const token = buf.toString("base64").replace(/\//g, "_").replace(/\+/g, "-");
            res.cookie("authstate", token);
            const url = authority + "/oauth2/authorize?response_type=code&client_id=" + qs.escape(clientId) + "&redirect_uri=" + qs.escape(redirectUri) + "&state=" + qs.escape(token) + "&resource=" + qs.escape(resource) + add;
            res.redirect(url);
        }
    });
}

// a login with administrative consent
app.get("/consent", function(req, res) {
    consent(res, "&prompt=admin_consent");
});

// a login with user consent (if the admin has already consented there is no additional consent required)
app.get("/login", function(req, res) {
    consent(res, "");
});

// once a user has authenticated, generate their authorization token
app.get("/token", function(req, res) {
    
    // ensure this is all part of the same authorization chain
    if (req.cookies.authstate !== req.query.state) {
        res.status(400).send("Bad Request: this does not appear to be part of the same authorization chain.");
    } else {
    
        // get authorization for the Microsoft Graph
        const context = new adal.AuthenticationContext(authority);
        context.acquireTokenWithAuthorizationCode(req.query.code, redirectUri, resource, clientId, clientSecret, function(tokenError, tokenResponse) {
            if (!tokenError) {

                // get the user membership
                request.get({
                    uri: "https://graph.microsoft.com/v1.0/me/memberOf?$select=displayName",
                    headers: {
                        Authorization: "Bearer " + tokenResponse.accessToken
                    },
                    json: true
                }, function(membershipError, response, body) {
                    if (!membershipError && response.statusCode == 200) {

                        // build a list of group names
                        const membership = [];
                        body.value.forEach(group => {
                            if (group.displayName.startsWith(groupPrefix)) {
                                membership.push(group.displayName.replace(groupPrefix, ""));
                            }
                        });

                        // define rights
                        const rights = [];
                        if (membership.indexOf("admins") > -1) {
                            rights.push("admin");
                            rights.push("write");
                            rights.push("read");
                        } else if (membership.indexOf("users") > -1) {
                            rights.push("read");
                        }

                        // build the claims
                        const claims = {
                            iss: issuer,
                            sub: tokenResponse.userId,
                            scope: membership,
                            rights: rights
                        };

                        // build the JWT
                        const duration = 4 * 60 * 60 * 1000; // 4 hours
                        const jwt = nJwt.create(claims, jwtKey);
                        jwt.setExpiration(new Date().getTime() + duration);

                        // set the JWT into a cookie and redirect
                        res.cookie("accessToken", jwt.compact(), {
                            maxAge: duration
                        });
                        res.redirect("/applications.html");

                    } else {
                        res.status(401).send("Unauthorized (membership): " + ((membershipError) ? membershipError : response.statusCode + ", " + body));
                    }
                });

            } else {
                res.status(401).send("Unauthorized (access code): " + tokenError);
            }
        });

    }
 
});

// redirect to default page
app.get("/", function (req, res) {
    res.redirect("/default.html");
});

// start the web server listening on port 80
app.listen(80, function () {
    console.log("Example app listening on port 80...");
});