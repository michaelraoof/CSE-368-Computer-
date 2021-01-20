"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DRACOLoader = void 0;

var _threeModule = require("../../../build/three.module.js");

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var DRACOLoader = function DRACOLoader(manager) {
  _threeModule.Loader.call(this, manager);

  this.decoderPath = '';
  this.decoderConfig = {};
  this.decoderBinary = null;
  this.decoderPending = null;
  this.workerLimit = 4;
  this.workerPool = [];
  this.workerNextTaskID = 1;
  this.workerSourceURL = '';
  this.defaultAttributeIDs = {
    position: 'POSITION',
    normal: 'NORMAL',
    color: 'COLOR',
    uv: 'TEX_COORD'
  };
  this.defaultAttributeTypes = {
    position: 'Float32Array',
    normal: 'Float32Array',
    color: 'Float32Array',
    uv: 'Float32Array'
  };
};

exports.DRACOLoader = DRACOLoader;
DRACOLoader.prototype = Object.assign(Object.create(_threeModule.Loader.prototype), {
  constructor: DRACOLoader,
  setDecoderPath: function setDecoderPath(path) {
    this.decoderPath = path;
    return this;
  },
  setDecoderConfig: function setDecoderConfig(config) {
    this.decoderConfig = config;
    return this;
  },
  setWorkerLimit: function setWorkerLimit(workerLimit) {
    this.workerLimit = workerLimit;
    return this;
  },

  /** @deprecated */
  setVerbosity: function setVerbosity() {
    console.warn('THREE.DRACOLoader: The .setVerbosity() method has been removed.');
  },

  /** @deprecated */
  setDrawMode: function setDrawMode() {
    console.warn('THREE.DRACOLoader: The .setDrawMode() method has been removed.');
  },

  /** @deprecated */
  setSkipDequantization: function setSkipDequantization() {
    console.warn('THREE.DRACOLoader: The .setSkipDequantization() method has been removed.');
  },
  load: function load(url, onLoad, onProgress, onError) {
    var _this = this;

    var loader = new _threeModule.FileLoader(this.manager);
    loader.setPath(this.path);
    loader.setResponseType('arraybuffer');

    if (this.crossOrigin === 'use-credentials') {
      loader.setWithCredentials(true);
    }

    loader.load(url, function (buffer) {
      var taskConfig = {
        attributeIDs: _this.defaultAttributeIDs,
        attributeTypes: _this.defaultAttributeTypes,
        useUniqueIDs: false
      };

      _this.decodeGeometry(buffer, taskConfig).then(onLoad)["catch"](onError);
    }, onProgress, onError);
  },

  /** @deprecated Kept for backward-compatibility with previous DRACOLoader versions. */
  decodeDracoFile: function decodeDracoFile(buffer, callback, attributeIDs, attributeTypes) {
    var taskConfig = {
      attributeIDs: attributeIDs || this.defaultAttributeIDs,
      attributeTypes: attributeTypes || this.defaultAttributeTypes,
      useUniqueIDs: !!attributeIDs
    };
    this.decodeGeometry(buffer, taskConfig).then(callback);
  },
  decodeGeometry: function decodeGeometry(buffer, taskConfig) {
    var _this2 = this;

    var worker;
    var taskID = this.workerNextTaskID++;
    var taskCost = buffer.byteLength; // TODO: For backward-compatibility, support 'attributeTypes' objects containing
    // references (rather than names) to typed array constructors. These must be
    // serialized before sending them to the worker.

    for (var attribute in taskConfig.attributeTypes) {
      var type = taskConfig.attributeTypes[attribute];

      if (type.BYTES_PER_ELEMENT !== undefined) {
        taskConfig.attributeTypes[attribute] = type.name;
      }
    } // Obtain a worker and assign a task, and construct a geometry instance
    // when the task completes.


    var geometryPending = this._getWorker(taskID, taskCost).then(function (_worker) {
      worker = _worker;
      return new Promise(function (resolve, reject) {
        worker._callbacks[taskID] = {
          resolve: resolve,
          reject: reject
        };
        worker.postMessage({
          type: 'decode',
          id: taskID,
          taskConfig: taskConfig,
          buffer: buffer
        }, [buffer]); // this.debug();
      });
    }).then(function (message) {
      return _this2._createGeometry(message.geometry);
    }); // Remove task from the task list.


    geometryPending["finally"](function () {
      if (worker && taskID) {
        _this2._releaseTask(worker, taskID); // this.debug();

      }
    });
    return geometryPending;
  },
  _createGeometry: function _createGeometry(geometryData) {
    var geometry = new _threeModule.BufferGeometry();

    if (geometryData.index) {
      geometry.setIndex(new _threeModule.BufferAttribute(geometryData.index.array, 1));
    }

    for (var i = 0; i < geometryData.attributes.length; i++) {
      var attribute = geometryData.attributes[i];
      var name = attribute.name;
      var array = attribute.array;
      var itemSize = attribute.itemSize;
      geometry.setAttribute(name, new _threeModule.BufferAttribute(array, itemSize));
    }

    return geometry;
  },
  _loadLibrary: function _loadLibrary(url, responseType) {
    var loader = new _threeModule.FileLoader(this.manager);
    loader.setPath(this.decoderPath);
    loader.setResponseType(responseType);
    return new Promise(function (resolve, reject) {
      loader.load(url, resolve, undefined, reject);
    });
  },
  preload: function preload() {
    this._initDecoder();

    return this;
  },
  _initDecoder: function _initDecoder() {
    var _this3 = this;

    if (this.decoderPending) return this.decoderPending;
    var useJS = (typeof WebAssembly === "undefined" ? "undefined" : _typeof(WebAssembly)) !== 'object' || this.decoderConfig.type === 'js';
    var librariesPending = [];

    if (useJS) {
      librariesPending.push(this._loadLibrary('draco_decoder.js', 'text'));
    } else {
      librariesPending.push(this._loadLibrary('draco_wasm_wrapper.js', 'text'));
      librariesPending.push(this._loadLibrary('draco_decoder.wasm', 'arraybuffer'));
    }

    this.decoderPending = Promise.all(librariesPending).then(function (libraries) {
      var jsContent = libraries[0];

      if (!useJS) {
        _this3.decoderConfig.wasmBinary = libraries[1];
      }

      var fn = DRACOLoader.DRACOWorker.toString();
      var body = ['/* draco decoder */', jsContent, '', '/* worker */', fn.substring(fn.indexOf('{') + 1, fn.lastIndexOf('}'))].join('\n');
      _this3.workerSourceURL = URL.createObjectURL(new Blob([body]));
    });
    return this.decoderPending;
  },
  _getWorker: function _getWorker(taskID, taskCost) {
    var _this4 = this;

    return this._initDecoder().then(function () {
      if (_this4.workerPool.length < _this4.workerLimit) {
        var worker = new Worker(_this4.workerSourceURL);
        worker._callbacks = {};
        worker._taskCosts = {};
        worker._taskLoad = 0;
        worker.postMessage({
          type: 'init',
          decoderConfig: _this4.decoderConfig
        });

        worker.onmessage = function (e) {
          var message = e.data;

          switch (message.type) {
            case 'decode':
              worker._callbacks[message.id].resolve(message);

              break;

            case 'error':
              worker._callbacks[message.id].reject(message);

              break;

            default:
              console.error('THREE.DRACOLoader: Unexpected message, "' + message.type + '"');
          }
        };

        _this4.workerPool.push(worker);
      } else {
        _this4.workerPool.sort(function (a, b) {
          return a._taskLoad > b._taskLoad ? -1 : 1;
        });
      }

      var worker = _this4.workerPool[_this4.workerPool.length - 1];
      worker._taskCosts[taskID] = taskCost;
      worker._taskLoad += taskCost;
      return worker;
    });
  },
  _releaseTask: function _releaseTask(worker, taskID) {
    worker._taskLoad -= worker._taskCosts[taskID];
    delete worker._callbacks[taskID];
    delete worker._taskCosts[taskID];
  },
  debug: function debug() {
    console.log('Task load: ', this.workerPool.map(function (worker) {
      return worker._taskLoad;
    }));
  },
  dispose: function dispose() {
    for (var i = 0; i < this.workerPool.length; ++i) {
      this.workerPool[i].terminate();
    }

    this.workerPool.length = 0;
    return this;
  }
});
/* WEB WORKER */

DRACOLoader.DRACOWorker = function () {
  var decoderConfig;
  var decoderPending;

  onmessage = function onmessage(e) {
    var message = e.data;

    switch (message.type) {
      case 'init':
        decoderConfig = message.decoderConfig;
        decoderPending = new Promise(function (resolve
        /*, reject*/
        ) {
          decoderConfig.onModuleLoaded = function (draco) {
            // Module is Promise-like. Wrap before resolving to avoid loop.
            resolve({
              draco: draco
            });
          };

          DracoDecoderModule(decoderConfig);
        });
        break;

      case 'decode':
        var buffer = message.buffer;
        var taskConfig = message.taskConfig;
        decoderPending.then(function (module) {
          var draco = module.draco;
          var decoder = new draco.Decoder();
          var decoderBuffer = new draco.DecoderBuffer();
          decoderBuffer.Init(new Int8Array(buffer), buffer.byteLength);

          try {
            var geometry = decodeGeometry(draco, decoder, decoderBuffer, taskConfig);
            var buffers = geometry.attributes.map(function (attr) {
              return attr.array.buffer;
            });
            if (geometry.index) buffers.push(geometry.index.array.buffer);
            self.postMessage({
              type: 'decode',
              id: message.id,
              geometry: geometry
            }, buffers);
          } catch (error) {
            console.error(error);
            self.postMessage({
              type: 'error',
              id: message.id,
              error: error.message
            });
          } finally {
            draco.destroy(decoderBuffer);
            draco.destroy(decoder);
          }
        });
        break;
    }
  };

  function decodeGeometry(draco, decoder, decoderBuffer, taskConfig) {
    var attributeIDs = taskConfig.attributeIDs;
    var attributeTypes = taskConfig.attributeTypes;
    var dracoGeometry;
    var decodingStatus;
    var geometryType = decoder.GetEncodedGeometryType(decoderBuffer);

    if (geometryType === draco.TRIANGULAR_MESH) {
      dracoGeometry = new draco.Mesh();
      decodingStatus = decoder.DecodeBufferToMesh(decoderBuffer, dracoGeometry);
    } else if (geometryType === draco.POINT_CLOUD) {
      dracoGeometry = new draco.PointCloud();
      decodingStatus = decoder.DecodeBufferToPointCloud(decoderBuffer, dracoGeometry);
    } else {
      throw new Error('THREE.DRACOLoader: Unexpected geometry type.');
    }

    if (!decodingStatus.ok() || dracoGeometry.ptr === 0) {
      throw new Error('THREE.DRACOLoader: Decoding failed: ' + decodingStatus.error_msg());
    }

    var geometry = {
      index: null,
      attributes: []
    }; // Gather all vertex attributes.

    for (var attributeName in attributeIDs) {
      var attributeType = self[attributeTypes[attributeName]];
      var attribute;
      var attributeID; // A Draco file may be created with default vertex attributes, whose attribute IDs
      // are mapped 1:1 from their semantic name (POSITION, NORMAL, ...). Alternatively,
      // a Draco file may contain a custom set of attributes, identified by known unique
      // IDs. glTF files always do the latter, and `.drc` files typically do the former.

      if (taskConfig.useUniqueIDs) {
        attributeID = attributeIDs[attributeName];
        attribute = decoder.GetAttributeByUniqueId(dracoGeometry, attributeID);
      } else {
        attributeID = decoder.GetAttributeId(dracoGeometry, draco[attributeIDs[attributeName]]);
        if (attributeID === -1) continue;
        attribute = decoder.GetAttribute(dracoGeometry, attributeID);
      }

      geometry.attributes.push(decodeAttribute(draco, decoder, dracoGeometry, attributeName, attributeType, attribute));
    } // Add index.


    if (geometryType === draco.TRIANGULAR_MESH) {
      // Generate mesh faces.
      var numFaces = dracoGeometry.num_faces();
      var numIndices = numFaces * 3;
      var index = new Uint32Array(numIndices);
      var indexArray = new draco.DracoInt32Array();

      for (var i = 0; i < numFaces; ++i) {
        decoder.GetFaceFromMesh(dracoGeometry, i, indexArray);

        for (var j = 0; j < 3; ++j) {
          index[i * 3 + j] = indexArray.GetValue(j);
        }
      }

      geometry.index = {
        array: index,
        itemSize: 1
      };
      draco.destroy(indexArray);
    }

    draco.destroy(dracoGeometry);
    return geometry;
  }

  function decodeAttribute(draco, decoder, dracoGeometry, attributeName, attributeType, attribute) {
    var numComponents = attribute.num_components();
    var numPoints = dracoGeometry.num_points();
    var numValues = numPoints * numComponents;
    var dracoArray;
    var array;

    switch (attributeType) {
      case Float32Array:
        dracoArray = new draco.DracoFloat32Array();
        decoder.GetAttributeFloatForAllPoints(dracoGeometry, attribute, dracoArray);
        array = new Float32Array(numValues);
        break;

      case Int8Array:
        dracoArray = new draco.DracoInt8Array();
        decoder.GetAttributeInt8ForAllPoints(dracoGeometry, attribute, dracoArray);
        array = new Int8Array(numValues);
        break;

      case Int16Array:
        dracoArray = new draco.DracoInt16Array();
        decoder.GetAttributeInt16ForAllPoints(dracoGeometry, attribute, dracoArray);
        array = new Int16Array(numValues);
        break;

      case Int32Array:
        dracoArray = new draco.DracoInt32Array();
        decoder.GetAttributeInt32ForAllPoints(dracoGeometry, attribute, dracoArray);
        array = new Int32Array(numValues);
        break;

      case Uint8Array:
        dracoArray = new draco.DracoUInt8Array();
        decoder.GetAttributeUInt8ForAllPoints(dracoGeometry, attribute, dracoArray);
        array = new Uint8Array(numValues);
        break;

      case Uint16Array:
        dracoArray = new draco.DracoUInt16Array();
        decoder.GetAttributeUInt16ForAllPoints(dracoGeometry, attribute, dracoArray);
        array = new Uint16Array(numValues);
        break;

      case Uint32Array:
        dracoArray = new draco.DracoUInt32Array();
        decoder.GetAttributeUInt32ForAllPoints(dracoGeometry, attribute, dracoArray);
        array = new Uint32Array(numValues);
        break;

      default:
        throw new Error('THREE.DRACOLoader: Unexpected attribute type.');
    }

    for (var i = 0; i < numValues; i++) {
      array[i] = dracoArray.GetValue(i);
    }

    draco.destroy(dracoArray);
    return {
      name: attributeName,
      array: array,
      itemSize: numComponents
    };
  }
};
/** Deprecated static methods */

/** @deprecated */


DRACOLoader.setDecoderPath = function () {
  console.warn('THREE.DRACOLoader: The .setDecoderPath() method has been removed. Use instance methods.');
};
/** @deprecated */


DRACOLoader.setDecoderConfig = function () {
  console.warn('THREE.DRACOLoader: The .setDecoderConfig() method has been removed. Use instance methods.');
};
/** @deprecated */


DRACOLoader.releaseDecoderModule = function () {
  console.warn('THREE.DRACOLoader: The .releaseDecoderModule() method has been removed. Use instance methods.');
};
/** @deprecated */


DRACOLoader.getDecoderModule = function () {
  console.warn('THREE.DRACOLoader: The .getDecoderModule() method has been removed. Use instance methods.');
};