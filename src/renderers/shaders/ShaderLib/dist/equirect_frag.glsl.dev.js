"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _default =
/* glsl */
"\nuniform sampler2D tEquirect;\n\nvarying vec3 vWorldDirection;\n\n#include <common>\n\nvoid main() {\n\n\tvec3 direction = normalize( vWorldDirection );\n\n\tvec2 sampleUV;\n\n\tsampleUV.y = asin( clamp( direction.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;\n\n\tsampleUV.x = atan( direction.z, direction.x ) * RECIPROCAL_PI2 + 0.5;\n\n\tvec4 texColor = texture2D( tEquirect, sampleUV );\n\n\tgl_FragColor = mapTexelToLinear( texColor );\n\n\t#include <tonemapping_fragment>\n\t#include <encodings_fragment>\n\n}\n";
exports["default"] = _default;