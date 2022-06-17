console.clear();

// Setup system
const fs = require('fs');

// Setup express
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

// Setup Socket.io
const { Server } = require("socket.io");
const io = new Server(server);
const port = process.env.PORT || 3000;

// Setup connection to MongoDB Database
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://37.97.188.94:27017/";

// Setup Email
const nodemailer = require('nodemailer');

var renderedFrontPage = "";

var dbo;
MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    dbo = db.db("swdb");
});

// On page request
app.get('/', function (req, res) { // Front page
    // Get required database data
    if (renderedFrontPage.length == 0) {
        dbo.collection("events").find({}).toArray(function (err, result) {
            // Send generated HTML file through generateHTML()
            res.send(generateHTML("index.html", result));
        });
    } else {
        res.send(renderedFrontPage);
    }
});
app.get('/events/:id', function (req, res) {

    // Get required database data
    var eventID = req.url.slice(8);
    dbo.collection("events").find({ StagerID: eventID }).toArray(function (err, result) {
        res.send(generateHTML("event.html", result));
        console.log("/events/" + eventID);
    });

});

app.get("/info", function (req, res) {
    res.sendFile(__dirname + "/www/info.html");
});
app.get("/joinus", function (req, res) {
    res.sendFile(__dirname + "/www/joinus.html");
});
app.get("/contact", function (req, res) {
    res.sendFile(__dirname + "/www/contact.html");
})

app.get("/go/:id", function(req, res){
    var id = req.params.id;
    console.log("param: " + id);
    for (var x = 0; x < directURLS.length; x++) {
        if (directURLS[x].url == id) {
            res.redirect("/events/" + directURLS[x].id);
            return;
        }
    }
    res.redirect("/");
});

app.use(express.static(__dirname + '/www/public'));

io.on('connection', (socket) => {

    console.log('a user connected');

    socket.on("newMessage", (data) => {
        console.log(data);

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

    });

});

server.listen(3000, () => {
    console.log('listening on *:3000');
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
        console.log("Found link");
        var link = discriptionTemp.match(/\[(.*?)\]\((.*?)\)/);
        var linkText = link[1];
        var linkURL = link[2];

        console.log(linkText);
        console.log(linkURL);

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
        console.log(directURLS);
    });
}


setTimeout(function () {
    updateDirectUrl()
}, 500);





    // dbo.collection("events").find({}).toArray(function (err, result) {
    //     if (err) throw err;
    //     console.log(result);
    // });
