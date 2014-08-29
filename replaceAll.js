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
  '.nz': '.normalize',
  '.aa': '.setFromAxisAngle',
  '.gI': '.getInverse',
  '.tr': '.transpose',
  '.cV': '.crossVectors',
  '.mWI': '.matrixWorldInverse',
  '.mW': '.matrixWorld',
  '.mP': '.setFromMatrixPosition',
  '.mRQ': '.makeRotationFromQuaternion',
  '.mQ': '.multiplyQuaternions',
  '.qu': /\.quaternion(?!\w+)/g,
  '.sR': '.setFromRotationMatrix',
  '.nm': '.normalModel',
  '.nr': '.normal',
  '.id': '.identity',
  '.mt': '.material',
  '.po': '.position',
  '.mS': '.multiplyScalar',
  '.uM': '.updateMatrix',
  '.rgb': '.setRGB',
  '.sV': '.subVectors',
  '.pM': '.projectionMatrix',
  '.mx': /\.matrix(?!\w+)/g,
  '.cFN': '.computeFaceNormals',
  '.ds': /\.distance(?!\w+)/g,
  // Camera.
  '.ca': '.camera',
  '.as': '.aspect',
  // Render data.
  'ls': /lights(?!\w+)/g,
  'os': /objects(?!\w+)/g,
  // Render list.
  'sO': 'setObject',
  'cTV': 'checkTriangleVisibility',
  'cBC': 'checkBackfaceCulling',
  // Bounding box.
  '.sFP': '.setFromPoints',
  '.eP': '.expandByPoint',
  '.iB': '.isIntersectionBox',
  '.vi': '.visible',
  '.ve': '.vertices',
  '.fa': '.faces',
  '.qd': '.quads',
  'el': 'elements',
  '.se': '.scene',
  '.rr': '.renderer',
  '.rg': '.running',
  '.ud': /\.update(?!\w+)/g,
  '.cp': '.copy',
  '.mul': /\.multiply(?!\w+)/g,
  '.sc': /\.scale(?!\w+)/g,
  '.sP': /\.setPosition(?!\w+)/g,
  '.pS': '.projectScene',
  // Filter properties.
  '.fi': '.filter',
  '.cB': '.categoryBits',
  '.mB': '.maskBits',
  '.grI': '.groupIndex',
  // Material properties.
  'fV': 'fillVisible',
  'wf': 'wireframe',
  'op': 'opacity',
  'bl': 'blending',
  'bh': 'batch',
  // Material sides.
  '.DS': '.DoubleSide',
  '.FS': '.FrontSide',
  '.BS': '.BackSide',
  // Color properties.
  'am': 'ambient',
  'df': 'diffuse',
  'em': 'emissive',
  'tC': 'strokeColor',
  'cr': 'color',
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
        var regex = value instanceof RegExp ? value
         : new RegExp(value.replace('.', '\\.'), 'g');
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
