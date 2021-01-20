"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ColorsNode = ColorsNode;

var _TempNode = require("../core/TempNode.js");

/**
 * @author sunag / http://www.sunag.com.br/
 */
var vertexDict = ['color', 'color2'],
    fragmentDict = ['vColor', 'vColor2'];

function ColorsNode(index) {
  _TempNode.TempNode.call(this, 'v4', {
    shared: false
  });

  this.index = index || 0;
}

ColorsNode.prototype = Object.create(_TempNode.TempNode.prototype);
ColorsNode.prototype.constructor = ColorsNode;
ColorsNode.prototype.nodeType = "Colors";

ColorsNode.prototype.generate = function (builder, output) {
  builder.requires.color[this.index] = true;
  var result = builder.isShader('vertex') ? vertexDict[this.index] : fragmentDict[this.index];
  return builder.format(result, this.getType(builder), output);
};

ColorsNode.prototype.copy = function (source) {
  _TempNode.TempNode.prototype.copy.call(this, source);

  this.index = source.index;
  return this;
};

ColorsNode.prototype.toJSON = function (meta) {
  var data = this.getJSONNode(meta);

  if (!data) {
    data = this.createJSONNode(meta);
    data.index = this.index;
  }

  return data;
};