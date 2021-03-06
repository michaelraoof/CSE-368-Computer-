"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _default =
/* glsl */
"\nPhysicalMaterial material;\nmaterial.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );\nmaterial.specularRoughness = clamp( roughnessFactor, 0.04, 1.0 );\n\n#ifdef REFLECTIVITY\n\n\tmaterial.specularColor = mix( vec3( MAXIMUM_SPECULAR_COEFFICIENT * pow2( reflectivity ) ), diffuseColor.rgb, metalnessFactor );\n\n#else\n\n\tmaterial.specularColor = mix( vec3( DEFAULT_SPECULAR_COEFFICIENT ), diffuseColor.rgb, metalnessFactor );\n\n#endif\n\n#ifdef CLEARCOAT\n\n\tmaterial.clearcoat = saturate( clearcoat ); // Burley clearcoat model\n\tmaterial.clearcoatRoughness = clamp( clearcoatRoughness, 0.04, 1.0 );\n\n#endif\n#ifdef USE_SHEEN\n\n\tmaterial.sheenColor = sheen;\n\n#endif\n";
exports["default"] = _default;