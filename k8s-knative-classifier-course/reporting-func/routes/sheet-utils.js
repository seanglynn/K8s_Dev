'use strict'

require('dotenv').config()
const Promise = require('promise');


/**
 * Appends values in a Spreadsheet.
 * @param {string} spreadsheetId The spreadsheet ID.
 * @param {string} range The range of values to append.
 * @param {object} valueInputOption Value input options.
 * @param {(string[])[]} _values A 2d array of values to append.
 * @return {Promise} The appended values response.
 */
async function appendValues(sheetsService, spreadsheetId, range, valueInputOption, _values) {
  return new Promise((resolve, reject) => {



    // [START sheets_append_values]
    let values = [
      [
        // Cell values ...
      ],
      // Additional rows ...
    ];
    // [START_EXCLUDE silent]
    values = _values;
    // [END_EXCLUDE]
    let resource = {
      values,
    };
    sheetsService.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption,
      resource,
    }, (err, result) => {
      if (err) {
        // Handle error.
        console.log(err);
        // [START_EXCLUDE silent]
        reject(err);
        // [END_EXCLUDE]
      } else {
        console.log(`${result.updates.updatedCells} cells appended.`);
        // [START_EXCLUDE silent]
        resolve(result);
        // [END_EXCLUDE]
      }
    });
    // [END sheets_append_values]
  });
}

module.exports = appendValues
