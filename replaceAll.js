'use strict';

var through = require('through2');

// Map to avoid duplicate keys.
var substitutions = {
  '.aPM': '.applyProjectionMatrix',
  '.aP': '.applyProjection',
  '.uPM': '.updateProjectionMatrix',
  '.m4': '.applyMatrix4',
  '.m3': '.applyMatrix3',
  '.ps': '.positionScreen',
  '.pw': '.positionWorld',
  '.ra': '.rotateOnAxis',
  '.rx': '.rotateX',
  '.ry': '.rotateY',
  '.rz': '.rotateZ',
  '.lA': '.lookAt',
  '.dTS': '.distanceToSquared',
  '.dT': '.distanceTo',
  '.nM': '.getNormalMatrix',
  '.mM': '.multiplyMatrices',
  '.nr': '.normalize',
  '.ib': '.isIntersectionBox',
  '.aa': '.setFromAxisAngle',
  '.gI': '.getInverse',
  '.tr': '.transpose',
  '.cV': '.crossVectors',
  '.mWI': '.matrixWorldInverse',
  '.mW': '.matrixWorld',
  '.mP': '.setFromMatrixPosition',
  '.mRQ': '.makeRotationFromQuaternion',
  '.mQ': '.multiplyQuaternions',
  '.qu': '.quaternion',
  '.sR': '.setFromRotationMatrix',
  '.nm': '.normalModel',
  '.nl': '.normal',
  '.id': '.identity',
  '.ma': '.material',
  '.po': '.position',
  '.mS': '.multiplyScalar',
  '.uM': '.updateMatrix',
  '.fi': '.filter',
  '.rgb': '.setRGB',
  '.ca': '.camera',
  '.sV': '.subVectors',
  '.pM': '.projectionMatrix',
  '.cFN': '.computeFaceNormals',
  // Render list.
  'sO': 'setObject',
  'cTV': 'checkTriangleVisibility',
  'cBC': 'checkBackfaceCulling',
  // Bounding box.
  '.sFP': '.setFromPoints',
  '.eP': '.expandByPoint',
  '.vi': '.visible',
  '.ve': '.vertices',
  'el': 'elements',
  '.fa': '.faces',
  '.sc': '.scene',
  '.ud': '.update',
  '.cp': '.copy',
  '.ba': '.batch',
  '.mul': '.multiply',
  '.pS': '.projectScene',
  // Filter properties.
  '.cB': '.categoryBits',
  '.mB': '.maskBits',
  '.grI': '.groupIndex',
  // Material properties.
  'fV': 'fillVisible',
  'wf': 'wireframe',
  'op': 'opacity',
  'bl': 'blending',
  // Material sides.
  '.DS': '.DoubleSide',
  '.FS': '.FrontSide',
  '.BS': '.BackSide',
  // Color properties.
  'am': 'ambient',
  'di': 'diffuse',
  'em': 'emissive',
  'tC': 'strokeColor',
  // Utils.
  '.e': '.extends',
  // Browserify warnings.
  'NF': 'MODULE_NOT_FOUND',
  'N': 'Cannot find module '
};

var exclude = [
  'fillStyle',
  'strokeStyle',
  'lineWidth',
  'shadowColor',
  'shadowBlur',
  'beginPath',
  'moveTo',
  'lineTo',
  'setTransform',
  'translate',
  'fill',
  'stroke',
  'innerWidth',
  'innerHeight'
];

module.exports = function() {

  function replaceAll(file, encoding, callback) {
    /*jshint validthis:true*/
    if (file.isNull()) {
      this.push(file);
      return callback();
    }

    try {
      var contents = String(file.contents);

      Object.keys(substitutions).forEach(function(key) {
        var value = substitutions[key];
        var regex = new RegExp(value.replace('.', '\\.'), 'g');
        contents = contents.replace(regex, key);
      });

      file.contents = new Buffer(contents);
    } catch (e) {
      throw new Error();
    }

    this.push(file);
    callback();
  }

  return through.obj(replaceAll);
};
