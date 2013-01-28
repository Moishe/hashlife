rectsToDraw = [];
var MAX_TO_DRAW = 64 * 64;
var SCALE = 8;
var INTERVAL = 10;

var memoizedNodes = {};

function drawNextItem() {
  var counter = 0;
  while (rectsToDraw.length > 0 && counter < MAX_TO_DRAW) {
    counter++;
    var toDraw = rectsToDraw.shift();
    var canvas = $('#board').get(0);
    var ctx = canvas.getContext("2d");
    ctx.beginPath();
    if (toDraw[0]) {
      ctx.fillStyle = toDraw[5];
      ctx.fillRect(toDraw[1] * SCALE + 1, toDraw[2] * SCALE + 1, toDraw[3] * SCALE - 2, toDraw[4] * SCALE - 2);
    } else {
      ctx.rect(toDraw[1] * SCALE, toDraw[2] * SCALE, toDraw[3] * SCALE, toDraw[4] * SCALE);
      ctx.lineWidth = 2;
      ctx.strokeStyle = toDraw[5];
      ctx.stroke();
    }
  }

  return rectsToDraw.length > 0;
}

Hashlife = function(canvas, bitmap, level) {
  window.setInterval(drawNextItem, INTERVAL);
  this.root = nodeFromBitmap(0, 0, level, bitmap);
};

Hashlife.prototype.start = function() {
  while (this.root.level > 2) {
    this.root.draw();
    while (drawNextItem() == true) {}
    alert('gen');
    this.root = this.root.next();
  }
};

Node = function(x, y, level, ul, ur, ll, lr) {
  this.level = level;
  this.ul = ul;
  this.ur = ur;
  this.ll = ll;
  this.lr = lr;
  this.x = x;
  this.y = y;
  this.nextId = null;
};

Node.prototype.draw = function(x, y, color) {
  var x = this.x;
  var y = this.y;
  var offset = Math.pow(2, this.level - 1);
  rectsToDraw.push([false, x, y, offset * 2, offset * 2, 'red', this.level]);
  this.ul.draw(x, y, color);
  this.ur.draw(x + offset, y, color);
  this.ll.draw(x, y + offset, color);
  this.lr.draw(x + offset, y + offset, color);
  rectsToDraw.push([false, x, y, offset * 2, offset * 2, 'white', this.level]);
};

Node.prototype.drawOutline = function(color) {
  var x = this.x;
  var y = this.y;
  var offset = Math.pow(2, this.level - 1);
  rectsToDraw.push([false, x, y, offset * 2, offset * 2, color, this.level]);
};

Node.prototype.next = function() {
  var offset = Math.pow(2, this.level - 1);
  if (this.level == 2) {
    var result = new Node(this.x + 1,
                          this.y + 1,
                          1,
                          LeafNode.from([this.ul.ul,
                                         this.ul.ur,
                                         this.ur.ul,
                                         this.ul.ll,
                                         this.ul.lr,
                                         this.ur.ll,
                                         this.ll.ul,
                                         this.ll.ur,
                                         this.lr.ul]),
                          LeafNode.from([this.ul.ur,
                                         this.ur.ul,
                                         this.ur.ur,
                                         this.ul.lr,
                                         this.ur.ll,
                                         this.ur.lr,
                                         this.ll.ur,
                                         this.lr.ul,
                                         this.lr.ur]),
                          LeafNode.from([this.ul.ll,
                                         this.ul.lr,
                                         this.ur.ll,
                                         this.ll.ul,
                                         this.ll.ur,
                                         this.lr.ul,
                                         this.ll.ll,
                                         this.ll.lr,
                                         this.lr.ll]),
                          LeafNode.from([this.ul.lr,
                                         this.ur.ll,
                                         this.ur.lr,
                                         this.ll.ur,
                                         this.lr.ul,
                                         this.lr.ur,
                                         this.ll.lr,
                                         this.lr.ll,
                                         this.lr.lr]));
    return result;
  };
  var ninegrid = this.computeNineGrid();

  offset = offset / 4;
  var ul = new Node(this.x + offset, this.y + offset, this.level - 1,
                    ninegrid[0],
                    ninegrid[1],
                    ninegrid[3],
                    ninegrid[4]).next();
  var ur = new Node(this.x + offset * 3, this.y + offset, this.level - 1,
                    ninegrid[1],
                    ninegrid[2],
                    ninegrid[4],
                    ninegrid[5]).next();
  var ll = new Node(this.x + offset, this.y + offset * 3, this.level - 1,
                    ninegrid[3],
                    ninegrid[4],
                    ninegrid[6],
                    ninegrid[7]).next();
  var lr = new Node(this.x + offset * 3, this.y + offset * 3, this.level - 1,
                    ninegrid[4],
                    ninegrid[5],
                    ninegrid[7],
                    ninegrid[8]).next();
  var result =  new Node(this.x + offset * 2, this.y + offset * 2,
                        this.level - 1,
                        ul, ur, ll, lr);
  return result;
};

Node.prototype.getColor = function() {
  var color;
  var level = this.level;
  if (level == 2) {
    color = 'green';
  } else if (level == 3) {
    color = 'red';
  } else if (level == 4) {
    color = 'blue';
  } else if (level == 1) {
    color = 'gray';
  } else {
    color = 'black';
  }
  return color;
}

Node.prototype.computeNineGrid  = function() {
  console.log('Computing ninegrid: ' + this.level);
  var nodes = [];
  var width = Math.pow(2, this.level);
  nodes.push(this.ul.next());
  var offset = width / 4;
  nodes.push(new Node(this.x + offset, this.y,
                      this.level - 1,
                      this.ul.ur,
                      this.ur.ul,
                      this.ul.lr,
                      this.ur.ll).next());
  nodes.push(this.ur.next());
  nodes.push(new Node(this.x, this.y + offset,
                      this.level - 1,
                      this.ul.ll,
                      this.ul.lr,
                      this.ll.ul,
                      this.ll.ur).next());
  nodes.push(new Node(this.x + offset, this.y + offset,
                      this.level - 1,
                      this.ul.lr,
                      this.ur.ll,
                      this.ll.ur,
                      this.lr.ul).next());
  nodes.push(new Node(this.x + offset * 2, this.y + offset,
                      this.level - 1,
                      this.ur.ll,
                      this.ur.lr,
                      this.lr.ul,
                      this.lr.ur).next());
  nodes.push(this.ll.next());
  nodes.push(new Node(this.x + offset, this.y + offset * 2,
                      this.level - 1,
                      this.ll.ur,
                      this.lr.ul,
                      this.ll.lr,
                      this.lr.ll).next());
  nodes.push(this.lr.next());

  return nodes;
};

LeafNode = function(value) {
  this.value = value;
};

LeafNode.prototype.draw = function(x, y, opt_color) {
  if (opt_color) {
    if (this.value) {
      color = 'black';
    } else {
      color = opt_color;
    }
  } else if (this.value) {
    color = "#000000";
  } else {
    color = "#DDDDDD";
  }
  rectsToDraw.push([true, x, y, 1, 1, color, 1]);
};

LeafNode.from = function(cells) {
  var c = 0;
  for (var i = 0; i < 9; i++) {
    c += cells[i].value;
  }
  c -= cells[4].value;
  if (c < 2 || c > 3) {
    return OFF_LEAF;
  } else if (c == 2) {
    return cells[4];
  } else {
    return ON_LEAF;
  }
};

var ON_LEAF = new LeafNode(1);
var OFF_LEAF = new LeafNode(0);

var nodeFromBitmap = function(x, y, level, bitmap) {
  // Basically we just keep divvying the bitmap into 4 child nodes
  // until we have a 1x1 bitmap, then we just return a leaf node.
  if (bitmap.length == 1) {
    if (bitmap[0][0]) {
      return ON_LEAF;
    } else {
      return OFF_LEAF;
    }
  }

  var ulb = [];
  var urb = [];
  var llb = [];
  var lrb = [];

  var newSize = bitmap.length / 2;
  for (var i = 0; i < newSize; i++) {
    ulb[i] = bitmap[i].slice(0, newSize);
    urb[i] = bitmap[i].slice(newSize);
    llb[i] = bitmap[i + newSize].slice(0, newSize);
    lrb[i] = bitmap[i + newSize].slice(newSize);
  }

  return new Node(x, y, level, 
                  nodeFromBitmap(x, y, level - 1, ulb), 
                  nodeFromBitmap(x + newSize, y, level - 1, urb),
                  nodeFromBitmap(x, y + newSize, level - 1, llb), 
                  nodeFromBitmap(x + newSize, y + newSize, level - 1, lrb));
};