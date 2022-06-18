console.clear();

console.log("                                                                                                ")
console.log("                     #######                                                                    ")
console.log("                 ##############                                                                 ")
console.log("              ####################                                                              ")
console.log("             ######################                                                             ")
console.log("           #####      ###       #####   ##      ## ##     ##    ###    ######## ##              ")
console.log("          #####  ####  #  #####  #####  ##  ##  ## ##     ##   ## ##      ##    ##              ")
console.log("          #####  #######  #####  #####  ##  ##  ## ##     ##  ##   ##     ##    ##              ")
console.log("          ######      ##  #####  #####  ##  ##  ## ######### ##     ##    ##    ##              ")
console.log("          ###########  #  #####  #####  ##  ##  ## ##     ## #########    ##    ##              ")
console.log("          #####  ####  #  #####  #####  ##  ##  ## ##     ## ##     ##    ##                    ")
console.log("           #####      ###       #####    ###  ###  ##     ## ##     ##    ##    ##              ")
console.log("             ######################                                                             ")
console.log("              ####################                                                              ")
console.log("                 ##############                                                                 ")
console.log("                     #######                                                                    ")
console.log("                                                                                                ")
console.log("                         ##     ##    ##         #####         #####                            ")
console.log("                         ##     ##  ####        ##   ##       ##   ##                           ")
console.log("                         ##     ##    ##       ##     ##     ##     ##                          ")
console.log("                         ##     ##    ##       ##     ##     ##     ##                          ")
console.log("                          ##   ##     ##       ##     ##     ##     ##                          ")
console.log("                           ## ##      ##   ###  ##   ##  ###  ##   ##                           ")
console.log("                            ###     ###### ###   #####   ###   #####                            ")
console.log("                                                                                                ")
console.log("   ##    #######        ##   #####    #######        ##  #######    #####    #######   #######  ")
console.log(" ####   ##     ##      ##   ##   ##  ##     ##      ##  ##     ##  ##   ##  ##     ## ##     ## ")
console.log("   ##   ##     ##     ##   ##     ## ##            ##          ## ##     ##        ##        ## ")
console.log("   ##    #######     ##    ##     ## ########     ##     #######  ##     ##  #######   #######  ")
console.log("   ##   ##     ##   ##     ##     ## ##     ##   ##     ##        ##     ## ##        ##        ")
console.log("   ##   ##     ##  ##       ##   ##  ##     ##  ##      ##         ##   ##  ##        ##        ")
console.log(" ######  #######  ##         #####    #######  ##       #########   #####   ######### ######### ")
console.log("                                                                                                ")

// Setup VLogger
// Import vlog.js (private library)
const vlog = require("./vlog.js");
vlog.setLogSettings(3, 0, true);
vlog.setLogTypes(logTypes = [{
    "type": "info",
    "color": 248,
    "level": 0
}, {
    "type": "log",
    "color": 248,
    "level": 0
}, {
    "type": "server",
    "color": 27,
    "level": 0
}, {
    "type": "socket",
    "color": 208,
    "level": 0
}])
const log = vlog.log;
log("info", "VLog Booted Up");


// Setup system
log("info", "FS Trying to Load");
const fs = require('fs');
log("info", "FS Succesfully Loaded");

// Setup express
log("info", "Express Trying to load");
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
log("info", "Express Succesfully Loaded");

// Setup Socket.io
log("info", "Socket.io Trying to load");
const { Server } = require("socket.io");
const io = new Server(server);
const port = process.env.PORT || 3000;
log("info", "Socket.io Succesfully Loaded");

// Setup connection to MongoDB Database
log("info", "MongoDB Trying to load");
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://37.97.188.94:27017/";

var dbo;

MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    dbo = db.db("swdb");
});
log("info", "MongoDB Succesfully Loaded");

var renderedFrontPage = "";



// On page request
log("info", "Express Creating routing requests");
app.get('/', function (req, res) { // Front page
    log("info", "Requested the front page");
    // Get required database data
    if (renderedFrontPage.length == 0) {
        dbo.collection("events").find({}).toArray(function (err, result) {
            // Send generated HTML file through generateHTML()
            res.send(generateHTML("index.html", result));
            log("info", "Succesfully loaded events and returned the front page");
        });
    } else {
        res.send(renderedFrontPage);
        log("info", "Already have a rendered front page, returning the front page");
    }
});
app.get('/events/:id', function (req, res) {
    log("info", "Requested an event page");
    // Get required database data
    var eventID = req.url.slice(8);
    dbo.collection("events").find({ StagerID: eventID }).toArray(function (err, result) {
        res.send(generateHTML("event.html", result));
        log("info", "Succesfully send the " + result[0].Name + " page");
    });

});

app.get("/info", function (req, res) {
    log("info", "Requested the info page");
    res.sendFile(__dirname + "/www/info.html");
    log("info", "Succesfully returned the info page");
});
app.get("/joinus", function (req, res) {
    log("info", "Requested the join us page");
    res.sendFile(__dirname + "/www/joinus.html");
    log("info", "Succesfully returned the join us page");
});
app.get("/contact", function (req, res) {
    log("info", "Requested the contact page");
    res.sendFile(__dirname + "/www/contact.html");
    log("info", "Succesfully returned the contact page");
})

app.get("/go/:id", function (req, res) {
    log("info", "Requested the direct link");
    var id = req.params.id;
    for (var x = 0; x < directURLS.length; x++) {
        if (directURLS[x].url == id) {
            res.redirect("/events/" + directURLS[x].id);
            log("info", "Succesfully redirected to the event page");
            return;
        }
    }
    res.redirect("/");
});

app.use(express.static(__dirname + '/www/public'));

io.on('connection', (socket) => {
    log("info", "A new user connected through Socket.io");
    socket.on("newMessage", (data) => {

        log("info", "Got a new message from a user");
        // TODO Setup email server

        fs.writeFile(__dirname + "/IncommingMessages.txt",
            "Van:      " + data.name +
            "\nEmail:    " + data.email +
            "\nTelefoon: " + data.telefoon +
            "\nCommisie: " + data.commisie +
            "\n\nBericht:\n" + data.bericht +
            "\n\n-----\n\n", { flag: 'a' }, function (err) {
                if (err) throw err;
            });

        socket.emit("newMessageResponse", { succes: true })
        log("info", "Handelled new message");
    });

});

server.listen(3000, () => {
    log("info", "Listening on port *:" + port);
});

function generateHTML(htmlFile, result) {

    var html = "";

    html = fs.readFileSync(__dirname + '/www/' + htmlFile, 'utf8');

    if (html.includes("<vtag mainpage_events>")) {

        var returnString = "";
        for (var x = 0; x < result.length; x++) {
            returnString += '<a href="/events/' + result[x].StagerID + '" class="tsml">';
            returnString += '<div class="event-card">';
            returnString += '<img src="/EventImages/' + result[x].StagerID + '.jpg" />';
            returnString += '<h1>' + result[x].Name + '</h1>';
            returnString += '<p>' + result[x].Subtitle + '</p>';
            returnString += '</div>';
            returnString += "</a>";
        }
        html = html.replace("<vtag mainpage_events>", returnString);
    }

    if (html.includes("<vtag eventpage_title>")) { html = html.replace("<vtag eventpage_title>", result[0].Name); }
    if (html.includes("<vtag eventpage_subtitle>")) { html = html.replace("<vtag eventpage_subtitle>", result[0].Subtitle); }
    if (html.includes("<vtag eventpage_image>")) { html = html.replace("<vtag eventpage_image>", result[0].StagerID); }
    if (html.includes("<vtag eventpage_date>")) { html = html.replace("<vtag eventpage_date>", result[0].Date); }
    if (html.includes("<vtag eventpage_door>")) { html = html.replace("<vtag eventpage_door>", result[0].Doors_open); }
    if (html.includes("<vtag eventpage_start>")) { html = html.replace("<vtag eventpage_start>", result[0].Program_Start); }
    if (html.includes("<vtag eventpage_end>")) { html = html.replace("<vtag eventpage_end>", result[0].Program_End); }
    var discriptionTemp = result[0].Text.replaceAll("\n", "<br>");
    while (discriptionTemp.match(/\[(.*?)\]\((.*?)\)/)) { // Find all links

        var link = discriptionTemp.match(/\[(.*?)\]\((.*?)\)/);
        var linkText = link[1];
        var linkURL = link[2];

        discriptionTemp = discriptionTemp.replace("[" + linkText + "](" + linkURL + ")", "<a href='" + linkURL + "'>" + linkText + "</a>");
    }
    while (discriptionTemp.match("---")) {
        discriptionTemp = discriptionTemp.replace("---", "</p><hr><p>");
    }
    if (html.includes("<vtag eventpage_discription>")) { html = html.replace("<vtag eventpage_discription>", discriptionTemp); }


    if (htmlFile == "index.html") {
        renderedFrontPage = html;
        setTimeout(function () {
            renderedFrontPage = "";
        }, 1000 * 60 * 15)
    }
    return html;
}



var directURLS = [];
function updateDirectUrl() {
    dbo.collection("events").find({}).toArray(function (err, result) {
        for (var x = 0; x < result.length; x++) {
            directURLS.push({
                'url': result[x].URL_Name,
                'id': result[x].StagerID
            });
        }
    });
}


setTimeout(function () {
    updateDirectUrl()
}, 500);