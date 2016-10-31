export function bezier(x0, y0, x1, y1, x2, y2, x3, y3, t) {
  let mt = 1 - t;
  let mt2 = mt * mt;
  let t2 = t * t;
  let a = mt2 * mt;
  let b = mt2 * t * 3;
  let c = mt * t2 * 3;
  let d = t * t2;
  return [
    a * x0 + b * x1 + c * x2 + d * x3,
    a * y0 + b * y1 + c * y2 + d * y3
  ];
}

// From http://stackoverflow.com/a/7355667
export function YfromX(xTarget, x0, y0, x1, y1, x2, y2, x3, y3) {
  var xTolerance = 0.001 / (x3 - x0); //adjust as you please
  var bezierBound = function(t) {
    return bezier(x0, y0, x1, y1, x2, y2, x3, y3, t);
  };

  //we could do something less stupid, but since the x is monotonic
  //increasing given the problem constraints, we'll do a binary search.

  //establish bounds
  var lower = 0;
  var upper = 1;
  var percent = (upper + lower) / 2;
  var loops = 0;

  //get initial x
  var x = bezierBound(percent)[0];

  //loop until completion
  while (Math.abs(xTarget - x) > xTolerance && loops < 100) {
    if (xTarget > x) lower = percent;
    else upper = percent;

    percent = (upper + lower) / 2;
    x = bezierBound(percent)[0];
    loops ++;
  }
  //we're within tolerance of the desired x value.
  //return the y value.
  return bezierBound(percent)[1];
}
