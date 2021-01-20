"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.InputNode = InputNode;

var _TempNode = require("./TempNode.js");

/**
 * @author sunag / http://www.sunag.com.br/
 */
function InputNode(type, params) {
  params = params || {};
  params.shared = params.shared !== undefined ? params.shared : false;

  _TempNode.TempNode.call(this, type, params);

  this.readonly = false;
}

InputNode.prototype = Object.create(_TempNode.TempNode.prototype);
InputNode.prototype.constructor = InputNode;

InputNode.prototype.setReadonly = function (value) {
  this.readonly = value;
  return this;
};

InputNode.prototype.getReadonly = function ()
/* builder */
{
  return this.readonly;
};

InputNode.prototype.copy = function (source) {
  _TempNode.TempNode.prototype.copy.call(this, source);

  if (source.readonly !== undefined) this.readonly = source.readonly;
  return this;
};

InputNode.prototype.createJSONNode = function (meta) {
  var data = _TempNode.TempNode.prototype.createJSONNode.call(this, meta);

  if (this.readonly === true) data.readonly = this.readonly;
  return data;
};

InputNode.prototype.generate = function (builder, output, uuid, type, ns, needsUpdate) {
  uuid = builder.getUuid(uuid || this.getUuid());
  type = type || this.getType(builder);
  var data = builder.getNodeData(uuid),
      readonly = this.getReadonly(builder) && this.generateReadonly !== undefined;

  if (readonly) {
    return this.generateReadonly(builder, output, uuid, type, ns, needsUpdate);
  } else {
    if (builder.isShader('vertex')) {
      if (!data.vertex) {
        data.vertex = builder.createVertexUniform(type, this, ns, needsUpdate, this.getLabel());
      }

      return builder.format(data.vertex.name, type, output);
    } else {
      if (!data.fragment) {
        data.fragment = builder.createFragmentUniform(type, this, ns, needsUpdate, this.getLabel());
      }

      return builder.format(data.fragment.name, type, output);
    }
  }
};