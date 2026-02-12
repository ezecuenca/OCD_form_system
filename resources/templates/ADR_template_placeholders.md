# ADR Template Placeholders

Use these **exact** strings in `ADR_template.docx`. Type them where you want the value to appear (e.g. `${forName}`).

---

## If you edit the template in Google Docs

1. **Download as Word when you’re done**  
   **File → Download → Microsoft Word (.docx)**. Save that file as `ADR_template.docx` in your project at `resources/templates/ADR_template.docx` (overwrite the existing file). The app only uses this file; it does not read from Google Drive.

2. **Type placeholders in one go**  
   Click where the value should go and type the full placeholder (e.g. `${forName}`) without clicking in the middle or changing font in the middle. If Google Docs splits it into multiple “runs”, export can break or leave placeholders unfilled.

3. **Header**  
   Use **Insert → Header** and type `${headerAddress}` as **plain text** in the header. Do not put the header text inside a Drawing or image, or the export may not replace it.

4. **Footer (Google Docs – important)**  
   - **Do not put the footer text inside a text box or Drawing.** If the contact info (Office of Civil Defense…, Email, Hotline, Facebook page) is inside a “box” (Insert → Drawing → Text box), it will be too narrow when exported to Word/PDF and words will be cut off.  
   - **Use normal text in the footer:** Click **Insert → Headers & footers → Footer**. Type or paste the tagline, office name, email, hotline, and Facebook page as **plain paragraph text** in the footer. Center it with **Format → Align & indent → Center**. The text will use the full page width and won’t be clipped.  
   - **Blue line:** Use **Insert → Horizontal line** in the footer (above or below the text as you prefer). Don’t put the line inside a Drawing.  
   - **If you already have a text box in the footer:** Double‑click the drawing to open it, select all the text inside (Ctrl+A), copy (Ctrl+C), close the drawing. Click the footer area, delete the drawing (click it and press Delete). Paste (Ctrl+V) so the text is now normal footer text. Then add the horizontal line if needed.

   **Changing the line’s look (color, thickness) in Google Docs:**  
   - **Option A – Paragraph border (recommended):** In the footer, add an empty line where you want the rule. Select that paragraph → **Format → Paragraph styles → Borders and shading**. Choose **Bottom border** (or Top), set **Color** (e.g. blue) and **Width** (e.g. 1 pt or 2 pt). Click **Apply**. The line uses the full footer width and exports well.  
   - **Option B – Line in a Drawing:** **Insert → Drawing → New**. In the drawing, click the **Line** tool, draw a horizontal line. Click the line → use the **Line color** and **Line weight** tools in the toolbar to set color (e.g. blue) and thickness. Make the line long enough to span the width of the canvas. **Save and close**. The drawing is inserted in the footer; when you download as .docx it should keep the style. If the line looks short in the PDF, use Option A instead.

5. **Tables**  
   One **header row** and **exactly one data row** per table (e.g. one row with `${ATT_NUM}`, `${ATT_NAME}`, `${ATT_TASK}`). No merged cells in that data row. The export duplicates the row for each form row.

6. **Alignment (FOR/THRU/FROM, signatures)**  
   Use **Format → Align & indent → Indentation options** so the second line (e.g. `${forPosition}`) has the same left indent as the first. For signature blocks, use **Format → Line & paragraph spacing → Custom spacing** so Space before/after is the same for each block. See the sections below for step‑by‑step alignment.

7. **Re-download after any change**  
   Every time you edit the template in Google Docs, download again as **Microsoft Word (.docx)** and replace `resources/templates/ADR_template.docx` so the app uses the latest version.

### Template changes not showing in export (Word or PDF)?

- **Save to the correct file:** After downloading from Google Docs, save (or copy) the file to **`resources/templates/ADR_template.docx`** in your project folder. Overwrite the existing file. If you save it somewhere else (e.g. Downloads), the app will keep using the old template.
- **Hard refresh when testing PDF:** When you open the PDF in the browser, use **Ctrl+F5** (or Cmd+Shift+R on Mac) so the browser doesn’t show a cached PDF.
- **Restart the dev server:** After replacing the template, run `php artisan serve` again (or restart your web server) so the app picks up the new file.

---

## Single-value placeholders (type once in the document)


| Placeholder           | Form input / Meaning            |
| --------------------- | ------------------------------- |
| `${documentName}`     | Document name                   |
| `${headerAddress}`    | Header address (default: CAMP ROMUALDO C RUBI, BANCASI, BUTUAN CITY 8600, PHILIPPINES) |
| `${forName}`          | For (name)                      |
| `${forPosition}`      | For (position)                  |
| `${thruName}`         | Thru (name)                     |
| `${thruPosition}`     | Thru (position)                 |
| `${fromName}`         | From (name)                     |
| `${fromPosition}`     | From (position)                 |
| `${subject}`          | Subject                         |
| `${dateTime}`         | Date/Time                       |
| `${alertStatus}`      | Alert status (e.g. WHITE ALERT) |
| `${preparedBy}`       | Prepared by (name)              |
| `${preparedPosition}` | Prepared by (position)          |
| `${receivedBy}`       | Received by (name)              |
| `${receivedPosition}` | Received by (position)          |
| `${notedBy}`          | Noted by (name)                 |
| `${notedPosition}`    | Noted by (position)             |
| `${approvedBy}`       | Approved by (name)              |
| `${approvedPosition}` | Approved by (position)          |


---

## Table placeholders (one row per table – rows added automatically)

You only need **one data row** per table. The export duplicates that row so every form row appears in the DOCX. No need to add extra rows by hand.

**Adding more rows in the form:** The form already sends every row you add. The export fills placeholders `#1`, `#2`, … in order. To show more than the default rows, add more data rows in the template with the next numbers (e.g. `${ATT_NAME#21}`, `${ATT_TASK#21}`). Empty rows in the template show "-" when there’s no data.

| Section              | Placeholders filled | Max rows supported |
| -------------------- | ------------------- | ------------------- |
| Attendance           | `${ATT_NUM#1}` … `#50`, `${ATT_NAME#1}` … `#50`, `${ATT_TASK#1}` … `#50` | 50 |
| Reports              | `${REP_NUM#1}` … `#50`, `${REP_REPORT#1}` … `#50`, `${REP_REMARKS#1}` … `#50` | 50 |
| Communication (4A)   | `${COMM_PARTICULARS#1}` … `#50`, etc. | 50 |
| Other items (4)      | `${OTH_PARTICULARS#1}` … `#50`, etc. | 50 |
| Other admin (4B)     | `${ADM_CONCERN#1}` … `#30` | 30 |
| Endorsed items (5)   | `${END_NUM#1}` … `#30`, `${END_ITEM#1}` … `#30` | 30 |

### 1. Attendance (Section 2)

Use **exactly one data row** in the table. The export duplicates it for each attendee and removes any extra rows. Do not add a second row with `${ATT_NAME#2}` etc. by hand.

**Row number column:** Put the placeholder **`${ATT_NUM}`** in the first cell of the data row (do not type the digit 1). The export will replace it and fill **1, 2, 3, …** automatically for each row.

| Placeholder      | Form input        |
| ---------------- | ----------------- |
| **`${ATT_NUM}`** (recommended) or `${ATT_NUM#1}` | Row number. Use **`${ATT_NUM}`** in the template so each row gets the correct index (1, 2, 3 …). |
| `${ATT_NAME#1}` … `${ATT_NAME#50}` | Name (any trailing `#1` in data is stripped) |
| `${ATT_TASK#1}` … `${ATT_TASK#50}` | Task / assignment (if "bullet form" is checked, tasks are exported as bullet lines) |

### 2. Reports (Section 3)

Use **exactly one data row** in the table. The export duplicates it for each report row.

**Row number column:** Put the placeholder **`${REP_NUM}`** in the # column (do not type the digit 1). The export will fill **1, 2, 3, …** for each row.

| Placeholder       | Form input |
| ----------------- | ---------- |
| **`${REP_NUM}`** | Row number (1, 2, 3 …). Use in the # column so each row shows the correct index. |
| `${REP_REPORT#1}` … `${REP_REPORT#50}`  | Report     |
| `${REP_REMARKS#1}` … `${REP_REMARKS#50}` | Remarks    |

### 3. Communication (Section 4A)

| Placeholder            | Form input            |
| ---------------------- | --------------------- |
| `${COMM_PARTICULARS#1}` … `#50` | Particulars           |
| `${COMM_NO#1}` … `#50`         | No. of items          |
| `${COMM_CONTACT#1}` … `#50`    | Contact / designation |
| `${COMM_STATUS#1}` … `#50`     | Status / remarks      |

### 4. Other items (Section 4)

| Placeholder           | Form input       |
| --------------------- | ---------------- |
| `${OTH_PARTICULARS#1}` … `#50` | Particulars      |
| `${OTH_NO#1}` … `#50`          | No. of items     |
| `${OTH_STATUS#1}` … `#50`      | Status / remarks |

### 5. Other administrative matters (Section 4B)

Use **one** placeholder in **one** cell or one continuous run of text. If the placeholder is split (e.g. into separate table columns or Word “runs”), the exported text can appear with words spread across the line. Type `${ADM_CONCERN}` once where the full bullet list should go.

| Placeholder        | Form input       |
| ------------------ | ---------------- |
| **`${ADM_CONCERN}`** (first row) and `${ADM_CONCERN#1}` … `${ADM_CONCERN#30}` | Concern / matter (one text block; Enter = new bullet in the form). Export normalizes spaces so one run in the template shows correctly. |

### 6. Endorsed items (Section 5) – “1. The following were endorsed…”

Use **one data row** with both placeholders. The export duplicates the row and fills numbers 1.1, 1.2, 1.3, … and the item text.

| Placeholder     | Form input                |
| --------------- | ------------------------- |
| **`${END_NUM}`** or `${END_NUM#1}` | Sub-number under “1.”: **1.1**, 1.2, 1.3, … (use `${END_NUM}` in the template so the first row gets 1.1). |
| `${END_NUM#1}` … `${END_NUM#30}` | Same: 1.1, 1.2, 1.3, … for each row. |
| `${END_ITEM#1}` … `${END_ITEM#30}` | Endorsed item description (e.g. “2 units of mobile phones”). |

---

## Example for Attendance table

Add a table with a **header row** and **exactly one data row**:

| #   | Name          | Tasks         |
| --- | ------------- | ------------- |
| **`${ATT_NUM}`** | `${ATT_NAME}` | `${ATT_TASK}` |

- **Number column:** Use the placeholder **`${ATT_NUM}`** (not the digit 1). The export fills 1, 2, 3, … for each row.
- When you export, that single row is duplicated so each attendee gets a row; any other data rows in the template that contain these placeholders are removed. **Do not add a second row with `${ATT_NAME#2}` etc.**

---

## Example for Reports and Advisories table (Section 3)

Add a table with a **header row** and **exactly one data row**:

| #   | Reports and Advisories released | Remarks |
| --- | --------------------------------- | ------- |
| **`${REP_NUM}`** | `${REP_REPORT}` | `${REP_REMARKS}` |

- **Number column:** Use the placeholder **`${REP_NUM}`** (not the digit 1). The export fills 1, 2, 3, … for each row.
- When you export, that single row is duplicated for each report; any other data rows that contain these placeholders are removed.

---

## Aligning multi-line fields (FOR position, second line, etc.)

If the **second line** (e.g. `${forPosition}` under `${forName}`) is **indented to the right** and doesn’t line up with the first line, it’s usually one of these:

- **A tab or space** before the placeholder on the second line.
- **A separate paragraph** for the second line that has a different left indent.

### 1. Remove tab or space before the placeholder

- Click right before `${forPosition}` (or `${thruPosition}`, `${fromPosition}`).
- Press **Backspace** until any space or tab in front of the placeholder is removed so the placeholder starts in the same column as `${forName}` above it.

### 2. Make the second line’s paragraph match the first (Google Docs)

If the two lines are separate paragraphs and the second still sits to the right:

1. Click in the **second line** (the one with `${forPosition}`).
2. **Format → Align & indent → Indentation options**.
3. Set **Left indent** to **0** (or the same value as the line with `${forName}`).
4. Set **First line indent** to **0**.
5. Click **Apply**.

Do the same for the lines with `${thruPosition}` and `${fromPosition}` if needed.

### 3. Same idea in Microsoft Word

1. Click in the line that contains `${forPosition}`.
2. Right‑click → **Paragraph**.
3. Under **Indentation**, set **Left** to **0** (or same as the line above).
4. Set **Special** to **(none)**.
5. Click **OK**.

---

## Aligning signature blocks (Prepared by, Received by, Noted by, Approved)

If in the **exported document** the names and positions (e.g. "Outgoing Duty Officer" vs "Incoming Duty Officer") are **not aligned** between columns, or the position line sits lower in one block than another, fix the **template** in Google Docs so each block has the same structure and spacing.

### 1. Use the same structure in each block

For **Prepared by**, **Received by**, **Noted by**, and **Approved**, use exactly:

- Line 1: label (e.g. "Prepared by:")
- Line 2: name placeholder (e.g. `${preparedBy}`)
- Line 3: position placeholder (e.g. `${preparedPosition}`)

No extra blank lines, and no extra space before/after in one block that you don’t have in the others.

### 2. Make paragraph spacing identical (Google Docs)

Different "Space before" or "Space after" on the position line in one column will make that block sit higher or lower in the export.

1. Click in the line that contains **${preparedPosition}**.
2. **Format → Line & paragraph spacing → Custom spacing**.
3. Set **Space before** and **Space after** to **0** (or the same value you use everywhere).
4. Click **Apply**.
5. Do the **same** for **${receivedPosition}**, **${notedPosition}**, and **${approvedPosition}** (same Space before/after as prepared).

### 3. If you use a table for the two columns

- Put **Prepared by** and **Received by** in one row (e.g. cell 1: "Prepared by:" / cell 2: "Received by:").
- Next row: cell 1: `${preparedBy}` / cell 2: `${receivedBy}`.
- Next row: cell 1: `${preparedPosition}` / cell 2: `${receivedPosition}`.
- Turn off "Allow row to break across pages" for that table so the block doesn’t split.
- Set the same row height or "At least" line height for each row so both columns line up.

### 4. Left-align placeholders

For each block, ensure the name and position placeholders are **left-aligned** (no indent or the same indent). Select each placeholder line → **Format → Align & indent → Indentation options** → Left indent **0**, First line indent **0**.

After these changes, save the template and export again; the names and positions should align in the exported document.

---

## Check the template (optional)

From the project root, run:

```bash
php check_template.php
```

This reports which placeholders exist in `ADR_template.docx` and which are missing (e.g. `documentName`, `headerAddress`, `ATT_NUM`).

---

## If Word says "experienced an error trying to open the file"

1. **Type each placeholder as plain text in one go** – Click where the value should go, type the full `${placeholderName}` without changing font, size, or style in the middle. If Word splits it into multiple "runs", export can produce a corrupt file.
2. **No merged cells in the table row** that contains the placeholders (e.g. the row with `${ATT_NAME}` and `${ATT_TASK}`). Use a single row with one cell per column.
3. **Save the template as Word Document (.docx)** from Word (File → Save As → Word Document). Avoid "Strict" or other special formats.
4. The export process now repairs unescaped `&` in the generated file; if it still fails, re‑type the placeholders as in step 1 and replace the template file.

---

## PDF export and printing

- **Export as Word**: Document Preview → "Export as Word" downloads the filled DOCX.
- **Print / Export PDF**: Document Preview → "Print / Export PDF" generates the same document, converts it to PDF (via LibreOffice), and opens the PDF in the browser so you can print (Ctrl+P) or save.
- **Server requirement for PDF**: Install [LibreOffice](https://www.libreoffice.org/) on the server. Optionally set `LIBREOFFICE_PATH` in `.env` (e.g. `C:\Program Files\LibreOffice\program\soffice.exe` on Windows). If LibreOffice is not available, the PDF button shows an error and you can still use "Export as Word" and print from Word.
- **Get ~2 second PDF conversion:** Without the listener, each PDF takes 5–10+ seconds because LibreOffice starts from scratch. To get **about 2 seconds** per conversion:
  1. **Start the listener** (once): Double‑click **`start-libreoffice-listener.bat`** in the project folder, or in a terminal run:  
     `"C:\Program Files\LibreOffice\program\soffice.exe" --headless --accept="socket,host=127.0.0.1,port=2083;urp;StarOffice.ServiceManager"`  
     Leave that window open while you use the app.
  2. **Install unoconv** (talks to the listener):  
     - **Windows:** Install [Python](https://www.python.org/) if needed, then run `pip install unoconv`. Or use a [Windows build](https://github.com/dagwieers/unoconv) if available.  
     - **Linux:** `sudo apt install unoconv` (or your package manager).
  3. **Turn on the listener in the app:** In `.env` add or set:  
     `LIBREOFFICE_USE_LISTENER=true`  
     Restart `php artisan serve`. The app will use the listener when unoconv is available and fall back to the slower method otherwise.