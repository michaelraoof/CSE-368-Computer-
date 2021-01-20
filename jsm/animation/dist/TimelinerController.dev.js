"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TimelinerController = void 0;

var _threeModule = require("../../../build/three.module.js");

/**
 * Controller class for the Timeliner GUI.
 *
 * Timeliner GUI library (required to use this class):
 *
 * 		../libs/timeliner_gui.min.js
 *
 * Source code:
 *
 * 		https://github.com/tschw/timeliner_gui
 * 		https://github.com/zz85/timeliner (fork's origin)
 *
 * @author tschw
 *
 */
var TimelinerController = function TimelinerController(scene, trackInfo, onUpdate) {
  this._scene = scene;
  this._trackInfo = trackInfo;
  this._onUpdate = onUpdate;
  this._mixer = new _threeModule.AnimationMixer(scene);
  this._clip = null;
  this._action = null;
  this._tracks = {};
  this._propRefs = {};
  this._channelNames = [];
};

exports.TimelinerController = TimelinerController;
TimelinerController.prototype = {
  constructor: TimelinerController,
  init: function init() {
    var tracks = [],
        trackInfo = this._trackInfo;

    for (var i = 0, n = trackInfo.length; i !== n; ++i) {
      var spec = trackInfo[i];
      tracks.push(this._addTrack(spec.type, spec.propertyPath, spec.initialValue, spec.interpolation));
    }

    this._clip = new _threeModule.AnimationClip('editclip', 0, tracks);
    this._action = this._mixer.clipAction(this._clip).play();
  },
  setDisplayTime: function setDisplayTime(time) {
    this._action.time = time;

    this._mixer.update(0);

    this._onUpdate();
  },
  setDuration: function setDuration(duration) {
    this._clip.duration = duration;
  },
  getChannelNames: function getChannelNames() {
    return this._channelNames;
  },
  getChannelKeyTimes: function getChannelKeyTimes(channelName) {
    return this._tracks[channelName].times;
  },
  setKeyframe: function setKeyframe(channelName, time) {
    var track = this._tracks[channelName],
        times = track.times,
        index = Timeliner.binarySearch(times, time),
        values = track.values,
        stride = track.getValueSize(),
        offset = index * stride;

    if (index < 0) {
      // insert new keyframe
      index = ~index;
      offset = index * stride;
      var nTimes = times.length + 1,
          nValues = values.length + stride;

      for (var i = nTimes - 1; i !== index; --i) {
        times[i] = times[i - 1];
      }

      for (var i = nValues - 1, e = offset + stride - 1; i !== e; --i) {
        values[i] = values[i - stride];
      }
    }

    times[index] = time;

    this._propRefs[channelName].getValue(values, offset);
  },
  delKeyframe: function delKeyframe(channelName, time) {
    var track = this._tracks[channelName],
        times = track.times,
        index = Timeliner.binarySearch(times, time); // we disallow to remove the keyframe when it is the last one we have,
    // since the animation system is designed to always produce a defined
    // state

    if (times.length > 1 && index >= 0) {
      var nTimes = times.length - 1,
          values = track.values,
          stride = track.getValueSize(),
          nValues = values.length - stride; // note: no track.getValueSize when array sizes are out of sync

      for (var i = index; i !== nTimes; ++i) {
        times[i] = times[i + 1];
      }

      times.pop();

      for (var offset = index * stride; offset !== nValues; ++offset) {
        values[offset] = values[offset + stride];
      }

      values.length = nValues;
    }
  },
  moveKeyframe: function moveKeyframe(channelName, time, delta, moveRemaining) {
    var track = this._tracks[channelName],
        times = track.times,
        index = Timeliner.binarySearch(times, time);

    if (index >= 0) {
      var endAt = moveRemaining ? times.length : index + 1,
          needsSort = times[index - 1] <= time || !moveRemaining && time >= times[index + 1];

      while (index !== endAt) {
        times[index++] += delta;
      }

      if (needsSort) this._sort(track);
    }
  },
  serialize: function serialize() {
    var result = {
      duration: this._clip.duration,
      channels: {}
    },
        names = this._channelNames,
        tracks = this._tracks,
        channels = result.channels;

    for (var i = 0, n = names.length; i !== n; ++i) {
      var name = names[i],
          track = tracks[name];
      channels[name] = {
        times: track.times,
        values: track.values
      };
    }

    return result;
  },
  deserialize: function deserialize(structs) {
    var names = this._channelNames,
        tracks = this._tracks,
        channels = structs.channels;
    this.setDuration(structs.duration);

    for (var i = 0, n = names.length; i !== n; ++i) {
      var name = names[i],
          track = tracks[name],
          data = channels[name];

      this._setArray(track.times, data.times);

      this._setArray(track.values, data.values);
    } // update display


    this.setDisplayTime(this._mixer.time);
  },
  _sort: function _sort(track) {
    var times = track.times,
        order = _threeModule.AnimationUtils.getKeyframeOrder(times);

    this._setArray(times, _threeModule.AnimationUtils.sortedArray(times, 1, order));

    var values = track.values,
        stride = track.getValueSize();

    this._setArray(values, _threeModule.AnimationUtils.sortedArray(values, stride, order));
  },
  _setArray: function _setArray(dst, src) {
    dst.length = 0;
    dst.push.apply(dst, src);
  },
  _addTrack: function _addTrack(type, prop, initialValue, interpolation) {
    var track = new type(prop, [0], initialValue, interpolation); // data must be in JS arrays so it can be resized

    track.times = Array.prototype.slice.call(track.times);
    track.values = Array.prototype.slice.call(track.values);

    this._channelNames.push(prop);

    this._tracks[prop] = track; // for recording the state:

    this._propRefs[prop] = new _threeModule.PropertyBinding(this._scene, prop);
    return track;
  }
};