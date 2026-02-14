# RSVP Form — Google Sheets Backend

The RSVP form submits data to a Google Apps Script web app, which writes rows to a Google Sheet.

## Setup

### 1. Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com) and create a new spreadsheet
2. Name it something like "Wedding RSVPs"
3. In Row 1, add these column headers (in order):

| A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|
| Timestamp | Name | Attending | Party Size | Kids 5 & Under | Kids 6-10 | Dietary | Email | Phone | Comments |

### 2. Add the Apps Script

1. In your Google Sheet, go to **Extensions > Apps Script**
2. Delete any existing code and paste the following:

```js
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  var data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: "error", error: "Invalid JSON" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  sheet.appendRow([
    data.timestamp || new Date().toISOString(),
    data.name || "",
    data.attending || "",
    data.partySize || 0,
    data.kidsUnder5 || 0,
    data.kids6to10 || 0,
    data.dietary || "",
    data.email || "",
    data.phone || "",
    data.comments || "",
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ result: "success" }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. Click **Save** (Ctrl+S)

### 3. Deploy as a Web App

1. Click **Deploy > New deployment**
2. Click the gear icon next to "Select type" and choose **Web app**
3. Set:
   - **Description**: "Wedding RSVP"
   - **Execute as**: Me
   - **Who has access**: Anyone
4. Click **Deploy**
5. Authorize the app when prompted (review permissions and allow)
6. Copy the **Web app URL** — it looks like:
   ```
   https://script.google.com/macros/s/XXXXXXXXX/exec
   ```

### 4. Add the URL to the Site

Open `src/data/siteContent.js` and paste your URL into the `submitUrl` field:

```js
rsvp: {
    // ...
    submitUrl: "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec",
    // ...
},
```

Save and rebuild. The RSVP form will now submit directly to your Google Sheet.

## Testing

1. Fill out the RSVP form on your site and submit
2. Check your Google Sheet — a new row should appear with the submitted data
3. If nothing appears, check the Apps Script execution log: **Apps Script editor > Executions**

## Updating the Script

If you redeploy after making changes to the script, you must create a **new deployment** (not update the existing one) for the changes to take effect with the same URL. Alternatively, update the existing deployment version.
