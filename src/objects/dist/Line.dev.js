"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Line = Line;

var _Sphere = require("../math/Sphere.js");

var _Ray = require("../math/Ray.js");

var _Matrix = require("../math/Matrix4.js");

var _Object3D = require("../core/Object3D.js");

var _Vector = require("../math/Vector3.js");

var _LineBasicMaterial = require("../materials/LineBasicMaterial.js");

var _BufferGeometry = require("../core/BufferGeometry.js");

var _BufferAttribute = require("../core/BufferAttribute.js");

/**
 * @author mrdoob / http://mrdoob.com/
 */
var _start = new _Vector.Vector3();

var _end = new _Vector.Vector3();

var _inverseMatrix = new _Matrix.Matrix4();

var _ray = new _Ray.Ray();

var _sphere = new _Sphere.Sphere();

function Line(geometry, material, mode) {
  if (mode === 1) {
    console.error('THREE.Line: parameter THREE.LinePieces no longer supported. Use THREE.LineSegments instead.');
  }

  _Object3D.Object3D.call(this);

  this.type = 'Line';
  this.geometry = geometry !== undefined ? geometry : new _BufferGeometry.BufferGeometry();
  this.material = material !== undefined ? material : new _LineBasicMaterial.LineBasicMaterial({
    color: Math.random() * 0xffffff
  });
}

Line.prototype = Object.assign(Object.create(_Object3D.Object3D.prototype), {
  constructor: Line,
  isLine: true,
  computeLineDistances: function computeLineDistances() {
    var geometry = this.geometry;

    if (geometry.isBufferGeometry) {
      // we assume non-indexed geometry
      if (geometry.index === null) {
        var positionAttribute = geometry.attributes.position;
        var lineDistances = [0];

        for (var i = 1, l = positionAttribute.count; i < l; i++) {
          _start.fromBufferAttribute(positionAttribute, i - 1);

          _end.fromBufferAttribute(positionAttribute, i);

          lineDistances[i] = lineDistances[i - 1];
          lineDistances[i] += _start.distanceTo(_end);
        }

        geometry.setAttribute('lineDistance', new _BufferAttribute.Float32BufferAttribute(lineDistances, 1));
      } else {
        console.warn('THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.');
      }
    } else if (geometry.isGeometry) {
      var vertices = geometry.vertices;
      var lineDistances = geometry.lineDistances;
      lineDistances[0] = 0;

      for (var i = 1, l = vertices.length; i < l; i++) {
        lineDistances[i] = lineDistances[i - 1];
        lineDistances[i] += vertices[i - 1].distanceTo(vertices[i]);
      }
    }

    return this;
  },
  raycast: function raycast(raycaster, intersects) {
    var precision = raycaster.linePrecision;
    var geometry = this.geometry;
    var matrixWorld = this.matrixWorld; // Checking boundingSphere distance to ray

    if (geometry.boundingSphere === null) geometry.computeBoundingSphere();

    _sphere.copy(geometry.boundingSphere);

    _sphere.applyMatrix4(matrixWorld);

    _sphere.radius += precision;
    if (raycaster.ray.intersectsSphere(_sphere) === false) return; //

    _inverseMatrix.getInverse(matrixWorld);

    _ray.copy(raycaster.ray).applyMatrix4(_inverseMatrix);

    var localPrecision = precision / ((this.scale.x + this.scale.y + this.scale.z) / 3);
    var localPrecisionSq = localPrecision * localPrecision;
    var vStart = new _Vector.Vector3();
    var vEnd = new _Vector.Vector3();
    var interSegment = new _Vector.Vector3();
    var interRay = new _Vector.Vector3();
    var step = this && this.isLineSegments ? 2 : 1;

    if (geometry.isBufferGeometry) {
      var index = geometry.index;
      var attributes = geometry.attributes;
      var positions = attributes.position.array;

      if (index !== null) {
        var indices = index.array;

        for (var i = 0, l = indices.length - 1; i < l; i += step) {
          var a = indices[i];
          var b = indices[i + 1];
          vStart.fromArray(positions, a * 3);
          vEnd.fromArray(positions, b * 3);

          var distSq = _ray.distanceSqToSegment(vStart, vEnd, interRay, interSegment);

          if (distSq > localPrecisionSq) continue;
          interRay.applyMatrix4(this.matrixWorld); //Move back to world space for distance calculation

          var distance = raycaster.ray.origin.distanceTo(interRay);
          if (distance < raycaster.near || distance > raycaster.far) continue;
          intersects.push({
            distance: distance,
            // What do we want? intersection point on the ray or on the segment??
            // point: raycaster.ray.at( distance ),
            point: interSegment.clone().applyMatrix4(this.matrixWorld),
            index: i,
            face: null,
            faceIndex: null,
            object: this
          });
        }
      } else {
        for (var i = 0, l = positions.length / 3 - 1; i < l; i += step) {
          vStart.fromArray(positions, 3 * i);
          vEnd.fromArray(positions, 3 * i + 3);

          var distSq = _ray.distanceSqToSegment(vStart, vEnd, interRay, interSegment);

          if (distSq > localPrecisionSq) continue;
          interRay.applyMatrix4(this.matrixWorld); //Move back to world space for distance calculation

          var distance = raycaster.ray.origin.distanceTo(interRay);
          if (distance < raycaster.near || distance > raycaster.far) continue;
          intersects.push({
            distance: distance,
            // What do we want? intersection point on the ray or on the segment??
            // point: raycaster.ray.at( distance ),
            point: interSegment.clone().applyMatrix4(this.matrixWorld),
            index: i,
            face: null,
            faceIndex: null,
            object: this
          });
        }
      }
    } else if (geometry.isGeometry) {
      var vertices = geometry.vertices;
      var nbVertices = vertices.length;

      for (var i = 0; i < nbVertices - 1; i += step) {
        var distSq = _ray.distanceSqToSegment(vertices[i], vertices[i + 1], interRay, interSegment);

        if (distSq > localPrecisionSq) continue;
        interRay.applyMatrix4(this.matrixWorld); //Move back to world space for distance calculation

        var distance = raycaster.ray.origin.distanceTo(interRay);
        if (distance < raycaster.near || distance > raycaster.far) continue;
        intersects.push({
          distance: distance,
          // What do we want? intersection point on the ray or on the segment??
          // point: raycaster.ray.at( distance ),
          point: interSegment.clone().applyMatrix4(this.matrixWorld),
          index: i,
          face: null,
          faceIndex: null,
          object: this
        });
      }
    }
  },
  clone: function clone() {
    return new this.constructor(this.geometry, this.material).copy(this);
  }
});