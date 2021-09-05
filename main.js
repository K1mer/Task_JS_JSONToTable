/* { Переменные и константы }
EyeColorsToHEX - содержат HEX-представления цветов,
              требуемые для дополнительного пункта задания

ColumnNames    - массив, используемый для создания
              верхней строки таблицы

RowsOnPage     - количество записей на одной странице

head, body     - главные элементы html страницы; выписаны отдельно, 
              сугубо для удобства в обращении

MainTable      - элемент <table>, блок таблицы

red_div        - элемент <div>, блок редактора

hide_div        - элемент <div>, блок редактора

TableRows      - массив, хранящий в себе все строки
              таблицы и поля с данными людей

bToAscend      - временные переменные, используемые в
              функциях ниже (их описание также находится ниже)

SelectedRow    - текущая выбранная строка, данные 
              строки и её индекс в таблице TableRows
*/

const EyeColorsToHEX = {
  "none": "white",
  "blue": "#4b8996",  "brown": "#5e361f",
  "red": "#8f2228",   "green": "#5a7841"
}
const ColumnNames = [
  { PrintName: "First Name",  FieldName: "firstName"},
  { PrintName: "Last Name",   FieldName: "lastName"},
  { PrintName: "About",       FieldName: "about"},
  { PrintName: "EyeColor",    FieldName: "eyeColor"},
]

const head = document.head,
  body = document.body,
  RowsOnPage = 10

let MainTable = null,
  red_div = null,
  hide_div = null,
  TableRows = [],
  SelectedRow = null

var bToAscend = false



Main()  // Начало работы



//        { Основные функции }


 //    Функция, которая запускает всю работу     \\
function Main() {
  InitPage()
  CreateTable()
  CreateRows()
  CreatePages()
  SetPage(1)
  CreateRedactor()
  CreateHideMenu()
}


  //               Первичная инициализация              \\
 // Добавляется элемент <title>, считываются необходимые \\
//          поля из data.js в таблицу TableRows           \\
function InitPage() {
  let title = document.createElement("title")
  title.innerText = "JSON To Table"
  head.appendChild(title)

  data.forEach((person, key) => TableRows[key] = {
    "id": person.id,
    "firstName": person.name.firstName,
    "lastName": person.name.lastName,
    "about": person.about,
    "eyeColor": person.eyeColor
  })
}


// Создание таблицы и её верхней строки \\
function CreateTable() {
  MainTable = document.createElement("table")

  body.appendChild(MainTable)

  MainTable.HeadRow = MainTable.insertRow()  // Создается верхняя строка таблицы

  let tr = MainTable.HeadRow
  ColumnNames.forEach(val => {
    tr[val.FieldName] = document.createElement("th") // Создаются ячейки верхней строки
    tr[val.FieldName].innerText = val.PrintName

    tr[val.FieldName].onclick = function() {           // По нажатию на заголовок начнётся сортировка
      SelectedRow = null                               // таблицы по выбранному пользователем полю
      SetDisplay(red_div, "none")

      bToAscend = !bToAscend

      TableRows.sort((a, b) => SortStrings(a[val.FieldName], b[val.FieldName]))
      RefillTable()
    }

    tr.appendChild(tr[val.FieldName])
  })
}


 //       Создание строк таблицы       \\
// Также заполняет таблицу в первый раз \\
function CreateRows() {
  TableRows.forEach((val, index) => {
    let row = MainTable.insertRow()         // Создание строки таблицы
    row.Data = TableRows[index]
    row.Index = index
    TableRows[index].RowElement = row

    let firstName = row.insertCell()   // Добавляется ячейка "Имени"
    row.firstName = firstName

    let lastName = row.insertCell()    // Добавляется ячейка "Фамилии"
    row.lastName = lastName

    let about = row.insertCell()        // Добавляется ячейка "Описания"
    about.div = document.createElement("div")
    about.appendChild(about.div)
    row.about = about

    let eyeColor = row.insertCell()    // Добавляется ячейка "Цвета глаз"
    row.eyeColor = eyeColor

    SetRow(row, val)                    // Установка значений элементов строки

    row.onclick = function() {          // Открытие редактора для выбранной строки
      SetRedactor(row)
    }

    ColorRow(row, index)                // Окрас строки для оформления таблицы
  });
}


  //     Заполнение таблицы строками      \\
 //  Обычно используется после сортировки  \\
//     т.к. заполняет её с первой строки    \\
function RefillTable() {
  TableRows.forEach((element, index) => {
    element.RowElement.Index = index            // Переиндексируем элементы в соответствии 
    MainTable.appendChild(element.RowElement)   // с их позициями в таблице TableRows

    ColorRow(element.RowElement, index)
  })
  SetPage(1)
}


// Устанавливаем нужную страницу таблицы \\
function SetPage(page_number) {
  TableRows.forEach((element, index) => {
    SetDisplay(element.RowElement, "none")
  })

  let ind = RowsOnPage * (page_number - 1)

  for (let index = 0; index < RowsOnPage; index++) {
    SetDisplay(TableRows[ind + index].RowElement, "table-row")
  }
}


 // Создание блока редактора \\
function CreateRedactor() {
  red_div = document.createElement("div");
  red_div.setAttribute("class", "redactor_div")

  red_div.input_firstName = document.createElement("input")
  red_div.input_lastName  = document.createElement("input")
  red_div.textarea_about  = document.createElement("textarea")
  red_div.select_eyecolor = document.createElement("select")
  red_div.button_confirm  = document.createElement("button")

  let option          // Добавление выбора цвета глаз в элемент <select>
  Object.entries(EyeColorsToHEX).forEach(([key, value]) => {
    option = document.createElement("option")
    option.innerText = key
    option.value = key
    option.style.background = value
    red_div.select_eyecolor.appendChild(option)
  });

  red_div.input_firstName.setAttribute("placeholder", "First Name")
  red_div.input_lastName.setAttribute("placeholder", "Last Name")
  red_div.textarea_about.setAttribute("placeholder", "About")
  red_div.button_confirm.innerText = "Confirm"

  // Сохранение изменений в строке по нажатии на кнопку "Confirm"
  red_div.button_confirm.onclick = function() {
    SelectedRow.Data.firstName  = red_div.input_firstName.value
    SelectedRow.Data.lastName   = red_div.input_lastName.value
    SelectedRow.Data.about      = red_div.textarea_about.value
    SelectedRow.Data.eyeColor   = red_div.select_eyecolor.value

    SetRow(SelectedRow.Element, SelectedRow.Data)
    ColorRow(SelectedRow.Element, SelectedRow.Index)
    SelectedRow = null
    SetDisplay(red_div, "none")
  }

  red_div.appendChild(red_div.input_firstName)
  red_div.appendChild(red_div.input_lastName)
  red_div.appendChild(red_div.textarea_about)
  red_div.appendChild(red_div.select_eyecolor)
  red_div.appendChild(red_div.button_confirm)
  
  body.appendChild(red_div);
}


// Меню показа/скрытия колонок \\
function CreateHideMenu() {
  hide_div = document.createElement("div")
  hide_div.setAttribute("class", "hidemenu_div")
  body.appendChild(hide_div)

  let btn
  ColumnNames.forEach(val => {
    btn = document.createElement("button")
    btn.innerText = val.PrintName
    btn.IsShown = true

    btn.onclick = function() {
      if (this.IsShown) {
        TableRows.forEach((element) => {
          SetDisplay(element.RowElement[val.FieldName], "none")
        })
        SetDisplay(MainTable.HeadRow[val.FieldName], "none")
      }
      else {
        TableRows.forEach((element) => {
          SetDisplay(element.RowElement[val.FieldName], "table-cell")
        })
        SetDisplay(MainTable.HeadRow[val.FieldName], "table-cell")
      }

      this.IsShown = !this.IsShown
    }

    hide_div.appendChild(btn)
  })
}


// Блок выбора страниц под таблицей \\
function CreatePages() {
  let PageListBlock = document.createElement("div")
  PageListBlock.setAttribute("class", "pagelist")
  body.appendChild(PageListBlock)

  let PageNumberInput = document.createElement("input")
  PageNumberInput.setAttribute("type", "number")

  let PageAmount = Math.ceil(TableRows.length / RowsOnPage)  // Количество строк страниц

  PageNumberInput.setAttribute("min", "1")
  PageNumberInput.setAttribute("max", PageAmount.toString())

  PageNumberInput.onchange = function() {
    let val = Math.min(Math.max(this.value, 1), PageAmount)  // Проверка на валидность вводимого числа

    this.value = val

    SetPage(val)
  }
  PageNumberInput.value = 1

  PageListBlock.appendChild(PageNumberInput)
}


// Установка выбранной строки в редакторе \\
function SetRedactor(row) {
  if (SelectedRow) {  // Снятие выделение с предыдущей выбранной строки, если такая есть
    ColorRow(SelectedRow.Element, SelectedRow.Index)
  }

  SelectedRow = {  // Задаём новую выбранную строку
    Data: row.Data,
    Element: row,
    Index: row.Index
  }

  // Установка полей в блоке редактирования
  SetDisplay(red_div, "block")

  red_div.input_firstName.value = SelectedRow.Data.firstName
  red_div.input_lastName.value = SelectedRow.Data.lastName
  red_div.textarea_about.value = SelectedRow.Data.about
  red_div.select_eyecolor.value = SelectedRow.Data.eyeColor

  SelectedRow.Element.style.setProperty("background", "#ADD8E6")
}


// Функция окрашивает фон каждой нечётной строки таблицы \\
function ColorRow(row, ind) {
  if (ind % 2) {
    row.style.backgroundColor = "#e2e2e2"
  }
  else {
    row.style.backgroundColor = "white"
  }
}


 //      Функция сравнения строк для сортировки строк таблицы        \\
// Переменная "bToAscend" отвечает за сторону сортировки (по уб/возр) \\
function SortStrings(a,b) {
  let to_return = 0
  if (a > b) {
    to_return = 1
  }
  else if (a < b) {
    to_return = -1
  }

  to_return = to_return * ( bToAscend ? 1 : -1 )

  return to_return
}


 // Установка новых значений полей строки \\
function SetRow(Row, Data) {
  Row.firstName.innerText = Data.firstName
  Row.lastName.innerText = Data.lastName
  Row.about.div.innerText = Data.about
  Row.eyeColor.style.backgroundColor = EyeColorsToHEX[Data.eyeColor]
}


// Изменение параметра стиля "display" \\
function SetDisplay(element, value) {
  element.style.setProperty("display", value)
}