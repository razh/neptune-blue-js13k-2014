'use strict';

var through = require('through2');

// Map to avoid duplicate keys.
var substitutions = {
  '.apm': '.applyProjectionMatrix',
  '.upm': '.updateProjectionMatrix',
  '.m4': '.applyMatrix4',
  '.m3': '.applyMatrix3',
  '.ps': '.positionScreen',
  '.pw': '.positionWorld',
  '.ra': '.rotateOnAxis',
  '.rx': '.rotateX',
  '.ry': '.rotateY',
  '.rz': '.rotateZ',
  '.nM': '.getNormalMatrix',
  '.nr': '.normalize',
  '.ib': '.isIntersectionBox',
  '.aa': '.setFromAxisAngle',
  '.gI': '.getInverse',
  '.tr': '.transpose',
  '.mWI': '.matrixWorldInverse',
  '.mW': '.matrixWorld',
  '.mP': '.setFromMatrixPosition',
  '.mQ': '.makeRotationFromQuaternion',
  '.nm': '.normalModel',
  '.nl': '.normal',
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
  'cTV': 'checkTriangleVisibility',
  'cBF': 'checkBackfaceVisibility',
  'cBC': 'checkBackfaceCulling',
  '.sFP': '.setFromPoints',
  '.eP': '.expandByPoint',
  // Color properties.
  'am': 'ambient',
  'di': 'diffuse',
  'em': 'emissive',
  'tC': 'strokeColor',
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
