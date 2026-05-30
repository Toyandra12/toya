# Google Sheets Template

Create a single Google Spreadsheet with **four tabs**. Share it with your service-account email (the `client_email` field from your service-account JSON) as **Editor**, then copy its document ID into `GOOGLE_SHEETS_DOCUMENT_ID`.

---

## Tab 1: `Ideas`
Stores every generated idea so the Idea Agent can deduplicate.

| run_id | timestamp | niche | title | logline | hook | beats | status |
|--------|-----------|-------|-------|---------|------|-------|--------|

- **run_id** - unique pipeline run identifier
- **title** is the dedup key. Do not edit historic rows.

---

## Tab 2: `Videos`
The canonical record of every published video.

| run_id | completed_at | niche | idea_title | veo_prompt | yt_title | yt_description | fb_caption | hashtags | drive_url | youtube_url | facebook_url | yt_status | fb_status | final_status |
|--------|--------------|-------|------------|------------|----------|----------------|------------|----------|-----------|-------------|--------------|-----------|-----------|--------------|

- **final_status** values: `published` | `partial_failure` | `failed`
- **yt_status / fb_status**: `scheduled` | `failed`

---

## Tab 3: `Logs`
Append-only log stream from both the main and error workflows.

| timestamp | run_id | level | stage | message | details |
|-----------|--------|-------|-------|---------|---------|

- **level** values: `INFO` | `WARN` | `ERROR`
- **stage** is the node or pipeline phase (e.g. `idea_generation`, `veo_submit`, `youtube_upload`).

---

## Tab 4: `RetryCounter`
Tracks consecutive failures per run so the error handler knows when to escalate.

| run_id | attempts | last_stage | last_error | updated_at |
|--------|----------|------------|------------|------------|

- The error handler increments `attempts` and notifies once it reaches `MAX_RETRY_ATTEMPTS`.

---

## One-shot setup script

In the spreadsheet, open **Extensions -> Apps Script** and paste:

```javascript
function setupAiVideoChannelSheet() {
  const ss = SpreadsheetApp.getActive();
  const tabs = {
    'Ideas': ['run_id','timestamp','niche','title','logline','hook','beats','status'],
    'Videos': ['run_id','completed_at','niche','idea_title','veo_prompt','yt_title','yt_description','fb_caption','hashtags','drive_url','youtube_url','facebook_url','yt_status','fb_status','final_status'],
    'Logs': ['timestamp','run_id','level','stage','message','details'],
    'RetryCounter': ['run_id','attempts','last_stage','last_error','updated_at']
  };
  Object.keys(tabs).forEach(name => {
    let sh = ss.getSheetByName(name);
    if (!sh) sh = ss.insertSheet(name);
    sh.clear();
    sh.appendRow(tabs[name]);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, tabs[name].length).setFontWeight('bold').setBackground('#0d1117').setFontColor('#ffffff');
  });
}
```

Run `setupAiVideoChannelSheet` once and you are done.
