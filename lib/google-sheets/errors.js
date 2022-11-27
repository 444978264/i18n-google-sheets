export class GoogleSpreadsheetFormulaError {
  constructor(errorInfo) {
    this.type = errorInfo.type
    this.message = errorInfo.message
  }
}
