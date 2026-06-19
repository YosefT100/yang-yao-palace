/**
 * Yang Yao Palace — Google Sheets Setup Script
 * Google Sheets ID: 1oZbf6mUTuS28j80qJwAteQoQN0qdVqwPAciu3AZ-Q-Y
 *
 * HOW TO USE:
 * 1. Open your Google Sheet
 * 2. Extensions → Apps Script
 * 3. Paste this entire file
 * 4. Click Run → setupAllSheets
 * 5. Grant permissions when prompted
 */

const HEADER_BG = "#8B0000";
const HEADER_FG = "#D4AF37";

const SHEETS = {
  Students: ["Name", "Email", "Registered At"],
  Teachers: ["Name", "Email", "Promoted At"],
  Payments: ["Student Name", "Student Email", "Amount", "HSK Level", "Group Name", "Paid At"],
  Attendance: [
    "Date", "HSK Level", "Group Name", "Teacher Name",
    "Students Present", "Absent Students", "Absent Reason",
    "Duration (min)", "Completed"
  ],
  "HSK1 Lessons": ["Date", "Time", "HSK Level", "Group Name", "Teacher Name", "Lesson Type", "Status"],
  "HSK2 Lessons": ["Date", "Time", "HSK Level", "Group Name", "Teacher Name", "Lesson Type", "Status"],
  "HSK3 Lessons": ["Date", "Time", "HSK Level", "Group Name", "Teacher Name", "Lesson Type", "Status"],
  "HSK4 Lessons": ["Date", "Time", "HSK Level", "Group Name", "Teacher Name", "Lesson Type", "Status"],
  "HSK5 Lessons": ["Date", "Time", "HSK Level", "Group Name", "Teacher Name", "Lesson Type", "Status"],
  "HSK6 Lessons": ["Date", "Time", "HSK Level", "Group Name", "Teacher Name", "Lesson Type", "Status"],
};

function setupAllSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  for (const [sheetName, headers] of Object.entries(SHEETS)) {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }

    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setValues([headers]);
    headerRange
      .setBackground(HEADER_BG)
      .setFontColor(HEADER_FG)
      .setFontWeight("bold")
      .setFontSize(11)
      .setHorizontalAlignment("center");

    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, headers.length);

    for (let i = 1; i <= headers.length; i++) {
      if (sheet.getColumnWidth(i) < 120) sheet.setColumnWidth(i, 120);
    }
  }

  const defaultSheet = ss.getSheetByName("Sheet1");
  if (defaultSheet && defaultSheet.getLastRow() === 0) {
    ss.deleteSheet(defaultSheet);
  }

  SpreadsheetApp.getUi().alert(
    "✅ Yang Yao Palace sheets set up successfully!\n\n" +
    Object.keys(SHEETS).join("\n")
  );
}

function clearAllData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  for (const sheetName of Object.keys(SHEETS)) {
    const sheet = ss.getSheetByName(sheetName);
    if (sheet && sheet.getLastRow() > 1) {
      sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clearContent();
    }
  }
  SpreadsheetApp.getUi().alert("🗑️ All data rows cleared. Headers preserved.");
}
