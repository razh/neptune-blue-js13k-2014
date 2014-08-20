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
  '.mWI': '.matrixWorldInverse',
  '.mW': '.matrixWorld',
  '.mP': '.setFromMatrixPosition',
  '.mQ': '.makeRotationFromQuaternion',
  '.nm': '.normalModel',
  '.nl': '.normal',
  '.ma': '.material',
  '.po': '.position',
  '.mS': '.multiplyScalar',
  'cTV': 'checkTriangleVisibility',
  'cBF': 'checkBackfaceVisibility',
  'cBC': 'checkBackfaceCulling'
};

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
