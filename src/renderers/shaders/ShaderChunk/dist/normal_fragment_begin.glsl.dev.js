"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _default =
/* glsl */
"\n#ifdef FLAT_SHADED\n\n\t// Workaround for Adreno/Nexus5 not able able to do dFdx( vViewPosition ) ...\n\n\tvec3 fdx = vec3( dFdx( vViewPosition.x ), dFdx( vViewPosition.y ), dFdx( vViewPosition.z ) );\n\tvec3 fdy = vec3( dFdy( vViewPosition.x ), dFdy( vViewPosition.y ), dFdy( vViewPosition.z ) );\n\tvec3 normal = normalize( cross( fdx, fdy ) );\n\n#else\n\n\tvec3 normal = normalize( vNormal );\n\n\t#ifdef DOUBLE_SIDED\n\n\t\tnormal = normal * ( float( gl_FrontFacing ) * 2.0 - 1.0 );\n\n\t#endif\n\n\t#ifdef USE_TANGENT\n\n\t\tvec3 tangent = normalize( vTangent );\n\t\tvec3 bitangent = normalize( vBitangent );\n\n\t\t#ifdef DOUBLE_SIDED\n\n\t\t\ttangent = tangent * ( float( gl_FrontFacing ) * 2.0 - 1.0 );\n\t\t\tbitangent = bitangent * ( float( gl_FrontFacing ) * 2.0 - 1.0 );\n\n\t\t#endif\n\n\t\t#if defined( TANGENTSPACE_NORMALMAP ) || defined( USE_CLEARCOAT_NORMALMAP )\n\n\t\t\tmat3 vTBN = mat3( tangent, bitangent, normal );\n\n\t\t#endif\n\n\t#endif\n\n#endif\n\n// non perturbed normal for clearcoat among others\n\nvec3 geometryNormal = normal;\n\n";
exports["default"] = _default;