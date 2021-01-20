"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.QuadraticBezierCurve = QuadraticBezierCurve;

var _Curve = require("../core/Curve.js");

var _Interpolations = require("../core/Interpolations.js");

var _Vector = require("../../math/Vector2.js");

function QuadraticBezierCurve(v0, v1, v2) {
  _Curve.Curve.call(this);

  this.type = 'QuadraticBezierCurve';
  this.v0 = v0 || new _Vector.Vector2();
  this.v1 = v1 || new _Vector.Vector2();
  this.v2 = v2 || new _Vector.Vector2();
}

QuadraticBezierCurve.prototype = Object.create(_Curve.Curve.prototype);
QuadraticBezierCurve.prototype.constructor = QuadraticBezierCurve;
QuadraticBezierCurve.prototype.isQuadraticBezierCurve = true;

QuadraticBezierCurve.prototype.getPoint = function (t, optionalTarget) {
  var point = optionalTarget || new _Vector.Vector2();
  var v0 = this.v0,
      v1 = this.v1,
      v2 = this.v2;
  point.set((0, _Interpolations.QuadraticBezier)(t, v0.x, v1.x, v2.x), (0, _Interpolations.QuadraticBezier)(t, v0.y, v1.y, v2.y));
  return point;
};

QuadraticBezierCurve.prototype.copy = function (source) {
  _Curve.Curve.prototype.copy.call(this, source);

  this.v0.copy(source.v0);
  this.v1.copy(source.v1);
  this.v2.copy(source.v2);
  return this;
};

QuadraticBezierCurve.prototype.toJSON = function () {
  var data = _Curve.Curve.prototype.toJSON.call(this);

  data.v0 = this.v0.toArray();
  data.v1 = this.v1.toArray();
  data.v2 = this.v2.toArray();
  return data;
};

QuadraticBezierCurve.prototype.fromJSON = function (json) {
  _Curve.Curve.prototype.fromJSON.call(this, json);

  this.v0.fromArray(json.v0);
  this.v1.fromArray(json.v1);
  this.v2.fromArray(json.v2);
  return this;
};