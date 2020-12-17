// Maximum time step in seconds.
var maxStep = 0.05;

/*
@ - Player start location
o - Coin
= - Lava moves horizontally
| - Lava moves vertically
v - Dripping Acid
+ - Acid
*/
var actorChars = {
  "@": Player,
  "o": Coin,
  "=": Lava,
  "|": Lava,
  "v": Acid
};


var levelPlans = [[
  "########################################################|##########v##############################",
  "#                                                                                                #",
  "#                                                                                                #",
  "#                                                       |                                        #",
  "#                                                                                                #",
  "#                                                                                                #",
  "#                                                                  o                             #",
  "#            o   o   o                                             #                             #",
  "#                                                       |        ####                            #",
  "#                                                             #######                            #",
  "#     @                                  o              |    ##########o                        o#",
  "####################+++###+++#####################################################################"],
[
  "#                         o                                       o                             #",
  "#                                                                                               #",
  "#                                                                                               #",
  "#                                                                                               #",
  "#                         #      o                               ###                         @  #",
  "#        ##############################################+++##   ##   ##    #######################",
  "#                              |        |             #####################                     #",
  "#=                 =            =            =           =           =            =            =#",
  "#                                                                                               #",
  "#   o                                                                                           #",
  "#                            o   o   o                                                         o#",
  "#                           |      |                                                       ######",
  "######################################################################################          #",
  "#                                          v  v    v  v                                          #",
  "#                                                                                        #      #",
  "#                                                                                      #        #",
  "#                                                                                      o        #",
  "#                                              ooo                                              #",
  "# o                                      ################################################       #",
  "# #                                 ###                                                         #",
  "#   #                           ###                    o        o                               #",
  "#                                                                                               #",
  "#                                             #  #  #  #  #  #  #  #  #  #                     o#",
  "##++++######################################++++++++++++++++++++++++++++++#######################"],
[
  "##v#v############# ### # # ##v#####",
  "=                 |                ",
  "#o                |               #",
  "#                 |               #",
  "## #   ########### ### # # #  |++++",
  "#                              ####",
  "=                                  ",
  "#                     |          o#",
  "#                     |      |#####",
  "#                     |           #",
  "#                     |     #     #",
  "#                                 #",
  "#                        #        #",
  "#                       |         #",
  "#                      #|         #",
  "#                      #|         #",
  "#                   #   |         #",
  "#                   #            o#",
  "#                #                #",
  "#                #                #",
  "#             #           |       #",
  "#             #           |       #",
  "#          #              |       #",
  "##         #                      #",
  "#o      ###########################",
  "#                                 #",
  "#                                 #",
  "#                                 #",
  "####                 #           o#",
  "#                             #   #",
  "#     ######                      #",
  "#o              ###   =##=  #=   ##",
  "##                             ====",
  "#       #########|#################",
  "#                                 #",
  "####                              #",
  "#                               @ #",
  "#++++++########## #################",
  "#################|#################"
]];

//pixel size
var scale = 20;

// coin animation
var wobbleSpeed = 8, wobbleDist = 0.07;

var playerXSpeed = 7;

var gravity = 30;
var jumpSpeed = 17;


var arrowCodes = { 27: "esc", 37: "left", 38: "up", 39: "right" };

//Run
var ready = function (f) {
  if (document.readyState === "complete") {
    return f();
  }
  document.addEventListener("DOMContentLoaded", f, false);
};

// Create level and show game.
ready(function () {
  runGame(levelPlans, DOMDisplay);
});

function Level(plan) {
  this.width = plan[0].length;
  this.height = plan.length;
  this.grid = [];
  this.actors = [];


  for (var y = 0; y < this.height; y++) {
    var line = plan[y],
      gridLine = [];
    for (var x = 0; x < this.width; x++) {
      var ch = line[x],
        fieldType = null;
      var Actor = actorChars[ch];
      if (Actor)
        this.actors.push(new Actor(new Vector(x, y), ch));
      else if (ch == "#")
        fieldType = "wall";
      else if (ch == "+")
        fieldType = "acid";

      gridLine.push(fieldType);
    }
    this.grid.push(gridLine);
  }

  this.player = this.actors.filter(function (actor) {
    return actor.type == "player";
  })[0];


  this.status = this.finishDelay = null;
}
Level.prototype.isFinished = function () {
  return this.status !== null && this.finishDelay < 0;
};
/*
overlaps
*/
Level.prototype.obstacleAt = function (pos, size) {
  var xStart = Math.floor(pos.x);
  var xEnd = Math.ceil(pos.x + size.x);
  var yStart = Math.floor(pos.y);
  var yEnd = Math.ceil(pos.y + size.y);

  if (xStart < 0 || xEnd > this.width || yStart < 0)
    return "wall";
  if (yEnd > this.height)
    return "lava"; // death if player manages to leave map
  for (var y = yStart; y < yEnd; y++) {
    for (var x = xStart; x < xEnd; x++) {
      var fieldType = this.grid[y][x];
      if (fieldType) return fieldType;
    }
  }
};
// overlap movement
Level.prototype.actorAt = function (actor) {
  for (var i = 0; i < this.actors.length; i++) {
    var other = this.actors[i];
    if (other != actor &&
      actor.pos.x + actor.size.x > other.pos.x &&
      actor.pos.x < other.pos.x + other.size.x &&
      actor.pos.y + actor.size.y > other.pos.y &&
      actor.pos.y < other.pos.y + other.size.y)
      return other;
  }
};

//animation
Level.prototype.animate = function (step, keys) {
  if (this.status !== null)
    this.finishDelay -= step;

  while (step > 0) {
    var thisStep = Math.min(step, maxStep);


    this.actors.forEach(function (actor) {
      actor.act(thisStep, this, keys);
    }, this);

    step -= thisStep;
  }
};
Level.prototype.playerTouched = function (type, actor) {
  if (type === "lava" && this.status === null) {
    this.status = "lost";
    this.finishDelay = 1;
  } else if (type === "acid" && this.status === null) {
    this.status = "lost";
    this.finishDelay = 1;
  } else if (type === "coin") {
    this.actors = this.actors.filter(function (other) {
      return other !== actor;
    });
    if (!this.actors.some(function (actor) {
      return actor.type === "coin";
    })) {
      this.status = "won";
      this.finishDelay = 1;
    }
  }
};

//actor storage
function Vector(x, y) {
  this.x = x;
  this.y = y;
}
Vector.prototype.plus = function (other) {
  return new Vector(this.x + other.x, this.y + other.y);
};
Vector.prototype.times = function (factor) {
  return new Vector(this.x * factor, this.y * factor);
};



function Player(pos) {
  this.pos = pos.plus(new Vector(0, -0.5));
  this.size = new Vector(0.8, 1.5);
  this.speed = new Vector(0, 0);
  this.type = "player";
}
Player.prototype.moveX = function (step, level, keys) {
  this.speed.x = 0;
  if (keys.left) this.speed.x -= playerXSpeed;
  if (keys.right) this.speed.x += playerXSpeed;

  var motion = new Vector(this.speed.x * step, 0);
  var newPos = this.pos.plus(motion);
  var obstacle = level.obstacleAt(newPos, this.size);
  if (obstacle)
    level.playerTouched(obstacle);
  else
    this.pos = newPos;
};
Player.prototype.moveY = function (step, level, keys) {
  this.speed.y += step * gravity;
  var motion = new Vector(0, this.speed.y * step);
  var newPos = this.pos.plus(motion);
  var obstacle = level.obstacleAt(newPos, this.size);
  if (obstacle) {
    level.playerTouched(obstacle);
    if (keys.up && this.speed.y > 0)
      this.speed.y = -jumpSpeed;
    else
      this.speed.y = 0;
  } else {
    this.pos = newPos;
  }
};
Player.prototype.act = function (step, level, keys) {
  this.moveX(step, level, keys);
  this.moveY(step, level, keys);

  var otherActor = level.actorAt(this);
  if (otherActor)
    level.playerTouched(otherActor.type, otherActor);

  // Losing animation
  if (level.status == "lost") {
    this.pos.y += step;
    this.size.y -= step;
  }
};

function Lava(pos, ch) {
  this.pos = pos;
  this.size = new Vector(1, 1);
  if (ch == "=") {
    this.speed = new Vector(2, 0);
  } else if (ch == "|") {
    this.speed = new Vector(0, 2);
  }
  this.type = "lava";
}
Lava.prototype.act = function (step, level) {
  var newPos = this.pos.plus(this.speed.times(step));
  if (!level.obstacleAt(newPos, this.size))
    this.pos = newPos;
  else if (this.repeatPos)
    this.pos = this.repeatPos;
  else
    this.speed = this.speed.times(-1);
};

function Acid(pos, ch) {
  this.pos = pos;
  this.size = new Vector(1, 1);
  if (ch == "v") {
    this.speed = new Vector(0, 3);
    this.repeatPos = pos;
  }
  this.type = "acid";
}
Acid.prototype.act = function (step, level) {
  var newPos = this.pos.plus(this.speed.times(step));
  if (!level.obstacleAt(newPos, this.size))
    this.pos = newPos;
  else if (this.repeatPos)
    this.pos = this.repeatPos;
  else
    this.speed = this.speed.times(-1);
};

function Coin(pos) {
  this.basePos = this.pos = pos.plus(new Vector(0.2, 0.1));
  this.size = new Vector(0.6, 0.6);
  this.wobble = Math.random() * Math.PI * 2;
  this.type = "coin";
}
Coin.prototype.act = function (step) {
  this.wobble += step * wobbleSpeed;
  var wobblePos = Math.sin(this.wobble) * wobbleDist;
  this.pos = this.basePos.plus(new Vector(0, wobblePos));
};

// Create an element for the DOM.
function createElement(name, className) {
  var element = document.createElement(name);
  if (className) {
    element.className = className;
  }
  return element;
}

/*
A display is created by giving it a parent element to which it should append
itself and a level object.
*/
function DOMDisplay(parent, level) {
  this.wrap = parent.appendChild(createElement("div", "game"));
  this.level = level;
  this.wrap.appendChild(this.drawBackground());
  this.actorLayer = null;
  this.drawFrame();

}

// Create table to display the level. Each element has a single table element.
DOMDisplay.prototype.drawBackground = function () {
  var table = createElement("table", "background");
  table.style.width = this.level.width * scale + "px";
  this.level.grid.forEach(function (row) {
    var rowElement = table.appendChild(createElement("tr"));
    rowElement.style.height = scale + "px";
    row.forEach(function (type) {
      rowElement.appendChild(createElement("td", type));
    });
  });
  return table;
};

// Create DOM element for each actor.
DOMDisplay.prototype.drawActors = function () {
  var wrap = createElement("div");
  this.level.actors.forEach(function (actor) {
    var rect = wrap.appendChild(createElement("div",
      "actor " + actor.type));
    rect.style.width = actor.size.x * scale + "px";
    rect.style.height = actor.size.y * scale + "px";
    rect.style.left = actor.pos.x * scale + "px";
    rect.style.top = actor.pos.y * scale + "px";
  });
  return wrap;
};

/*
Redraws Actors by removing them all from the DOM and drawing them in
new positions.
*/
DOMDisplay.prototype.drawFrame = function () {
  if (this.actorLayer) {
    this.wrap.removeChild(this.actorLayer);
  }
  this.actorLayer = this.wrap.appendChild(this.drawActors());
  this.wrap.className = "game " + (this.level.status || "");
  this.scrollPlayerIntoView();
};

DOMDisplay.prototype.scrollPlayerIntoView = function () {
  var width = this.wrap.clientWidth;
  var height = this.wrap.clientHeight;
  var margin = width / 3;

  // The viewport
  var left = this.wrap.scrollLeft;
  var right = left + width;
  var top = this.wrap.scrollTop;
  var bottom = top + height;

  var player = this.level.player;
  var center = player.pos.plus(player.size.times(0.5))
    .times(scale);

  if (center.x < left + margin)
    this.wrap.scrollLeft = center.x - margin;
  else if (center.x > right - margin)
    this.wrap.scrollLeft = center.x + margin - width;
  if (center.y < top + margin)
    this.wrap.scrollTop = center.y - margin;
  else if (center.y > bottom - margin)
    this.wrap.scrollTop = center.y + margin - height;
};

// Clears the level from the DOM.
DOMDisplay.prototype.clear = function () {
  this.wrap.parentNode.removeChild(this.wrap);
};

function trackKeys(codes) {
  var pressed = Object.create(null);
  function handler(event) {
    if (codes.hasOwnProperty(event.keyCode)) {
      var down = event.type == "keydown";
      if (codes[event.keyCode] === "esc") {
        if (!down) {
          pressed["esc"] = !pressed["esc"];
        }
      } else {
        pressed[codes[event.keyCode]] = down;
      }
      event.preventDefault();
    }
  }
  addEventListener("keydown", handler);
  addEventListener("keyup", handler);
  return pressed;
}
var arrows = trackKeys(arrowCodes);

// Convenience function for running animation
function runAnimation(frameFunc) {
  var lastTime = null;
  function frame(time) {
    var stop = false;
    if (lastTime !== null) {
      var timeStep = Math.min(time - lastTime, 100) / 1000;
      stop = frameFunc(timeStep) === false;
    }
    lastTime = time;
    if (!stop)
      requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

// Plays a single level.
function runLevel(level, Display, andThen) {
  var display = new Display(document.body, level);
  runAnimation(function (step) {
    if (!arrows.esc) {
      level.animate(step, arrows);
      display.drawFrame(step);
      if (level.isFinished()) {
        display.clear();
        if (andThen)
          andThen(level.status);
        return false;
      }
    }
  });
}

// Plays all levels passed by argument "plans".
function runGame(plans, Display) {
  function startLevel(n) {

    runLevel(new Level(plans[n]), Display, function (status) {
      if (status == "lost") {


        startLevel(n);

      }
      else if (n < plans.length - 1)
        startLevel(n + 1);
      else
        console.log("You win!");

    });
  }

  startLevel(0);
}
