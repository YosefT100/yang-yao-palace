function setupAllSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var sheets = {
    "Students": ["Name", "Email", "Registered At", "Status"],
    "Teachers": ["Name", "Email", "Phone / WeChat", "WhatsApp", "Telegram", "Promoted At", "HSK Levels", "Active Groups"],
    "Teacher Payments": ["Teacher Name", "Email", "Phone / WeChat", "HSK Level", "Group Name", "Lessons Taught", "Amount Owed", "Pay Date", "Status"],
    "Payments": ["Student Name", "Student Email", "Amount ($)", "HSK Level", "Group Name", "Paid At", "Status"],
    "Attendance": ["Date", "HSK Level", "Group Name", "Teacher Name", "Students Present", "Absent Students", "Absent Reason", "Duration (min)", "Completed"],
    "HSK1 Lessons": ["Date", "Time", "Group Name", "Teacher Name", "Lesson Type", "Status", "Notes"],
    "HSK2 Lessons": ["Date", "Time", "Group Name", "Teacher Name", "Lesson Type", "Status", "Notes"],
    "HSK3 Lessons": ["Date", "Time", "Group Name", "Teacher Name", "Lesson Type", "Status", "Notes"],
    "HSK4 Lessons": ["Date", "Time", "Group Name", "Teacher Name", "Lesson Type", "Status", "Notes"],
    "HSK5 Lessons": ["Date", "Time", "Group Name", "Teacher Name", "Lesson Type", "Status", "Notes"],
    "HSK6 Lessons": ["Date", "Time", "Group Name", "Teacher Name", "Lesson Type", "Status", "Notes"]
  };

  var allSheets = ss.getSheets();
  var sheetNames = Object.keys(sheets);
  var seen = {};
  for (var i = allSheets.length - 1; i >= 0; i--) {
    var name = allSheets[i].getName();
    if (!sheetNames.includes(name) || seen[name]) {
      if (ss.getSheets().length > 1) ss.deleteSheet(allSheets[i]);
    } else {
      seen[name] = true;
    }
  }

  for (var sheetName in sheets) {
    var sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);
    var headers = sheets[sheetName];
    sheet.clear();
    var range = sheet.getRange(1, 1, 1, headers.length);
    range.setValues([headers]);
    range.setBackground("#1A0A00").setFontColor("#D4AF37").setFontWeight("bold").setFontSize(10).setVerticalAlignment("middle").setHorizontalAlignment("center").setWrap(false);
    sheet.setRowHeight(1, 35);
    sheet.setFrozenRows(1);
    for (var i = 1; i <= headers.length; i++) {
      sheet.setColumnWidth(i, 160);
    }
  }
}
