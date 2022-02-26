var debug = true;

var highestPoint = 0;
var scaleWarp = 1;
var moveWarp = 40;

var segments = [[]];
var tracers = [];
let c;
const btn = document.querySelector('button'),
  chunks = [];
function record() {
  chunks.length = 0;
  let stream = document.querySelector('canvas').captureStream(30),
    recorder = new MediaRecorder(stream);
  recorder.ondataavailable = e => {
    if (e.data.size) {
      chunks.push(e.data);
    }
  };
  recorder.onstop = exportVideo;
  btn.onclick = e => {
    recorder.stop();
    btn.textContent = 'start recording';
    btn.onclick = record;
  };
  recorder.start();
  btn.textContent = 'stop recording';
}
function exportVideo(e) {
  var blob = new Blob(chunks);
  var vid = document.createElement('video');
  vid.id = 'recorded'
  vid.controls = true;
  vid.src = URL.createObjectURL(blob);
  document.body.appendChild(vid);
  vid.play();
}
btn.onclick = record;

var x, y;
function setup() {
  x = width / 2;
  y = height;
  c = createCanvas(1920, 1080)
  for (var x = 0; x < coords.length; x++) {
    if (coords[x][1] > highestPoint) {
      highestPoint = coords[x][1];
    }
  }
  scaleWarp = (height - 80) / (highestPoint)
  for (var x = 0; x < coords.length; x++) {
    coords[x][0] = (coords[x][0] * scaleWarp) + moveWarp
    coords[x][1] = (coords[x][1] * scaleWarp) + moveWarp
  }
  for (var x = 0; x < coords.length; x++) {
    if (x > 0) {
      if (dist(coords[x][0], coords[x][1], coords[x - 1][0], coords[x - 1][1]) > 10) {
        console.log("Segment!")
        segments.push([coords[x]])
      } else {
        segments[segments.length - 1].push(coords[x])
      }
    }
  }
  for (var i = 0; i < segments.length; i++) {
    tracers.push(new Tracer(i, 0, 0.3, 0.4, 4, 255))
    tracers.push(new Tracer(i, 0.5, 0.7, 0.8, 4, 255))
  };
  // tracers.push(new Tracer(1, 0, 0.3, 0.4, 4, 255))
  // tracers.push(new Tracer(segments.length - 1, 0.5, 0.7, 0.8, 4, 255))
}

function draw() {
  background(color(27, 96, 128))
  textAlign(CENTER);
  stroke(color(255, 80))
  strokeWeight(3);
  textSize(64)

  for (var i = 0; i < tracers.length; i++) {
    tracers[i].update();
    tracers[i].show();
  }
}

function Tracer(segment, startIndex, startThickIndex, endIndex, speed, c) {
  this.segmentLength = segments[segment].length;

  this.segment = segment;
  this.startIndex = this.segmentLength * startIndex;
  this.startThickIndex = this.segmentLength * startThickIndex;
  this.endIndex = this.segmentLength * endIndex;
  this.color = c;
  this.speed = speed;

  this.update = function () {
    this.startIndex += this.speed;
    this.startThickIndex += this.speed;
    this.endIndex += this.speed;
  }

  this.show = function () {
    noFill();
    beginShape()
    for (var x = Math.round(this.startIndex); x < Math.round(this.endIndex); x++) {
      var xModSegmentLength = x % this.segmentLength
      var shifter = -frameCount;
      while (shifter + segments[this.segment][xModSegmentLength][0] < -100) {
        shifter += 3150
      }
      var lineD = segments[this.segment][(x + 1) % this.segmentLength][1];
      var lineC = segments[this.segment][(x + 1) % this.segmentLength][0] + shifter
      var lineB = segments[this.segment][xModSegmentLength][1];
      var lineA = segments[this.segment][xModSegmentLength][0] + shifter;
      if (debug) {
        stroke(color(255, 255))
        // line(lineA, lineB, lineC, lineD)
        
        if(lineA > -10 && lineA < 2000){
          vertex(lineA, lineB)
        }
      } else if (x > this.startThickIndex) {
        strokeWeight(25);
        stroke(color(255, 10))
        line(lineA, lineB, lineC, lineD)
        stroke(color(255, 30))
        strokeWeight(13);
        line(lineA, lineB, lineC, lineD)
        stroke(color(255, 80))
        strokeWeight(5);
        line(lineA, lineB, lineC, lineD)

        stroke(color(255, 255))
        line(lineA, lineB, lineC, lineD)
        if(dist(lineA, lineB, lineC, lineD) > 10){
          endShape();
          beginShape();
        }
        vertex(lineA, lineB)
      } else {
        strokeWeight(10);
        stroke(color(255, 10))
        line(lineA, lineB, lineC, lineD)
        stroke(color(255, 80))
        strokeWeight(3);
        line(lineA, lineB, lineC, lineD)
        vertex(lineA, lineB)
      }
    }
    endShape();
  }
}