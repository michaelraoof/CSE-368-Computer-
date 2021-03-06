"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ConvexBufferGeometry = exports.ConvexGeometry = void 0;

var _threeModule = require("../../../build/three.module.js");

var _ConvexHull = require("../math/ConvexHull.js");

/**
 * @author Mugen87 / https://github.com/Mugen87
 */
// ConvexGeometry
var ConvexGeometry = function ConvexGeometry(points) {
  _threeModule.Geometry.call(this);

  this.fromBufferGeometry(new ConvexBufferGeometry(points));
  this.mergeVertices();
};

exports.ConvexGeometry = ConvexGeometry;
ConvexGeometry.prototype = Object.create(_threeModule.Geometry.prototype);
ConvexGeometry.prototype.constructor = ConvexGeometry; // ConvexBufferGeometry

var ConvexBufferGeometry = function ConvexBufferGeometry(points) {
  _threeModule.BufferGeometry.call(this); // buffers


  var vertices = [];
  var normals = [];

  if (_ConvexHull.ConvexHull === undefined) {
    console.error('THREE.ConvexBufferGeometry: ConvexBufferGeometry relies on ConvexHull');
  }

  var convexHull = new _ConvexHull.ConvexHull().setFromPoints(points); // generate vertices and normals

  var faces = convexHull.faces;

  for (var i = 0; i < faces.length; i++) {
    var face = faces[i];
    var edge = face.edge; // we move along a doubly-connected edge list to access all face points (see HalfEdge docs)

    do {
      var point = edge.head().point;
      vertices.push(point.x, point.y, point.z);
      normals.push(face.normal.x, face.normal.y, face.normal.z);
      edge = edge.next;
    } while (edge !== face.edge);
  } // build geometry


  this.setAttribute('position', new _threeModule.Float32BufferAttribute(vertices, 3));
  this.setAttribute('normal', new _threeModule.Float32BufferAttribute(normals, 3));
};

exports.ConvexBufferGeometry = ConvexBufferGeometry;
ConvexBufferGeometry.prototype = Object.create(_threeModule.BufferGeometry.prototype);
ConvexBufferGeometry.prototype.constructor = ConvexBufferGeometry;