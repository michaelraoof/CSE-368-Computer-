"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _default =
/* glsl */
"\n#if defined( RE_IndirectDiffuse )\n\n\t#ifdef USE_LIGHTMAP\n\n\t\tvec3 lightMapIrradiance = texture2D( lightMap, vUv2 ).xyz * lightMapIntensity;\n\n\t\t#ifndef PHYSICALLY_CORRECT_LIGHTS\n\n\t\t\tlightMapIrradiance *= PI; // factor of PI should not be present; included here to prevent breakage\n\n\t\t#endif\n\n\t\tirradiance += lightMapIrradiance;\n\n\t#endif\n\n\t#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )\n\n\t\tiblIrradiance += getLightProbeIndirectIrradiance( /*lightProbe,*/ geometry, maxMipLevel );\n\n\t#endif\n\n#endif\n\n#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )\n\n\tradiance += getLightProbeIndirectRadiance( /*specularLightProbe,*/ geometry.viewDir, geometry.normal, material.specularRoughness, maxMipLevel );\n\n\t#ifdef CLEARCOAT\n\n\t\tclearcoatRadiance += getLightProbeIndirectRadiance( /*specularLightProbe,*/ geometry.viewDir, geometry.clearcoatNormal, material.clearcoatRoughness, maxMipLevel );\n\n\t#endif\n\n#endif\n";
exports["default"] = _default;