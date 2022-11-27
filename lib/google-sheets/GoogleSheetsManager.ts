import Axios, { AxiosInstance } from "axios"
import _ from "lodash"
import { Subject, filter, shareReplay } from "rxjs"

import { Storage } from "@plasmohq/storage"

import { GoogleSpreadsheet } from "./GoogleSpreadsheet"

export const axios = Axios.create({
  baseURL: `https://sheets.googleapis.com/v4/spreadsheets`,
  // send arrays in params with duplicate keys - ie `?thing=1&thing=2` vs `?thing[]=1...`
  // solution taken from https://github.com/axios/axios/issues/604
  paramsSerializer: {
    serialize(params) {
      let options = ""
      _.keys(params).forEach((key) => {
        const isParamTypeObject = typeof params[key] === "object"
        const isParamTypeArray = isParamTypeObject && params[key].length >= 0
        if (!isParamTypeObject)
          options += `${key}=${encodeURIComponent(params[key])}&`
        if (isParamTypeObject && isParamTypeArray) {
          _.each(params[key], (val) => {
            options += `${key}=${encodeURIComponent(val)}&`
          })
        }
      })
      return options ? options.slice(0, -1) : options
    }
  }
})

enum AUTH_MODES {
  API_KEY = "API_KEY",
  RAW_ACCESS_TOKEN = "RAW_ACCESS_TOKEN",
  OAUTH = "OAUTH"
}

type GoogleSheetsManagerUpdate = {
  type: "update"
  value: string[]
}

type GoogleSheetsManagerModify = { type: "switch"; value: GoogleSpreadsheet }

export class GoogleSheetsManager extends Subject<
  GoogleSheetsManagerUpdate | GoogleSheetsManagerModify
> {
  static GOOGLE_SHEET_IDS = "GOOGLE_SHEET_IDS"
  readonly sheets = this.pipe(
    filter((res) => res.type === "update"),
    shareReplay<GoogleSheetsManagerUpdate>({
      bufferSize: 1,
      refCount: true
    })
  )
  readonly workSheets = this.pipe(
    filter((res) => res.type === "switch"),
    shareReplay<GoogleSheetsManagerModify>({
      bufferSize: 1,
      refCount: true
    })
  )

  private _sheetIds = new Set<string>()
  private _sheetsManager = new Map<string, GoogleSpreadsheet>()
  private _workGoogleSpreadsSheet?: GoogleSpreadsheet
  storage = new Storage()
  get workGoogleSpreadsSheet() {
    return this._workGoogleSpreadsSheet
  }
  accessToken: string
  apiKey: string
  oAuth2Client: any
  public authMode: AUTH_MODES

  constructor(public axios: AxiosInstance) {
    super()
    this.storage
      .get<string[]>(GoogleSheetsManager.GOOGLE_SHEET_IDS)
      .then((ids = []) => {
        if (ids.length) {
          ids.forEach((id) => {
            this._createGoogleSpreadSheet(id)
          })
          this.next({
            type: "update",
            value: [...this._sheetIds]
          })
        }
      })

    this.axios.interceptors.request.use(this._setAxiosRequestAuth.bind(this))
    this.axios.interceptors.response.use(
      this._handleAxiosResponse.bind(this),
      this._handleAxiosErrors.bind(this)
    )
  }

  getSheetIds() {
    return [...this._sheetIds]
  }

  private _createGoogleSpreadSheet(id: string) {
    const doc = new GoogleSpreadsheet(id, this.axios)
    this._sheetIds.add(id)
    this._sheetsManager.set(id, doc)

    return doc
  }

  async _setAxiosRequestAuth(config) {
    // TODO: check auth mode, if valid, renew if expired, etc
    if (this.authMode === AUTH_MODES.RAW_ACCESS_TOKEN) {
      if (!this.accessToken) throw new Error("Invalid access token")
      config.headers.Authorization = `Bearer ${this.accessToken}`
    } else if (this.authMode === AUTH_MODES.API_KEY) {
      if (!this.apiKey) throw new Error("Please set API key")
      config.params = config.params || {}
      config.params.key = this.apiKey
    } else if (this.authMode === AUTH_MODES.OAUTH) {
      const credentials = await this.oAuth2Client.getAccessToken()
      config.headers.Authorization = `Bearer ${credentials.token}`
    } else {
      throw new Error(
        "You must initialize some kind of auth before making any requests"
      )
    }
    return config
  }

  async _handleAxiosResponse(response) {
    return response
  }
  async _handleAxiosErrors(error) {
    // console.log(error);
    if (error.response && error.response.data) {
      // usually the error has a code and message, but occasionally not
      if (!error.response.data.error) throw error

      const { code, message } = error.response.data.error
      error.message = `Google API error - [${code}] ${message}`
      throw error
    }

    if (_.get(error, "response.status") === 403) {
      if (this.authMode === AUTH_MODES.API_KEY) {
        throw new Error(
          "Sheet is private. Use authentication or make public. (see https://github.com/theoephraim/node-google-spreadsheet#a-note-on-authentication for details)"
        )
      }
    }
    throw error
  }

  // AUTH RELATED FUNCTIONS ////////////////////////////////////////////////////////////////////////
  async useApiKey(key) {
    this.authMode = AUTH_MODES.API_KEY
    this.apiKey = key
  }

  // token must be created and managed (refreshed) elsewhere
  async useRawAccessToken(token, refresh) {
    this.authMode = AUTH_MODES.RAW_ACCESS_TOKEN
    this.accessToken = token
    if (refresh && typeof refresh === "function") {
      this.axios.interceptors.response.use(undefined, (err) => {
        if (err.response && err.response.status === 401) {
          return new Promise((resolve, reject) => {
            refresh(resolve, reject)
          }).then(() => {
            return this.axios.request(err.response.config)
          })
        }
      })
    }
  }

  async useOAuth2Client(oAuth2Client) {
    this.authMode = AUTH_MODES.OAUTH
    this.oAuth2Client = oAuth2Client
  }

  add(sheetId: string) {
    if (this._sheetIds.has(sheetId)) {
      throw Error(`GoogleSpreadsheet(${sheetId}) already existed`)
    }

    const doc = this._createGoogleSpreadSheet(sheetId)
    const ids = this.getSheetIds()
    this.storage.set(GoogleSheetsManager.GOOGLE_SHEET_IDS, ids)
    this.next({
      type: "update",
      value: ids
    })

    return doc
  }

  remove(sheetId: string) {
    this._sheetsManager.delete(sheetId)
    this._sheetIds.delete(sheetId)
    const ids = this.getSheetIds()
    this.storage.set(GoogleSheetsManager.GOOGLE_SHEET_IDS, ids)
    this.next({
      type: "update",
      value: ids
    })
    return true
  }

  switchTo(sheetId: string) {
    if (this._sheetsManager.has(sheetId)) {
      this._workGoogleSpreadsSheet = this._sheetsManager.get(sheetId)!
      this.next({
        type: "switch",
        value: this._workGoogleSpreadsSheet
      })
      return this._workGoogleSpreadsSheet
    } else {
      throw Error(`there is no sheet for ${sheetId}`)
    }
  }
}

export const googleSheetsManager = new GoogleSheetsManager(axios)
