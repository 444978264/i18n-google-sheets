import Axios, { AxiosInstance, AxiosRequestConfig } from "axios"
import _ from "lodash"
import {
  Subject,
  combineLatest,
  distinctUntilChanged,
  filter,
  map,
  shareReplay
} from "rxjs"

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
      console.log(
        options ? options.slice(0, -1) : options,
        "options ? options.slice(0, -1) : options"
      )
      return options ? options.slice(0, -1) : options
    }
  }
})

export enum AUTH_MODES {
  API_KEY = "API_KEY",
  RAW_ACCESS_TOKEN = "RAW_ACCESS_TOKEN",
  OAUTH = "OAUTH"
}

type GoogleSheetsManagerUpdate = {
  type: "update"
  value: string[]
}

type GoogleSheetsManagerModify = { type: "switch"; value: GoogleSpreadsheet }

type GoogleSheetsAuthMode = { type: "authMode"; value: AUTH_MODES }

type IOAuth2 = {
  getAuthToken(
    details?: chrome.identity.TokenDetails
  ): Promise<[string, undefined] | [undefined, chrome.runtime.LastError]>
  refreshAuthToken(
    token: string
  ): Promise<[string, undefined] | [undefined, chrome.runtime.LastError]>
}

export class GoogleSheetsManager extends Subject<
  GoogleSheetsManagerUpdate | GoogleSheetsManagerModify | GoogleSheetsAuthMode
> {
  static GOOGLE_SHEET_IDS = "GOOGLE_SHEET_IDS"
  static AUTH_MODE = "AUTH_MODE"
  readonly MAX_RETRY = 3
  private _eventHandles: ((
    s: GoogleSpreadsheet
  ) => (s: GoogleSpreadsheet) => void)[] = []
  readonly sheets = this.pipe(
    filter((res) => res.type === "update"),
    map((d) => d.value),
    distinctUntilChanged(),
    shareReplay<GoogleSheetsManagerUpdate["value"]>({
      bufferSize: 1,
      refCount: true
    })
  )
  readonly workSheets = this.pipe(
    filter((res) => res.type === "switch"),
    map((d) => d.value),
    distinctUntilChanged(),
    shareReplay<GoogleSheetsManagerModify["value"]>({
      bufferSize: 1,
      refCount: true
    })
  )
  readonly mode = this.pipe(
    filter((res) => res.type === "authMode"),
    map((d) => d.value),
    distinctUntilChanged(),
    shareReplay<GoogleSheetsAuthMode["value"]>({
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
  oAuth2: IOAuth2
  public authMode: AUTH_MODES

  constructor(public axios: AxiosInstance) {
    super()

    this.storage
      .get<string[]>(GoogleSheetsManager.GOOGLE_SHEET_IDS)
      .then((ids = []) => {
        if (ids.length) {
          this._sheetIds = new Set(ids)
          this._sheetIds.forEach((id) => {
            const doc = this._createGoogleSpreadSheet(id)
            this._sheetsManager.set(id, doc)
            // doc.loadInfo().then(console.log)
            // console.log("load", doc)
          })
          this.next({
            type: "update",
            value: [...this._sheetIds]
          })
        }
      })

    this.storage
      .get<AUTH_MODES>(GoogleSheetsManager.AUTH_MODE)
      .then((AUTH_MODE) => {
        if (AUTH_MODE) {
          this.authMode = AUTH_MODE
        }
      })

    combineLatest([this.workSheets, this.mode]).subscribe(([_workSheet]) => {
      console.log(_workSheet)
      const handles = this._eventHandles.map((fn) => {
        return fn(_workSheet)
      })
      _workSheet.loadInfo().finally(() => {
        handles.forEach((fn) => {
          fn(_workSheet)
        })
      })
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

  onLoad(fn: (s: GoogleSpreadsheet) => (s: GoogleSpreadsheet) => void) {
    this._eventHandles.push(fn)

    return () => {
      const idx = this._eventHandles.indexOf(fn)
      idx > -1 && this._eventHandles.splice(idx, 1)
    }
  }

  private _createGoogleSpreadSheet(id: string) {
    if (this._sheetsManager.has(id)) {
      return this._sheetsManager.get(id)
    }
    const doc = new GoogleSpreadsheet(id, this.axios)
    return doc
  }

  private _setAuthorization(config: AxiosRequestConfig, token: string) {
    config.headers.Authorization = `Bearer ${token}`
  }

  private _ejectAuthorization(authorization: string) {
    return authorization.replace("Bearer", "").trim()
  }

  async _setAxiosRequestAuth(config) {
    if (this.authMode === AUTH_MODES.RAW_ACCESS_TOKEN) {
      if (!this.accessToken) throw new Error("Invalid access token")
      this._setAuthorization(config, this.accessToken)
    } else if (this.authMode === AUTH_MODES.API_KEY) {
      if (!this.apiKey) throw new Error("Please set API key")
      config.params = config.params || {}
      config.params.key = this.apiKey
    } else if (this.authMode === AUTH_MODES.OAUTH) {
      const [token, error] = await this.oAuth2.getAuthToken()
      if (error) return Promise.reject(error)
      this._setAuthorization(config, token)
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
    if (this.authMode === AUTH_MODES.OAUTH) {
      if (error.response && error.response.status === 401) {
        const token = this._ejectAuthorization(
          error.response.config.headers.Authorization
        )

        if (!error.response.config.retry) {
          error.response.config.retry = 1
        } else if (error.response.config.retry >= this.MAX_RETRY) {
          return Promise.reject(error)
        }

        return this.oAuth2.refreshAuthToken(token).then(([token, err]) => {
          error.response.config.retry += 1
          return err
            ? Promise.reject(err)
            : this.axios.request(error.response.config)
        })
      }
    }

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

  private _setAuthMode(type: AUTH_MODES) {
    this.authMode = type
    this.storage.set(GoogleSheetsManager.AUTH_MODE, type)
  }

  getAuthMode() {
    return this.authMode
      ? Promise.resolve(this.authMode)
      : this.storage.get<AUTH_MODES>(GoogleSheetsManager.AUTH_MODE)
  }

  async useApiKey(key) {
    this._setAuthMode(AUTH_MODES.API_KEY)
    this.apiKey = key
    this.next({
      type: "authMode",
      value: AUTH_MODES.API_KEY
    })
  }

  // token must be created and managed (refreshed) elsewhere
  async useRawAccessToken(token) {
    this._setAuthMode(AUTH_MODES.RAW_ACCESS_TOKEN)
    this.accessToken = token
    this.next({
      type: "authMode",
      value: AUTH_MODES.RAW_ACCESS_TOKEN
    })
  }

  async useOAuth2(oAuth2: IOAuth2) {
    this._setAuthMode(AUTH_MODES.OAUTH)
    this.oAuth2 = oAuth2
    this.next({
      type: "authMode",
      value: AUTH_MODES.OAUTH
    })
  }

  add(sheetId: string): Promise<GoogleSpreadsheet | null> {
    if (this._sheetIds.has(sheetId)) {
      throw Error(`GoogleSpreadsheet(${sheetId}) already existed`)
    }
    const doc = this._createGoogleSpreadSheet(sheetId)

    return doc.loadInfo().then((doc) => {
      if (doc.invalid) return null
      this._sheetIds.add(sheetId)
      this._sheetsManager.set(sheetId, doc)
      if (this._sheetsManager.size === 1) {
        this.switchTo(sheetId)
      }

      const ids = this.getSheetIds()
      this.storage.set(GoogleSheetsManager.GOOGLE_SHEET_IDS, ids)
      console.log(ids, "ids")
      this.next({
        type: "update",
        value: ids
      })
      return doc
    })
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
