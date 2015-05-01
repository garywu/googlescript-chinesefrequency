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
 * @version 6
 * @license http://unlicense.org/ The Unlicense
 * @updated 2015-04-30
 * @author  https://github.com/pffy/ The Pffy Authors
 * @link    https://github.com/pffy/googlescript-chinese-frequency
 *
 */
var ChineseFrequency = function() {

  // CONSTANTS
  var LABEL_PADSIZE = 20,
      FREQ_PADSIZE = 5,
      CRLF = '\r\n',
      MULTIBYTE_SPACE = '　'; // not an ASCII space

  var _hpdx = IdxHanyuPinyinMicro,
      _xpdx = IdxExtraPinyin,
      _hasRows = false,
      _metaTotal = 0,
      _metaRemoved = 0,
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
      HEADER_ROW_TXT = _padSummary('hz [py]' + MULTIBYTE_SPACE) + 'freq';


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

  // pads and formats frequency count
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

    // Returns string representation of this object.
    toString: function() {
      return this.getCsv();
    },

    // Returns CSV list.
    getCsv: function () {
      return _csvlist;
    },

    // Returns formatted TXT list.
    getTxt: function () {
      return _txtlist;
    },

    // Returns 2D array (data range).
    getDataRange: function () {
      return _dataRange;
    },

    // Returns total number of characters input.
    getTotalInput: function () {
      return _metaTotal;
    },

    // Returns total number of characters removed.
    getTotalRemoved: function () {
      return _metaRemoved;
    },

    // Returns number of Hanzi (Chinese characters) in text input.
    getTotalHanzi: function () {
      return _metaHanzi;
    },

    // Returns number of unique Hanzi in text input.
    getTotalUnique: function () {
      return _metaUnique;
    },

    // Returns number of characters recognized and processed.
    getTotalProcessed: function () {
      return _metaProcessed;
    },

    // Returns number of rows processed.
    getTotalRows: function () {
      return this.getTotalProcessed();
    },

    // Returns formatted count summary text.
    getCountSummary: function () {
      return _summary;
    },

    // Returns "sanitized" input.
    getInput: function() {
      return _input;
    },

    // Returns true if any rows processed; false, otherwise.
    hasRows: function() {
      return _hasRows;
    },

    // Returns true if a list is available; false, otherwise.
    hasList: function() {
      return this.hasRows();
    },

     // Returns this object. Sets the text input and processes known text.
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

      var aHanzi = '',
        aPinyin = '',
        aFreq = 0;

      // array of wide 'w' characters
      for(var w in arr) {
        if(bigc.indexOf(arr[w]) < 0) {

          aHanzi = arr[w];
          if(_hpdx[aHanzi]) {
            aPinyin = _hpdx[aHanzi];
          } else {
            // do not process unkown characters
            continue;
          }

          aFreq = _input.match(new RegExp('' + arr[w], 'gi')).length;

          bigc.push({
            hz: aHanzi,
            py: aPinyin,
            freq: aFreq
          });

          numProcessed++;
        }
      }

      _metaProcessed = numProcessed;

      if(_metaProcessed > 0) {
        _hasRows = true;
      } else {
        _summary = '';
        _dataRange = [];
        _csvlist = '';
        _txtlist = '';
        return this;
      }

      bigc.sort(_desc);

      _summary = ''
        + _padSummary('Total Characters' + MULTIBYTE_SPACE)
        + _padZero(_metaTotal)
        + CRLF + _padSummary('~ Removed' + MULTIBYTE_SPACE)
        + _padZero(_metaRemoved)
        + CRLF + _padSummary('Chinese Characters' + MULTIBYTE_SPACE)
        + _padZero(_metaHanzi)
        + CRLF + _padSummary('~ Unique' + MULTIBYTE_SPACE)
        + _padZero(_metaUnique)
        + CRLF + _padSummary('~ Processed' + MULTIBYTE_SPACE)
        + _padZero(_metaProcessed);

      var dataRange = [];
      var csv = HEADER_ROW_CSV;
      var txt = _summary + CRLF + CRLF;

      for (var i = 0; i < bigc.length; i++) {

        var row = []; // new row

        // adds data to row
        row.push(bigc[i].hz);
        row.push(bigc[i].py);
        row.push(bigc[i].freq);

        // adds row to data range
        dataRange.push(row);

        // adds row to CSV list
        csv += CRLF + bigc[i].hz + ',' + bigc[i].py
          + ',' + bigc[i].freq;

        txt += CRLF + _padSummary( bigc[i].hz + ' ' + '[' + bigc[i].py + ']' )
          + _padZero(bigc[i].freq);
      }

      _dataRange = dataRange;
      _csvlist = csv;
      _txtlist = txt;

      return this;
    }
  };
};
