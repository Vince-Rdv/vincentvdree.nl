console.clear();

// Setup system
const fs = require('fs');

// Setup express
const express = require('express')
const app = express()
const port = 3000

// Setup connection to MongoDB Database
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://37.97.188.94:27017/";

var dbo;
MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    dbo = db.db("swdb");
});

// On page request
app.get('*', (req, res) => {


    if (req.url == '/' || req.url == "/index" || req.url == "/index.html") {
        // Get required database data
        dbo.collection("events").find({}).toArray(function (err, result) {
            // Send generated HTML file through generateHTML()
            res.send(generateHTML("index.html", result));
            console.log("/index.html");
        });
    } else if (req.url.indexOf("/events/") > -1) {
        // Get required database data
        var eventID = req.url.slice(8);
        dbo.collection("events").find({ StagerID: eventID }).toArray(function (err, result) {
            res.send(generateHTML("event.html", result));
            console.log("/events/" + eventID);
        });
    } else {
        // See if URL is in directURL Array
        var inDirectURL = false;
        for (var x = 0; x < directURLS.length; x++) {
            if ("/" + directURLS[x].url == req.url) {
                res.send("<script>window.location.href = '/events/" + directURLS[x].id + "'</script>");
                inDirectURL = true;
                break;
            }
        }

        if (!inDirectURL) {
            //See if file exists as static file
            fs.access(__dirname + "/www/public/" + req.url, fs.F_OK, (err) => {
                if (err) {
                    // If not, send 404
                    res.sendFile(__dirname + "/www/404.html");
                    console.log("404: " + req.url);
                    return
                }

                res.sendFile(__dirname + '/www/public/' + req.url);
            });

        }
    }




});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

function generateHTML(htmlFile, result) {

    var html = fs.readFileSync(__dirname + '/www/' + htmlFile, 'utf8');

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
    if (html.includes("<vtag eventpage_image>")) { html = html.replace("<vtag eventpage_image>", result[0].StagerID); }
    if (html.includes("<vtag eventpage_date>")) { html = html.replace("<vtag eventpage_date>", result[0].Date); }
    if (html.includes("<vtag eventpage_door>")) { html = html.replace("<vtag eventpage_door>", result[0].Doors_open); }
    if (html.includes("<vtag eventpage_start>")) { html = html.replace("<vtag eventpage_start>", result[0].Program_Start); }
    if (html.includes("<vtag eventpage_end>")) { html = html.replace("<vtag eventpage_end>", result[0].Program_End); }
    if (html.includes("<vtag eventpage_discription>")) { html = html.replace("<vtag eventpage_discription>", result[0].Text.replaceAll("\n", "<br>")); }





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
}, 3000);





    // dbo.collection("events").find({}).toArray(function (err, result) {
    //     if (err) throw err;
    //     console.log(result);
    // });
