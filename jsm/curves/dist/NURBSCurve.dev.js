"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NURBSCurve = void 0;

var _threeModule = require("../../../build/three.module.js");

var _NURBSUtils = require("../curves/NURBSUtils.js");

/**
 * @author renej
 * NURBS curve object
 *
 * Derives from Curve, overriding getPoint and getTangent.
 *
 * Implementation is based on (x, y [, z=0 [, w=1]]) control points with w=weight.
 *
 **/

/**************************************************************
 *	NURBS curve
 **************************************************************/
var NURBSCurve = function NURBSCurve(degree, knots
/* array of reals */
, controlPoints
/* array of Vector(2|3|4) */
, startKnot
/* index in knots */
, endKnot
/* index in knots */
) {
  _threeModule.Curve.call(this);

  this.degree = degree;
  this.knots = knots;
  this.controlPoints = []; // Used by periodic NURBS to remove hidden spans

  this.startKnot = startKnot || 0;
  this.endKnot = endKnot || this.knots.length - 1;

  for (var i = 0; i < controlPoints.length; ++i) {
    // ensure Vector4 for control points
    var point = controlPoints[i];
    this.controlPoints[i] = new _threeModule.Vector4(point.x, point.y, point.z, point.w);
  }
};

exports.NURBSCurve = NURBSCurve;
NURBSCurve.prototype = Object.create(_threeModule.Curve.prototype);
NURBSCurve.prototype.constructor = NURBSCurve;

NURBSCurve.prototype.getPoint = function (t) {
  var u = this.knots[this.startKnot] + t * (this.knots[this.endKnot] - this.knots[this.startKnot]); // linear mapping t->u
  // following results in (wx, wy, wz, w) homogeneous point

  var hpoint = _NURBSUtils.NURBSUtils.calcBSplinePoint(this.degree, this.knots, this.controlPoints, u);

  if (hpoint.w != 1.0) {
    // project to 3D space: (wx, wy, wz, w) -> (x, y, z, 1)
    hpoint.divideScalar(hpoint.w);
  }

  return new _threeModule.Vector3(hpoint.x, hpoint.y, hpoint.z);
};

NURBSCurve.prototype.getTangent = function (t) {
  var u = this.knots[0] + t * (this.knots[this.knots.length - 1] - this.knots[0]);

  var ders = _NURBSUtils.NURBSUtils.calcNURBSDerivatives(this.degree, this.knots, this.controlPoints, u, 1);

  var tangent = ders[1].clone();
  tangent.normalize();
  return tangent;
};