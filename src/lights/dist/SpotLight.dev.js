"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SpotLight = SpotLight;

var _Light = require("./Light.js");

var _SpotLightShadow = require("./SpotLightShadow.js");

var _Object3D = require("../core/Object3D.js");

/**
 * @author alteredq / http://alteredqualia.com/
 */
function SpotLight(color, intensity, distance, angle, penumbra, decay) {
  _Light.Light.call(this, color, intensity);

  this.type = 'SpotLight';
  this.position.copy(_Object3D.Object3D.DefaultUp);
  this.updateMatrix();
  this.target = new _Object3D.Object3D();
  Object.defineProperty(this, 'power', {
    get: function get() {
      // intensity = power per solid angle.
      // ref: equation (17) from https://seblagarde.files.wordpress.com/2015/07/course_notes_moving_frostbite_to_pbr_v32.pdf
      return this.intensity * Math.PI;
    },
    set: function set(power) {
      // intensity = power per solid angle.
      // ref: equation (17) from https://seblagarde.files.wordpress.com/2015/07/course_notes_moving_frostbite_to_pbr_v32.pdf
      this.intensity = power / Math.PI;
    }
  });
  this.distance = distance !== undefined ? distance : 0;
  this.angle = angle !== undefined ? angle : Math.PI / 3;
  this.penumbra = penumbra !== undefined ? penumbra : 0;
  this.decay = decay !== undefined ? decay : 1; // for physically correct lights, should be 2.

  this.shadow = new _SpotLightShadow.SpotLightShadow();
}

SpotLight.prototype = Object.assign(Object.create(_Light.Light.prototype), {
  constructor: SpotLight,
  isSpotLight: true,
  copy: function copy(source) {
    _Light.Light.prototype.copy.call(this, source);

    this.distance = source.distance;
    this.angle = source.angle;
    this.penumbra = source.penumbra;
    this.decay = source.decay;
    this.target = source.target.clone();
    this.shadow = source.shadow.clone();
    return this;
  }
});