const fs = require('fs');

//write line with 20 dashes to log.txt using fs.writeFile
fs.appendFile('./log.txt', '------------------------------------------------------------------------------------------------------\r\n', function (err) {
    if (err) throw err;
});

var logTypes = [{
    "type": "info",
    "color": 243,
    "level": 0
}]
var logSettings = {
    specification: 0,
    level: 0,
    print: false
};
// 0 Only message
// 1 Source
// 2 Location
// 3 Date and Time

exports.log = function (who, what) {
    var logLevel = 0;
    for (var x = 0; x < logTypes; x++) {
        if (logTypes[x].type == who) {
            logLevel = logTypes[x].level
        }
    }
    if (logLevel >= logSettings.level) {
        var finalLog = "\x1b[38;5;243m";

        //Create an error, so that line numbers etc can be found
        const e = new Error();
        const regex = /\((.*):(\d+):(\d+)\)$/
        const match = e.stack.split("\n")[2];
        lineNumber = {
            filepath: match.slice(match.lastIndexOf("\\") + 1, match.lastIndexOf(":", match.lastIndexOf(":") - 1)),
            line: match.slice(
                match.lastIndexOf(":", match.lastIndexOf(":") - 1) + 1,
                match.lastIndexOf(":")),
            column: match.slice(match.lastIndexOf(":") + 1)
        };
        //If lineNumber.column contains a ), remove it
        if (lineNumber.column.includes(")")) {
            lineNumber.column = lineNumber.column.slice(0, lineNumber.column.indexOf(")"))
        }


        //Get current time formatted
        var currentTime = new Date();
        var year = currentTime.getFullYear().toString();
        var month = (currentTime.getMonth() + 1).toString();
        if (month.length < 2) { month = "0" + month }
        var day = currentTime.getDate().toString();
        if (day.length < 2) { day = "0" + day }
        var hour = currentTime.getHours().toString();
        var minute = currentTime.getMinutes().toString();
        var second = currentTime.getSeconds().toString();
        var millisecond = currentTime.getMilliseconds().toString();

        //Add leading zero's
        if (second.length < 2) { second = "0" + second }
        if (minute.length < 2) { minute = "0" + minute }
        if (hour.length < 2) { hour = "0" + hour }

        if (millisecond.length < 2) { millisecond = "0" + millisecond }
        if (millisecond.length < 3) { millisecond = "0" + millisecond }

        if (logSettings.specification > 2) {
            finalLog += "[" + year + "/" + month + "/" + day + " " + hour + ":" + minute + ":" + second + ":" + millisecond + "] ";
        }

        if (logSettings.specification > 1) {
            finalLog += "[" + lineNumber.filepath + ":";
            if(lineNumber.line < 10){
                finalLog += "0";
            }
            if(lineNumber.line < 100){
                finalLog += "0";
            }
            if(lineNumber.line < 1000){
                finalLog += "0";
            }
            finalLog += lineNumber.line + ":";
            
            if(lineNumber.column < 10){
                finalLog += "0";
            }
            if(lineNumber.column < 100){
                finalLog += "0";
            }
            finalLog += lineNumber.column + "]\x1b[0m ";
            while (finalLog.length < 36) {
                finalLog += " "
            }
        }

        // Add color to message type
        var succes = true;



        if (logSettings.specification > 0) {
            for (var x = 0; x < logTypes.length; x++) {
                if (who == logTypes[x].type) {
                    finalLog += "\x1b[38;5;" + logTypes[x].color + "m[" + who + "] "
                    var endSpacers = 7 - logTypes[x].type.length;
                    for (var y = 0; y < endSpacers; y++) {
                        finalLog += " ";
                    }
                }
            }
        }
        finalLog += "\x1b[0m"

        finalLog += what

        if (succes) {
            console.log(finalLog)
        } else {
            //Incorrect log type
            console.log(("Warning, incorrect type logged at " + lineNumber.line))
            console.log(what)
            var temp = ""
            for (var x = 0; x < lineNumber.line.length; x++) {
                temp += "-"
            }
            console.log(("----------------------------------" + temp))
        }
        if (logSettings.print) {
            var logText = "";
            logText += "[" + year + "/" + month + "/" + day + " " + hour + ":" + minute + ":" + second + ":" + millisecond + "] "
            logText += "[" + lineNumber.filepath;
            logText += ":" + lineNumber.line;
            logText += ":" + lineNumber.column + "] ";
            logText += "[" + who + "] ";

            logText += what + "\r\n";

            fs.appendFile('./log.txt', logText, function (err) {
                if (err) throw err;
                // console.log('Saved!');
            });
        }
    }
}
/**
 * Set loging types (info, warning, error etc)
 * @method
 * @param {types} types 
 * @returns logTypes
 */
exports.setLogTypes = function (types) {
    logTypes = types
    return logTypes;
}

/**
 * Set log settings
 * @method
 * @param {number} specification 
 * @param {number} level 
 * @param {boolean} print 
 * @returns logSettings
 */
exports.setLogSettings = function (specification, level, print) {
    logSettings.specification = specification
    logSettings.level = level
    logSettings.print = print
    return logSettings;
}