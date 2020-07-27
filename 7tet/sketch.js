const N = 7;
const T = 60;
const SIZE = 50;
const OSCWIDTH = 2;
const SPACING = 60;
const BUMPWIDTH = SPACING * OSCWIDTH;
const VOLUME = 0.1;
const PRECISION = 7;
let oscs = [];

function bump(y) {
  var y = abs(y);
  if (y > 1) {
    return 0;
  }
  // smootherstep
  return 1 - y*y*y*(y*(6*y - 15) + 10);
}

function balanced_ternary(x) {
  var x = floor(x * pow(3, PRECISION));
  let digits = [];
  while (x > 0) {
      let digit = [0,1,-1][x%3];
      digits.push(digit);
    x -= digit;
    x /= 3;
  }
  return digits;
}

function setup() {
  createCanvas(720, 720, WEBGL);
  angleMode(DEGREES);
  colorMode(HSB, 100);
  for (let i = -OSCWIDTH; i <= OSCWIDTH; i++) {
    let osc = new p5.Oscillator('sine');
    osc.freq(440 * pow(2, i), 0);
      let strength = bump(i / OSCWIDTH);
    osc.amp(VOLUME * strength, 0);
    osc.start();
    oscs.push(osc);
  }
}


function draw() {
  background(0);
  const step = floor((frameCount % (N * T)) / T);
  if (frameCount % T == 0) {
    var freq = 440 * pow(2, step / N);
    if (step == 0) {
      freq *= 2;
    }
    for (let i = -OSCWIDTH; i <= OSCWIDTH; i++) {
      if (step == 0 && i == OSCWIDTH) {
        oscs[i + OSCWIDTH].freq().setTargetAtTime(440 * pow(2, -OSCWIDTH), 0, 0);
      } else {
        oscs[i + OSCWIDTH].freq().setTargetAtTime(freq * pow(2, i), 0, 0.25);
      }
      let y = (log(freq / 440) / log(2) + i) * SPACING;
      let strength = bump(y / BUMPWIDTH);
      oscs[i + OSCWIDTH].amp().setTargetAtTime(VOLUME * strength, 0, 0.25);
    }
    if (step == 0) {
      oscs.unshift(oscs.pop());
    }
  }

  for (let i = -OSCWIDTH; i <= OSCWIDTH; i++) {
    push();
    noFill();
    let y = (log(oscs[i + OSCWIDTH].freq().value / 440) / log(2)) * SPACING;
    let strength = bump(y / BUMPWIDTH);
    if (strength > 0) {
      let color = 255 * sqrt(strength);
      stroke(color);
      fill(color);
      translate(0, y);
      scale(0.75 + 0.25 * strength);
      strokeWeight(0);
      quad(-5, 0, 0, 5, 5, 0, 0, -5);
      strokeWeight(2);
      line(-150, 0, 150, 0);
      noFill();
      let digits = balanced_ternary(oscs[i + OSCWIDTH].freq().value);
      for (let j = 0; j < digits.length; j++) {
        var position = PRECISION - j;
        if (j >= PRECISION) {
           position -= 1; 
        }
        if (digits[j] == -1) {
          line(position * 18, 0, position * 18, 15);
        } else if (digits[j] == 0) {
          circle(position * 18, 0, 10);
        } else {
          line(position * 18, 0, position * 18, -15);
        }
      }
    }
    pop();
  }
  strokeWeight(1);
  for (let i = 0; i < N; i++) {
    push();
    translate(p5.Vector.fromAngle(radians(i * 360 / 7 - 90), 250));
    if (step == i) {
      emissiveMaterial(i * 100 / N, 80, 100);
    } else {
      emissiveMaterial(i * 100 / N, 25, 40);
    }
    rotateZ(i * 360 / 7);
    rotateX(frameCount);
    rotateY(frameCount);
    beginShape(TRIANGLES);
    vertex(SIZE, SIZE, SIZE);
    vertex(-SIZE, -SIZE, SIZE);
    vertex(-SIZE, SIZE, -SIZE);
    vertex(SIZE, SIZE, SIZE);
    vertex(-SIZE, -SIZE, SIZE);
    vertex(SIZE, -SIZE, -SIZE);
    vertex(SIZE, SIZE, SIZE);
    vertex(SIZE, -SIZE, -SIZE);
    vertex(-SIZE, SIZE, -SIZE);
    vertex(-SIZE, -SIZE, SIZE);
    vertex(-SIZE, SIZE, -SIZE);
    vertex(SIZE, -SIZE, -SIZE);
    endShape();
    pop();
  }
}

function mousePressed() {
  userStartAudio();
}
