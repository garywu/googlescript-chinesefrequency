/**
 * This is free and unencumbered software released into the public domain.
 *
 * Anyone is free to copy, modify, publish, use, compile, sell, or
 * distribute this software, either in source code form or as a compiled
 * binary, for any purpose, commercial or non-commercial, and by any
 * means.
 *
 * In jurisdictions that recognize copyright laws, the author or authors
 * of this software dedicate any and all copyright interest in the
 * software to the public domain. We make this dedication for the benefit
 * of the public at large and to the detriment of our heirs and
 * successors. We intend this dedication to be an overt act of
 * relinquishment in perpetuity of all present and future rights to this
 * software under copyright law.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
 * OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 *
 * For more information, please refer to <http://unlicense.org/>
 */

/**
 * ChineseFrequency.gs
 * Designed for Google Spreadsheets or Google Documents (for Google Drive).
 *  + Counts the number of Chinese charaters (Hanzi) and unique Chinese characters.
 *  + Outputs a comma-separated list of Hanzi, Pinyin, and frequency counts.
 *
 * @version 0.3
 * @license The Unlicense http://unlicense.org/
 * @updated 2015-04-01
 * @author  The Pffy Authors https://github.com/pffy/
 * @link    https://github.com/pffy/googlescript-chinese-frequency
 *
 */
var ChineseFrequency = function() {

  // CONSTANTS
  var LABEL_PADSIZE = 20,
      FREQ_PADSIZE = 5;

  var _hpdx = IdxHanyuPinyin,
      _xpdx = IdxExtraPinyin,
      _metaTotal = 0,
      _metaRemoved,
      _metaHanzi = 0,
      _metaUnique = 0,
      _metaProcessed = 0,
      _csvlist = '',
      _txtlist = '',
      _summary = '',
      _dataRange = [],
      _input = '',
      _output = '';

  var HEADER_ROW_CSV = 'hz,py,freq',
      HEADER_ROW_TXT = _padSummary('hz [py]  ') + 'freq';


  // returns cleaned text input
  function _cleanInput(str) {

    // multi-byte punctuation
    for(var x in _xpdx) {
      str = _replaceAll(x, '', str);
    }

    // single-btye
    str = str.replace(/\W|[A-Za-z0-9\s]/gi, '');

    return str;
  }

  // returns array of unique values
  function _unique(arr) {
    var obj = {};
    for(var a in arr) {
      obj[arr[a]] = 'derp';
    }
    return Object.keys(obj);
  }

  // Found at http://stackoverflow.com/questions/1144783
  function _replaceAll(find, replace, str) {
    return str.replace(new RegExp(find, 'gi'), replace);
  }

  // pads summary
  function _padSummary(str) {
    return '' + Utilities.formatString('%-' + LABEL_PADSIZE + 's', str) + ': ';
  }

  // TODO: fix this to do up to 4 places
  function _padZero(str) {
    str = '' + str;
    return str.length < FREQ_PADSIZE ?
      Utilities.formatString('%' + FREQ_PADSIZE + 's', str) : str;
  }

  // COMPARE: order by freq, ascending
  function _asc(a,b) {
    if (a.freq < b.freq)
      return -1;
    if (a.freq > b.freq)
      return 1;
    return 0;
  }

  // COMPARE: order by freq, descending
  function _desc(a,b) {
    if (a.freq > b.freq)
      return -1;
    if (a.freq < b.freq)
      return 1;
    return 0;
  }

  return {

    // returns string representation of this object
    toString: function() {
      return _csvlist;
    },

    // returns list
    getCsv: function () {
      return _csvlist;
    },

    // returns list
    getTxt: function () {
      return _txtlist;
    },

    // returns 2D array of data
    getDataRange: function () {
      return _dataRange;
    },

    // returns number of hanzi in text input
    getTotalHanzi: function () {
      return _metaHanzi;
    },

    // returns number of hanzi in text input
    getTotalUnique: function () {
      return _metaUnique;
    },

    // returns cleaned input
    getInput: function() {
      return _input;
    },

    // returns this object, sets the text input
    setInput: function(str) {

      _metaTotal = str.length;

      str = _cleanInput(str);
      _input = str ? str : '';
      _metaHanzi = str.length;

      _metaRemoved = _metaTotal - _metaHanzi;

      var arr = _input.split('');
      arr = _unique(arr);
      _metaUnique = arr.length;

      var bigc = [];
      var numProcessed = 0;

      for(var w in arr) {
        if(bigc.indexOf(arr[w]) < 0) {

          bigc.push({
            hz: arr[w],
            py: _hpdx[arr[w]] ? _hpdx[arr[w]] : 'zzz1',
            freq: _input.match(new RegExp('' + arr[w], 'gi')).length
          });

          numProcessed++;
        }
      }

      _metaProcessed = numProcessed;

      bigc.sort(_desc);

      // NOTE: appended multi-byte space character to end of data headers
      // TODO: refactor for portability
      _summary = ''
        + _padSummary('Total Characters　') + _padZero(_metaTotal)
        + '\n' + _padSummary('~ Removed　') + _padZero(_metaRemoved)
        + '\n' + _padSummary('Chinese Characters　') + _padZero(_metaHanzi)
        + '\n' + _padSummary('~ Unique　') + _padZero(_metaUnique)
        + '\n' + _padSummary('~ Processed　') + _padZero(_metaProcessed);

      var csv = HEADER_ROW_CSV;
      for (var i = 0; i < bigc.length; i++) {
        csv += '\n' + bigc[i].hz + ',' + bigc[i].py
          + ',' + bigc[i].freq;
      }

      var dataRange = [];
      for (var i = 0; i < bigc.length; i++) {

        var row = []; // new row

        row.push(bigc[i].hz);
        row.push(bigc[i].py);
        row.push(bigc[i].freq);

        // finished row
        dataRange.push(row);
      }

      _dataRange = dataRange;

      _csvlist = csv;

      var txt = _summary;
      txt += '\n\n';
      for (var i = 0; i < bigc.length; i++) {
        txt += '\n' + _padSummary( bigc[i].hz + ' ' + '[' + bigc[i].py + ']' )
          + _padZero(bigc[i].freq);
      }

      _txtlist = txt;


      return this;
    }

  };
};
