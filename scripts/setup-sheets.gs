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
const ACCENT_BG = "#FBF6EC";

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

    // Create sheet if it doesn't exist
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      Logger.log("Created sheet: " + sheetName);
    } else {
      Logger.log("Sheet already exists, updating headers: " + sheetName);
    }

    // Write headers
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setValues([headers]);

    // Style headers
    headerRange
      .setBackground(HEADER_BG)
      .setFontColor(HEADER_FG)
      .setFontWeight("bold")
      .setFontSize(11)
      .setHorizontalAlignment("center");

    // Freeze header row
    sheet.setFrozenRows(1);

    // Auto-resize columns
    sheet.autoResizeColumns(1, headers.length);

    // Set minimum column widths
    for (let i = 1; i <= headers.length; i++) {
      if (sheet.getColumnWidth(i) < 120) {
        sheet.setColumnWidth(i, 120);
      }
    }

    // Alternate row banding
    const existingBandings = sheet.getBandings();
    existingBandings.forEach((b) => b.remove());
    sheet
      .getRange(2, 1, 1000, headers.length)
      .applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY)
      .setFirstRowColor("#FFFFFF")
      .setSecondRowColor(ACCENT_BG)
      .setHeaderRowColor(HEADER_BG);

    // Border on header
    headerRange.setBorder(
      true, true, true, true, false, false,
      "#D4AF37",
      SpreadsheetApp.BorderStyle.SOLID_MEDIUM
    );
  }

  // Delete default "Sheet1" if it still exists and is empty
  const defaultSheet = ss.getSheetByName("Sheet1");
  if (defaultSheet && defaultSheet.getLastRow() === 0) {
    ss.deleteSheet(defaultSheet);
  }

  SpreadsheetApp.getUi().alert(
    "✅ Yang Yao Palace sheets set up successfully!\n\n" +
    Object.keys(SHEETS).join("\n")
  );
}

/**
 * Optional: run this to clear all data rows (keeps headers).
 * Useful for resetting test data.
 */
function clearAllData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  for (const sheetName of Object.keys(SHEETS)) {
    const sheet = ss.getSheetByName(sheetName);
    if (sheet && sheet.getLastRow() > 1) {
      sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clearContent();
      Logger.log("Cleared data from: " + sheetName);
    }
  }
  SpreadsheetApp.getUi().alert("🗑️ All data rows cleared. Headers preserved.");
}
