function setupAllSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = {
    "Students": ["Name", "Email", "Registered At"],
    "Teachers": ["Name", "Email", "Promoted At"],
    "Payments": ["Student Name", "Student Email", "Amount", "HSK Level", "Group Name", "Paid At"],
    "Attendance": ["Date", "HSK Level", "Group Name", "Teacher Name", "Students Present", "Absent Students", "Absent Reason", "Duration (min)", "Completed"],
    "HSK1 Lessons": ["Date", "Time", "Group Name", "Teacher Name", "Lesson Type", "Status"],
    "HSK2 Lessons": ["Date", "Time", "Group Name", "Teacher Name", "Lesson Type", "Status"],
    "HSK3 Lessons": ["Date", "Time", "Group Name", "Teacher Name", "Lesson Type", "Status"],
    "HSK4 Lessons": ["Date", "Time", "Group Name", "Teacher Name", "Lesson Type", "Status"],
    "HSK5 Lessons": ["Date", "Time", "Group Name", "Teacher Name", "Lesson Type", "Status"],
    "HSK6 Lessons": ["Date", "Time", "Group Name", "Teacher Name", "Lesson Type", "Status"]
  };

  for (var name in sheets) {
    var sheet = ss.getSheetByName(name) || ss.insertSheet(name);
    var headers = sheets[name];
    var range = sheet.getRange(1, 1, 1, headers.length);
    range.setValues([headers]);
    range.setBackground("#8B0000").setFontColor("#D4AF37").setFontWeight("bold").setFontSize(11);
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, headers.length);
  }
}
