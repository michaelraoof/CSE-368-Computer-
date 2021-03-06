"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AnimationClipCreator = void 0;

var _threeModule = require("../../../build/three.module.js");

/**
 *
 * Creator of typical test AnimationClips / KeyframeTracks
 *
 * @author Ben Houston / http://clara.io/
 * @author David Sarno / http://lighthaus.us/
 */
var AnimationClipCreator = function AnimationClipCreator() {};

exports.AnimationClipCreator = AnimationClipCreator;

AnimationClipCreator.CreateRotationAnimation = function (period, axis) {
  var times = [0, period],
      values = [0, 360];
  axis = axis || 'x';
  var trackName = '.rotation[' + axis + ']';
  var track = new _threeModule.NumberKeyframeTrack(trackName, times, values);
  return new _threeModule.AnimationClip(null, period, [track]);
};

AnimationClipCreator.CreateScaleAxisAnimation = function (period, axis) {
  var times = [0, period],
      values = [0, 1];
  axis = axis || 'x';
  var trackName = '.scale[' + axis + ']';
  var track = new _threeModule.NumberKeyframeTrack(trackName, times, values);
  return new _threeModule.AnimationClip(null, period, [track]);
};

AnimationClipCreator.CreateShakeAnimation = function (duration, shakeScale) {
  var times = [],
      values = [],
      tmp = new _threeModule.Vector3();

  for (var i = 0; i < duration * 10; i++) {
    times.push(i / 10);
    tmp.set(Math.random() * 2.0 - 1.0, Math.random() * 2.0 - 1.0, Math.random() * 2.0 - 1.0).multiply(shakeScale).toArray(values, values.length);
  }

  var trackName = '.position';
  var track = new _threeModule.VectorKeyframeTrack(trackName, times, values);
  return new _threeModule.AnimationClip(null, duration, [track]);
};

AnimationClipCreator.CreatePulsationAnimation = function (duration, pulseScale) {
  var times = [],
      values = [],
      tmp = new _threeModule.Vector3();

  for (var i = 0; i < duration * 10; i++) {
    times.push(i / 10);
    var scaleFactor = Math.random() * pulseScale;
    tmp.set(scaleFactor, scaleFactor, scaleFactor).toArray(values, values.length);
  }

  var trackName = '.scale';
  var track = new _threeModule.VectorKeyframeTrack(trackName, times, values);
  return new _threeModule.AnimationClip(null, duration, [track]);
};

AnimationClipCreator.CreateVisibilityAnimation = function (duration) {
  var times = [0, duration / 2, duration],
      values = [true, false, true];
  var trackName = '.visible';
  var track = new _threeModule.BooleanKeyframeTrack(trackName, times, values);
  return new _threeModule.AnimationClip(null, duration, [track]);
};

AnimationClipCreator.CreateMaterialColorAnimation = function (duration, colors) {
  var times = [],
      values = [],
      timeStep = duration / colors.length;

  for (var i = 0; i <= colors.length; i++) {
    times.push(i * timeStep);
    values.push(colors[i % colors.length]);
  }

  var trackName = '.material[0].color';
  var track = new _threeModule.ColorKeyframeTrack(trackName, times, values);
  return new _threeModule.AnimationClip(null, duration, [track]);
};