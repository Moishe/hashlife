rectsToDraw = [];
var MAX_TO_DRAW = 32;
var SCALE = 8;

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
      ctx.fillRect(toDraw[1] * SCALE, toDraw[2] * SCALE, toDraw[3] * SCALE, toDraw[4] * SCALE);
    } else {
      ctx.rect(toDraw[1] * SCALE, toDraw[2] * SCALE, toDraw[3] * SCALE, toDraw[4] * SCALE);
      ctx.lineWidth = 2;
      ctx.strokeStyle = toDraw[5];
      ctx.stroke();
    }
  }
}

Hashlife = function(canvas, bitmap, level) {
  window.setInterval(drawNextItem, 1);
  this.root = nodeFromBitmap(level, bitmap);
  this.root.draw(canvas.get(0), 0, 0);
};

Hashlife.prototype.start = function() {
  
};

Node = function(level, ul, ur, ll, lr) {
  this.level = level;
  this.ul = ul;
  this.ur = ur;
  this.ll = ll;
  this.lr = lr;
};

Node.prototype.draw = function(canvas, x, y) {
  var offset = Math.pow(2, this.level - 1);
  rectsToDraw.push([false, x, y, offset * 2, offset * 2, 'red', this.level]);
  this.ul.draw(canvas, x, y);
  this.ur.draw(canvas, x + offset, y);
  this.ll.draw(canvas, x, y + offset);
  this.lr.draw(canvas, x + offset, y + offset);
  rectsToDraw.push([false, x, y, offset * 2, offset * 2, 'white', this.level]);
};

LeafNode = function(value) {
  this.value = value;
};

LeafNode.prototype.draw = function(canvas, x, y) {
  if (this.value) {
    color = "#DDDDDD";
  } else {
    color = "#000000";
  }
  rectsToDraw.push([true, x, y, 1, 1, color, 1]);
};

var nodeFromBitmap = function(level, bitmap) {
  // Basically we just keep divvying the bitmap into 4 child nodes
  // until we have a 1x1 bitmap, then we just return a leaf node.
  if (bitmap.length == 1) {
    return new LeafNode(bitmap[0][0]);
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

  return new Node(level, 
                  nodeFromBitmap(level - 1, ulb), 
                  nodeFromBitmap(level - 1, urb),
                  nodeFromBitmap(level - 1, llb), 
                  nodeFromBitmap(level - 1, lrb));
};