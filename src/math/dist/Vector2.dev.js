"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Vector2 = Vector2;

/**
 * @author mrdoob / http://mrdoob.com/
 * @author philogb / http://blog.thejit.org/
 * @author egraether / http://egraether.com/
 * @author zz85 / http://www.lab4games.net/zz85/blog
 */
function Vector2(x, y) {
  this.x = x || 0;
  this.y = y || 0;
}

Object.defineProperties(Vector2.prototype, {
  "width": {
    get: function get() {
      return this.x;
    },
    set: function set(value) {
      this.x = value;
    }
  },
  "height": {
    get: function get() {
      return this.y;
    },
    set: function set(value) {
      this.y = value;
    }
  }
});
Object.assign(Vector2.prototype, {
  isVector2: true,
  set: function set(x, y) {
    this.x = x;
    this.y = y;
    return this;
  },
  setScalar: function setScalar(scalar) {
    this.x = scalar;
    this.y = scalar;
    return this;
  },
  setX: function setX(x) {
    this.x = x;
    return this;
  },
  setY: function setY(y) {
    this.y = y;
    return this;
  },
  setComponent: function setComponent(index, value) {
    switch (index) {
      case 0:
        this.x = value;
        break;

      case 1:
        this.y = value;
        break;

      default:
        throw new Error('index is out of range: ' + index);
    }

    return this;
  },
  getComponent: function getComponent(index) {
    switch (index) {
      case 0:
        return this.x;

      case 1:
        return this.y;

      default:
        throw new Error('index is out of range: ' + index);
    }
  },
  clone: function clone() {
    return new this.constructor(this.x, this.y);
  },
  copy: function copy(v) {
    this.x = v.x;
    this.y = v.y;
    return this;
  },
  add: function add(v, w) {
    if (w !== undefined) {
      console.warn('THREE.Vector2: .add() now only accepts one argument. Use .addVectors( a, b ) instead.');
      return this.addVectors(v, w);
    }

    this.x += v.x;
    this.y += v.y;
    return this;
  },
  addScalar: function addScalar(s) {
    this.x += s;
    this.y += s;
    return this;
  },
  addVectors: function addVectors(a, b) {
    this.x = a.x + b.x;
    this.y = a.y + b.y;
    return this;
  },
  addScaledVector: function addScaledVector(v, s) {
    this.x += v.x * s;
    this.y += v.y * s;
    return this;
  },
  sub: function sub(v, w) {
    if (w !== undefined) {
      console.warn('THREE.Vector2: .sub() now only accepts one argument. Use .subVectors( a, b ) instead.');
      return this.subVectors(v, w);
    }

    this.x -= v.x;
    this.y -= v.y;
    return this;
  },
  subScalar: function subScalar(s) {
    this.x -= s;
    this.y -= s;
    return this;
  },
  subVectors: function subVectors(a, b) {
    this.x = a.x - b.x;
    this.y = a.y - b.y;
    return this;
  },
  multiply: function multiply(v) {
    this.x *= v.x;
    this.y *= v.y;
    return this;
  },
  multiplyScalar: function multiplyScalar(scalar) {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  },
  divide: function divide(v) {
    this.x /= v.x;
    this.y /= v.y;
    return this;
  },
  divideScalar: function divideScalar(scalar) {
    return this.multiplyScalar(1 / scalar);
  },
  applyMatrix3: function applyMatrix3(m) {
    var x = this.x,
        y = this.y;
    var e = m.elements;
    this.x = e[0] * x + e[3] * y + e[6];
    this.y = e[1] * x + e[4] * y + e[7];
    return this;
  },
  min: function min(v) {
    this.x = Math.min(this.x, v.x);
    this.y = Math.min(this.y, v.y);
    return this;
  },
  max: function max(v) {
    this.x = Math.max(this.x, v.x);
    this.y = Math.max(this.y, v.y);
    return this;
  },
  clamp: function clamp(min, max) {
    // assumes min < max, componentwise
    this.x = Math.max(min.x, Math.min(max.x, this.x));
    this.y = Math.max(min.y, Math.min(max.y, this.y));
    return this;
  },
  clampScalar: function clampScalar(minVal, maxVal) {
    this.x = Math.max(minVal, Math.min(maxVal, this.x));
    this.y = Math.max(minVal, Math.min(maxVal, this.y));
    return this;
  },
  clampLength: function clampLength(min, max) {
    var length = this.length();
    return this.divideScalar(length || 1).multiplyScalar(Math.max(min, Math.min(max, length)));
  },
  floor: function floor() {
    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);
    return this;
  },
  ceil: function ceil() {
    this.x = Math.ceil(this.x);
    this.y = Math.ceil(this.y);
    return this;
  },
  round: function round() {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    return this;
  },
  roundToZero: function roundToZero() {
    this.x = this.x < 0 ? Math.ceil(this.x) : Math.floor(this.x);
    this.y = this.y < 0 ? Math.ceil(this.y) : Math.floor(this.y);
    return this;
  },
  negate: function negate() {
    this.x = -this.x;
    this.y = -this.y;
    return this;
  },
  dot: function dot(v) {
    return this.x * v.x + this.y * v.y;
  },
  cross: function cross(v) {
    return this.x * v.y - this.y * v.x;
  },
  lengthSq: function lengthSq() {
    return this.x * this.x + this.y * this.y;
  },
  length: function length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  },
  manhattanLength: function manhattanLength() {
    return Math.abs(this.x) + Math.abs(this.y);
  },
  normalize: function normalize() {
    return this.divideScalar(this.length() || 1);
  },
  angle: function angle() {
    // computes the angle in radians with respect to the positive x-axis
    var angle = Math.atan2(this.y, this.x);
    if (angle < 0) angle += 2 * Math.PI;
    return angle;
  },
  distanceTo: function distanceTo(v) {
    return Math.sqrt(this.distanceToSquared(v));
  },
  distanceToSquared: function distanceToSquared(v) {
    var dx = this.x - v.x,
        dy = this.y - v.y;
    return dx * dx + dy * dy;
  },
  manhattanDistanceTo: function manhattanDistanceTo(v) {
    return Math.abs(this.x - v.x) + Math.abs(this.y - v.y);
  },
  setLength: function setLength(length) {
    return this.normalize().multiplyScalar(length);
  },
  lerp: function lerp(v, alpha) {
    this.x += (v.x - this.x) * alpha;
    this.y += (v.y - this.y) * alpha;
    return this;
  },
  lerpVectors: function lerpVectors(v1, v2, alpha) {
    return this.subVectors(v2, v1).multiplyScalar(alpha).add(v1);
  },
  equals: function equals(v) {
    return v.x === this.x && v.y === this.y;
  },
  fromArray: function fromArray(array, offset) {
    if (offset === undefined) offset = 0;
    this.x = array[offset];
    this.y = array[offset + 1];
    return this;
  },
  toArray: function toArray(array, offset) {
    if (array === undefined) array = [];
    if (offset === undefined) offset = 0;
    array[offset] = this.x;
    array[offset + 1] = this.y;
    return array;
  },
  fromBufferAttribute: function fromBufferAttribute(attribute, index, offset) {
    if (offset !== undefined) {
      console.warn('THREE.Vector2: offset has been removed from .fromBufferAttribute().');
    }

    this.x = attribute.getX(index);
    this.y = attribute.getY(index);
    return this;
  },
  rotateAround: function rotateAround(center, angle) {
    var c = Math.cos(angle),
        s = Math.sin(angle);
    var x = this.x - center.x;
    var y = this.y - center.y;
    this.x = x * c - y * s + center.x;
    this.y = x * s + y * c + center.y;
    return this;
  }
});