# ADR Template Placeholders

Use these **exact** strings in `ADR_template.docx`. Type them where you want the value to appear (e.g. `${forName}`).

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
| Reports              | `${REP_REPORT#1}` … `#50`, `${REP_REMARKS#1}` … `#50` | 50 |
| Communication (4A)   | `${COMM_PARTICULARS#1}` … `#50`, etc. | 50 |
| Other items (4)      | `${OTH_PARTICULARS#1}` … `#50`, etc. | 50 |
| Other admin (4B)     | `${ADM_CONCERN#1}` … `#30` | 30 |
| Endorsed items (5)   | `${END_ITEM#1}` … `#30` | 30 |

### 1. Attendance (Section 2)

Use **exactly one data row** in the table. The export duplicates it for each attendee and removes any extra rows. Do not add a second row with `${ATT_NAME#2}` etc. by hand.

| Placeholder      | Form input        |
| ---------------- | ----------------- |
| `${ATT_NUM}` or `${ATT_NUM#1}` | Row number (1, 2, 3 …). Use in the first column so each row shows the correct index. |
| `${ATT_NAME#1}` … `${ATT_NAME#50}` | Name (any trailing `#1` in data is stripped) |
| `${ATT_TASK#1}` … `${ATT_TASK#50}` | Task / assignment (if "bullet form" is checked, tasks are exported as bullet lines) |

### 2. Reports (Section 3)

| Placeholder       | Form input |
| ----------------- | ---------- |
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

| Placeholder        | Form input       |
| ------------------ | ---------------- |
| `${ADM_CONCERN#1}` … `${ADM_CONCERN#30}` | Concern / matter |

### 6. Endorsed items (Section 5)

| Placeholder     | Form input                |
| --------------- | ------------------------- |
| `${END_ITEM#1}` … `${END_ITEM#30}` | Endorsed item description |

---

## Example for Attendance table

Add a table with a **header row** and **exactly one data row**:

| #   | Name          | Tasks         |
| --- | ------------- | ------------- |
| `${ATT_NUM}` | `${ATT_NAME}` | `${ATT_TASK}` |

(or `${ATT_NUM#1}`, `${ATT_NAME#1}`, `${ATT_TASK#1}`). When you export, that single row is duplicated so each attendee gets a row; any other data rows in the template that contain these placeholders are removed. **Do not add a second row with `${ATT_NAME#2}` etc.**

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