import _ from "lodash"

import { GoogleSpreadsheetWorksheet } from "./GoogleSpreadsheetWorksheet"
import { getFieldMask } from "./utils"

export class GoogleSpreadsheet {
  constructor(sheetId, axios) {
    this._invalid = false
    this.spreadsheetId = sheetId
    this.authMode = null
    this._rawSheets = {}
    this._rawProperties = null
    this._spreadsheetUrl = null
    this.axios = axios
    return this
  }

  get invalid() {
    return this._invalid
  }

  resolveUrl(path) {
    return `/${this.spreadsheetId}/${path}`
  }

  // CREATE NEW DOC ////////////////////////////////////////////////////////////////////////////////
  async createNewSpreadsheetDocument(properties) {
    // see updateProperties for more info about available properties

    if (this.spreadsheetId) {
      throw new Error(
        "Only call `createNewSpreadsheetDocument()` on a GoogleSpreadsheet object that has no spreadsheetId set"
      )
    }
    const response = await this.axios.post(this.url, {
      properties
    })
    this.spreadsheetId = response.data.spreadsheetId
    // this.axios.defaults.baseURL += this.spreadsheetId

    this._rawProperties = response.data.properties
    _.each(response.data.sheets, (s) => this._updateOrCreateSheet(s))
  }

  async _makeSingleUpdateRequest(requestType, requestParams) {
    const response = await this.axios.post(this.resolveUrl(":batchUpdate"), {
      requests: [{ [requestType]: requestParams }],
      includeSpreadsheetInResponse: true
      // responseRanges: [string]
      // responseIncludeGridData: true
    })

    this._updateRawProperties(response.data.updatedSpreadsheet.properties)
    _.each(response.data.updatedSpreadsheet.sheets, (s) =>
      this._updateOrCreateSheet(s)
    )
    // console.log('API RESPONSE', response.data.replies[0][requestType]);
    return response.data.replies[0][requestType]
  }

  async _makeBatchUpdateRequest(requests, responseRanges) {
    // this is used for updating batches of cells
    const response = await this.axios.post(this.resolveUrl(":batchUpdate"), {
      requests,
      includeSpreadsheetInResponse: true,
      ...(responseRanges && {
        responseIncludeGridData: true,
        ...(responseRanges !== "*" && { responseRanges })
      })
    })

    this._updateRawProperties(response.data.updatedSpreadsheet.properties)
    _.each(response.data.updatedSpreadsheet.sheets, (s) =>
      this._updateOrCreateSheet(s)
    )
  }

  _ensureInfoLoaded() {
    if (!this._rawProperties)
      throw new Error(
        "You must call `doc.loadInfo()` before accessing this property"
      )
  }

  _updateRawProperties(newProperties) {
    this._rawProperties = newProperties
  }

  _updateOrCreateSheet({ properties, data }) {
    const { sheetId } = properties
    if (!this._rawSheets[sheetId]) {
      this._rawSheets[sheetId] = new GoogleSpreadsheetWorksheet(this, {
        properties,
        data
      })
    } else {
      this._rawSheets[sheetId]._rawProperties = properties
      this._rawSheets[sheetId]._fillCellData(data)
    }
  }

  // BASIC PROPS //////////////////////////////////////////////////////////////////////////////
  _getProp(param) {
    this._ensureInfoLoaded()
    return this._rawProperties[param]
  }
  _setProp(param, newVal) {
    // eslint-disable-line no-unused-vars
    throw new Error("Do not update directly - use `updateProperties()`")
  }

  get title() {
    return this._getProp("title")
  }
  get locale() {
    return this._getProp("locale")
  }
  get timeZone() {
    return this._getProp("timeZone")
  }
  get autoRecalc() {
    return this._getProp("autoRecalc")
  }
  get defaultFormat() {
    return this._getProp("defaultFormat")
  }
  get spreadsheetTheme() {
    return this._getProp("spreadsheetTheme")
  }
  get iterativeCalculationSettings() {
    return this._getProp("iterativeCalculationSettings")
  }

  set title(newVal) {
    this._setProp("title", newVal)
  }
  set locale(newVal) {
    this._setProp("locale", newVal)
  }
  set timeZone(newVal) {
    this._setProp("timeZone", newVal)
  }
  set autoRecalc(newVal) {
    this._setProp("autoRecalc", newVal)
  }
  set defaultFormat(newVal) {
    this._setProp("defaultFormat", newVal)
  }
  set spreadsheetTheme(newVal) {
    this._setProp("spreadsheetTheme", newVal)
  }
  set iterativeCalculationSettings(newVal) {
    this._setProp("iterativeCalculationSettings", newVal)
  }

  async updateProperties(properties) {
    // updateSpreadsheetProperties
    // https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets#SpreadsheetProperties

    /*
      title (string) - title of the spreadsheet
      locale (string) - ISO code
      autoRecalc (enum) - ON_CHANGE|MINUTE|HOUR
      timeZone (string) - timezone code
      iterativeCalculationSettings (object) - see https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets#IterativeCalculationSettings
     */

    await this._makeSingleUpdateRequest("updateSpreadsheetProperties", {
      properties,
      fields: getFieldMask(properties)
    })
  }

  // BASIC INFO ////////////////////////////////////////////////////////////////////////////////////
  async loadInfo(includeCells) {
    return await this.axios
      .get(this.resolveUrl(""), {
        params: {
          ...(includeCells && { includeGridData: true })
        }
      })
      .then(
        (response) => {
          this._spreadsheetUrl = response.data.spreadsheetUrl
          this._rawProperties = response.data.properties
          _.each(response.data.sheets, (s) => this._updateOrCreateSheet(s))
          return this
        },
        () => {
          this._invalid = true
          return this
        }
      )
  }

  async getInfo() {
    return this.loadInfo()
  } // alias to mimic old version

  resetLocalCache() {
    this._rawProperties = null
    this._rawSheets = {}
  }

  // WORKSHEETS ////////////////////////////////////////////////////////////////////////////////////
  get sheetCount() {
    this._ensureInfoLoaded()
    return _.values(this._rawSheets).length
  }

  get sheetsById() {
    this._ensureInfoLoaded()
    return this._rawSheets
  }

  get sheetsByIndex() {
    this._ensureInfoLoaded()
    return _.sortBy(this._rawSheets, "index")
  }

  get sheetsByTitle() {
    this._ensureInfoLoaded()
    return _.keyBy(this._rawSheets, "title")
  }

  async addSheet(properties = {}) {
    // Request type = `addSheet`
    // https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets/request#AddSheetRequest

    const response = await this._makeSingleUpdateRequest("addSheet", {
      properties: _.omit(
        properties,
        "headers",
        "headerValues",
        "headerRowIndex"
      )
    })
    // _makeSingleUpdateRequest already adds the sheet
    const newSheetId = response.properties.sheetId
    const newSheet = this.sheetsById[newSheetId]

    // allow it to work with `.headers` but `.headerValues` is the real prop
    const headers = properties.headerValues || properties.headers
    if (headers) {
      await newSheet.setHeaderRow(headers, properties.headerRowIndex)
    }

    return newSheet
  }
  async addWorksheet(properties) {
    return this.addSheet(properties)
  } // alias to mimic old version

  async deleteSheet(sheetId) {
    // Request type = `deleteSheet`
    // https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets/request#DeleteSheetRequest
    await this._makeSingleUpdateRequest("deleteSheet", { sheetId })
    delete this._rawSheets[sheetId]
  }

  // NAMED RANGES //////////////////////////////////////////////////////////////////////////////////
  async addNamedRange(name, range, namedRangeId) {
    // namedRangeId is optional
    return this._makeSingleUpdateRequest("addNamedRange", {
      name,
      range,
      namedRangeId
    })
  }

  async deleteNamedRange(namedRangeId) {
    return this._makeSingleUpdateRequest("deleteNamedRange", { namedRangeId })
  }

  // LOADING CELLS /////////////////////////////////////////////////////////////////////////////////
  async loadCells(filters) {
    // you can pass in a single filter or an array of filters
    // strings are treated as a1 ranges
    // objects are treated as GridRange objects
    // TODO: make it support DeveloperMetadataLookup objects

    // TODO: switch to this mode if using a read-only auth token?
    const readOnlyMode = this.authMode === AUTH_MODES.API_KEY

    const filtersArray = _.isArray(filters) ? filters : [filters]
    const dataFilters = _.map(filtersArray, (filter) => {
      if (_.isString(filter)) {
        return readOnlyMode ? filter : { a1Range: filter }
      }
      if (_.isObject(filter)) {
        if (readOnlyMode) {
          throw new Error(
            "Only A1 ranges are supported when fetching cells with read-only access (using only an API key)"
          )
        }
        // TODO: make this support Developer Metadata filters
        return { gridRange: filter }
      }
      throw new Error(
        "Each filter must be an A1 range string or a gridrange object"
      )
    })

    let result
    // when using an API key only, we must use the regular get endpoint
    // because :getByDataFilter requires higher access
    if (this.authMode === AUTH_MODES.API_KEY) {
      result = await this.axios.get(this.resolveUrl("/"), {
        params: {
          includeGridData: true,
          ranges: dataFilters
        }
      })
      // otherwise we use the getByDataFilter endpoint because it is more flexible
    } else {
      result = await this.axios.post(this.resolveUrl(":getByDataFilter"), {
        includeGridData: true,
        dataFilters
      })
    }

    const { sheets } = result.data
    _.each(sheets, (sheet) => {
      this._updateOrCreateSheet(sheet)
    })
  }

  // EXPORTING /////////////////////////////////////////////////////////////
  async _downloadAs(fileType, worksheetId, returnStreamInsteadOfBuffer) {
    // see https://stackoverflow.com/questions/11619805/using-the-google-drive-api-to-download-a-spreadsheet-in-csv-format/51235960#51235960

    if (["html", "xlsx", "ods"].includes(fileType)) {
      if (worksheetId)
        throw new Error(
          `Cannot specify worksheetId when exporting as ${fileType}`
        )
    } else if (["csv", "tsv", "pdf"].includes(fileType)) {
      if (worksheetId === undefined)
        throw new Error(
          `Must specify worksheetId when exporting as ${fileType}`
        )
    } else {
      throw new Error(`unsupported export fileType - ${fileType}`)
    }

    // google UI shows "html" but passes through "zip"
    if (fileType === "html") fileType = "zip"

    const exportUrl = this._spreadsheetUrl.replace("/edit", "/export")
    const response = await this.axios.get(exportUrl, {
      baseUrl: "", // unset baseUrl since we're not hitting the normal sheets API
      params: {
        id: this.spreadsheetId,
        format: fileType,
        ...(worksheetId && { gid: worksheetId })
      },
      responseType: returnStreamInsteadOfBuffer ? "stream" : "arraybuffer"
    })
    return response.data
  }
  async downloadAsHTML(returnStreamInsteadOfBuffer = false) {
    return this._downloadAs("html", null, returnStreamInsteadOfBuffer)
  }
  async downloadAsXLSX(returnStreamInsteadOfBuffer = false) {
    return this._downloadAs("xlsx", null, returnStreamInsteadOfBuffer)
  }
  async downloadAsODS(returnStreamInsteadOfBuffer = false) {
    return this._downloadAs("ods", null, returnStreamInsteadOfBuffer)
  }
}
