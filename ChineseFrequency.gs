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
 * Counts total and unique number of Chinese characters in a string.
 * Returns the result in a list with Hanzi, Hanyu Pinyin, and Frequency.
 * Written in Google Apps Script.
 *
 * @version 0.1
 * @license The Unlicense http://unlicense.org/
 * @updated 2015-03-30
 * @author  The Pffy Authors https://github.com/pffy/
 * @link    https://github.com/pffy/googlescript-chinese-frequency
 *
 */
var ChineseFrequency = function() {
  var _hpdx = IdxHanyuPinyin,
      _xpdx = IdxExtraPinyin,
      _metaHanzi = 0,
      _metaUnique = 0,
      _summary = '',
      _input = '',
      _output = '';

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
      return _output;
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

      str = _cleanInput(str);
      _input = str ? str : '';
      _metaHanzi = str.length;

      var arr = _input.split('');
      arr = _unique(arr);
      _metaUnique = arr.length;

      _summary = 'Hanzi: ' + _metaHanzi
        + '\nUnique: ' + _metaUnique;

      var bigc = [];
      for(var w in arr) {
        if(bigc.indexOf(arr[w]) < 0){
          bigc.push({
            hz: arr[w],
            py: _hpdx[arr[w]] ? _hpdx[arr[w]] : 'zzz1',
            freq: _input.match(new RegExp('' + arr[w], 'gi')).length
          });
        }
      }

      bigc.sort(_desc);

      var csv = 'hz,py,freq';
      for (var i = 0; i < bigc.length; i++) {
        csv += '\n' + bigc[i].hz + ',' + bigc[i].py
          + ',' + bigc[i].freq;
      }

      _output = csv;
      return this;
    }

  };
};
