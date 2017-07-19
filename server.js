const express = require("express");
const app = express();

app.use(express.static("client"));

app.get("/", function (req, res) {
    res.redirect("visualize.html");
});

function random(min, max) {
    const f_min = Math.ceil(min);
    const f_max = Math.floor(max);
    const num = Math.floor(Math.random() * (f_max - f_min + 1)) + f_min;
    return num;
}

function randomFromList(list) {
    const index = random(0, list.length - 1);
    return list[index];
}

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
    const roll = random(1, 100);
    if (roll < 70) {
        metrics.response.status = "good";
        metrics.response.avg = random(4, 30);
    } else if (roll < 85) {
        metrics.response.status = "warn";
        metrics.response.avg = random(31, 100);
    } else {
        metrics.response.status = "bad";
        metrics.response.avg = random(101, 1000)
    }

    res.send(metrics);
});

app.get("/threats", function(req, res) {

    // generate the frame to hold the data
    const threats = {
        byType: [],
        byLocation: []
    }

    // group by type
    const byType = [];
    byType.push({ name: "DoS", count: random(-60, 30) })
    byType.push({ name: "HTTP Violation", count: random(-60, 30) })
    byType.push({ name: "IP Intelligence", count: random(-60, 30) })
    byType.push({ name: "Syn Cookies", count: random(-60, 30) })
    byType.push({ name: "SQL Injection", count: random(-60, 30) })
    byType.push({ name: "Buffer Overrun", count: random(-60, 30) })
    byType.push({ name: "Cross-Site Scripting", count: random(-60, 30) })
    byType.push({ name: "Session Hijacking", count: random(-60, 30) })
    byType.push({ name: "Brute Force", count: random(-60, 30) })
    byType.push({ name: "Port Mapping", count: random(-60, 30) })
    threats.byType = byType.filter((type) => { return type.count > 0 });

    // group by location
    const byLocation = [];
    byLocation.push({ name: "United States", count: random(-30, 30) })
    byLocation.push({ name: "China", count: random(-30, 30) })
    byLocation.push({ name: "France", count: random(-30, 30) })
    byLocation.push({ name: "Germany", count: random(-30, 30) })
    byLocation.push({ name: "United Kingdom", count: random(-30, 30) })
    byLocation.push({ name: "Russia", count: random(-30, 30) })
    byLocation.push({ name: "Ukraine", count: random(-30, 30) })
    byLocation.push({ name: "Hong Kong", count: random(-30, 30) })
    byLocation.push({ name: "Moldova", count: random(-30, 30) })
    byLocation.push({ name: "Albania", count: random(-30, 30) })
    threats.byLocation = byLocation.filter((location) => { return location.count > 0 });

    res.send(threats);
});

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

app.get("/logs", function(req, res) {
    const now = new Date();

    // NOTE: in a real implementation you would take into account:
    // scope

    // from date/time
    let from = req.query.from;
    if (Number.isInteger(from)) {
        from = new Date(from);
    } else {
        from = now - (24 * 60 * 60 * 1000);
    }

    // to date/time
    let to = req.query.to;
    if (Number.isInteger(to)) {
        to = new Date(to);
    } else {
        to = now;
    }

    // generate data
    const logs = [];
    for (let i = from; i < to; i += (60 * 1000)) {
        logs.push({
            status: randomFromList([ "allowed", "blocked" ]),
            rating: random(1, 5),
            time: i,
            srcIP: random(1, 255) + "." + random(1, 255) + "." + random(1, 255) + "." + random(1, 255),
            url: randomFromList([ "http://application.com/admin", "http://application.com/login", "https://application.com/dashboard", "https://application.com/dashboard?scope=month" ]),
            response: randomFromList([ 200, 200, 200, 200, 404, 500 ])
        });
    }

    res.send(logs);
});

app.listen(80, function () {
    console.log("Example app listening on port 80...");
});