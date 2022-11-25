import fontPickerHTML from "url:./panels/font-picker/index.html"
import fontPropertiesHTML from "url:./panels/font-properties/index.html"

console.log(fontPickerHTML, fontPropertiesHTML)

chrome.devtools.panels.create(
  "Font Picker",
  null,
  // See: https://github.com/PlasmoHQ/plasmo/issues/106#issuecomment-1188539625
  fontPickerHTML.split("/").pop()
)

chrome.devtools.panels.elements.createSidebarPane(
  "Font Properties",
  function (sidebar) {
    sidebar.setPage(fontPropertiesHTML.split("/").pop())
  }
)

function IndexDevtools() {
  return <div>IndexDevtools</div>
}

export default IndexDevtools
