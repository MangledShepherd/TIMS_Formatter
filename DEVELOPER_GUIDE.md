# TIMS Live Formatter - Developer Guide

**Complete technical documentation for modifying and maintaining the TIMS Live Roster Formatter**

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture & How It Works](#architecture--how-it-works)
3. [File Structure](#file-structure)
4. [Modifying the Output Format](#modifying-the-output-format)
5. [Common Customizations](#common-customizations)
6. [Deployment Workflow](#deployment-workflow)
7. [Troubleshooting](#troubleshooting)
8. [Version History](#version-history)

---

## Project Overview

### What It Does

The TIMS Live Roster Formatter is a **browser bookmarklet** that reformats the TIMS Employee Self Service roster page into a mobile-friendly, dark-themed view.

### Key Features

- **Live Data**: Works directly on the TIMS website (no offline files)
- **Dark Theme**: Easy-on-eyes dark background (#121212)
- **Smart Filtering**: Removes duplicate OFF entries
- **Quick View**: Shows today and tomorrow at the top
- **Mobile Optimized**: Responsive design for phones and tablets
- **Timezone Aware**: Uses local timezone for accurate dates

### Two Versions

1. **Full Bookmarklet** (10,713 chars)
   - Self-contained, works offline
   - All code embedded in the bookmark
   - File: `bookmarklet.txt`

2. **Short Bookmarklet** (191 chars) ⭐ Recommended for mobile
   - Loads from GitHub via CDN
   - Avoids clipboard size limits
   - File: `bookmarklet_short.txt`

---

## Architecture & How It Works

### Execution Flow

```
User clicks bookmark
    ↓
Bookmarklet JavaScript executes
    ↓
1. Extract roster data from TIMS table
2. Filter duplicate entries
3. Sort by date (newest first)
4. Generate HTML with dark theme
5. Replace page with formatted version
```

### Data Extraction Process

**Source:** TIMS roster table (`<table><tbody><tr>` elements)

**Extraction Steps:**
1. Query all table rows: `document.querySelectorAll('table tbody tr')`
2. For each row, read cells:
   - Cell 0: Week start date (e.g., "2025-10-05")
   - Cell 1: Department
   - Cell 2: Employee
   - Cell 3: Roster type (Normal, ADO, PRO, VOTSUN)
   - Cells 4-10: Seven days of shift data

3. Parse dates in **local timezone** (not UTC) to avoid date shifting
4. Create day objects with shift information

### Filtering Logic

**Problem:** TIMS shows multiple roster types (Normal, ADO, PRO, VOTSUN) for each week, creating duplicate OFF entries.

**Solution:**
```javascript
// For each date, filter to show only:
1. Days with actual shift data (non-OFF entries)
2. If all entries are OFF, show only the "Normal" roster type
3. This prevents showing "OFF" 4 times for the same day
```

### Date Handling (CRITICAL)

**Problem Solved:** Original version used UTC dates, causing timezone issues in Australia (UTC+10/+11).

**Solution:**
```javascript
// Parse dates as LOCAL, not UTC
const parts = weekStart.split('-');
startDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));

// Generate date strings in local timezone
function getLocalDateStr(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
```

**Never use:** `toISOString()` or `new Date(dateString)` without timezone handling!

---

## File Structure

### Core Files

```
TIMS_Live_Formatter_V2/
│
├── tims_live_formatter.js      # Main source code (readable)
├── bookmarklet.txt              # Full bookmarklet (10,713 chars)
├── bookmarklet_short.txt        # Short loader (191 chars)
├── install.html                 # Interactive installer
│
├── README.md                    # User documentation
├── DEVELOPER_GUIDE.md           # This file
├── VERSION.txt                  # Version history
├── START_HERE.txt               # Quick start
├── QUICK_START.txt              # Fast setup guide
└── MOBILE_SETUP.txt             # Mobile instructions
```

### File Relationships

```
tims_live_formatter.js
    ↓ (minified & embedded)
bookmarklet.txt
    ↓ (used by)
install.html (Desktop drag-and-drop)

tims_live_formatter.js
    ↓ (loaded from GitHub CDN)
bookmarklet_short.txt
    ↓ (used by)
install.html (Mobile copy-paste)
```

### GitHub Repository

- **Repo:** https://github.com/MangledShepherd/TIMS_Formatter
- **Branch:** main
- **CDN:** Files served via jsDelivr CDN
- **Short bookmarklet URL:** `https://cdn.jsdelivr.net/gh/MangledShepherd/TIMS_Formatter@main/tims_live_formatter.js`

---

## Modifying the Output Format

### Where to Make Changes

**Always edit:** `tims_live_formatter.js` (the source file)

**Then regenerate:**
1. Minify to create `bookmarklet.txt`
2. Update `install.html` with new code
3. Test both versions
4. Commit to GitHub (updates short version automatically)

### CSS Structure Location

In `tims_live_formatter.js`, find the `generateHTML()` function around **line 108**.

The CSS is embedded as a template literal:

```javascript
let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <style>
        /* ALL CSS HERE */
    </style>
</head>
<body>
    /* HTML STRUCTURE HERE */
</body>
</html>
`;
```

### HTML Structure Location

Same `generateHTML()` function, after the `</style>` closing tag.

Main sections:
1. **Header** - Title and refresh button
2. **Quick View** - Today/Tomorrow cards
3. **Roster List** - All days in vertical list

---

## Common Customizations

### 1. Change Text Sizes

**Location:** `tims_live_formatter.js` → `generateHTML()` → `<style>` section

```css
/* CURRENT VALUES */
body { font-size: 15px; }               /* Base size */
.header h1 { font-size: 22px; }         /* Title */
.date { font-size: 14px; }              /* Date text */
.day-name { font-size: 13px; }          /* Day name */
.shift-code { font-size: 14px; }        /* Shift code (e.g., D815 n) */
.shift-hours { font-size: 13px; }       /* Hours (e.g., 8:15 hours) */
.shift-times { font-size: 13px; }       /* Times (e.g., 15:25-20:25) */
.roster-type { font-size: 11px; }       /* Roster badge (Normal, ADO, etc.) */

/* TO INCREASE ALL SIZES BY 20%: */
body { font-size: 18px; }               /* 15px → 18px */
.header h1 { font-size: 26px; }         /* 22px → 26px */
.date { font-size: 17px; }              /* 14px → 17px */
/* etc. */
```

**Pro tip:** Change `body { font-size: }` to scale everything proportionally.

### 2. Change Colors

**Current Color Scheme:**

```css
/* Background Colors */
--bg-main: #121212;          /* Page background */
--bg-secondary: #1e1e1e;     /* Card backgrounds */
--bg-header: #1f1f1f;        /* Header background */

/* Text Colors */
--text-primary: #e0e0e0;     /* Main text (light gray) */
--text-secondary: #b0b0b0;   /* Secondary text */
--text-dim: #777;            /* Dimmed text (OFF days) */

/* Accent Colors */
--accent-blue: #2196f3;      /* Primary blue */
--accent-green: #4caf50;     /* Today highlight */
--accent-orange: #ff9800;    /* Tomorrow & ADO */
--accent-purple: #9c27b0;    /* PRO roster */
```

**To change specific elements:**

```css
/* Today's date highlight */
.day-entry.today {
    border-left-color: #4caf50;    /* Green border */
    background: #1a2e1a;           /* Dark green background */
}

/* Tomorrow's card */
.quick-shift.tomorrow-shift {
    border-color: #ff9800;         /* Orange border */
    background: #2e2419;           /* Dark orange background */
}

/* Shift code color */
.shift-code {
    color: #64b5f6;                /* Light blue */
}

/* Hours color */
.shift-hours {
    color: #ffb74d;                /* Orange/amber */
}
```

### 3. Change Layout Spacing

**Row spacing (distance between days):**

```css
.day-entry {
    margin-bottom: 4px;    /* Space between day cards */
}

/* To make more compact: */
.day-entry {
    margin-bottom: 2px;    /* Tighter spacing */
}

/* To make more spacious: */
.day-entry {
    margin-bottom: 8px;    /* More breathing room */
}
```

**Card padding (space inside cards):**

```css
.day-header {
    padding: 8px 12px;     /* Top/bottom: 8px, Left/right: 12px */
}

.shift-details {
    padding: 8px 12px;     /* Same as header */
}

/* To make cards more compact: */
.day-header {
    padding: 6px 10px;     /* Smaller padding */
}
```

### 4. Change Card Width

```css
.roster-list {
    max-width: 800px;      /* Current maximum width */
    margin: 0 auto;        /* Center the list */
}

/* To make wider: */
.roster-list {
    max-width: 1000px;     /* Wider for desktop */
}

/* To make narrower (more mobile-focused): */
.roster-list {
    max-width: 600px;      /* Narrower */
}
```

### 5. Show/Hide Elements

**Hide the refresh button:**

```css
.refresh-btn {
    display: none;         /* Hide completely */
}
```

**Hide Quick View (Today/Tomorrow):**

```css
.quick-view {
    display: none;         /* Hide quick view section */
}
```

**Hide OFF days completely:**

```javascript
// In the generateHTML() function, modify the filtering:
const filtered = [];
for (let dateStr in daysByDate) {
    const dayEntries = daysByDate[dateStr];
    const nonOff = dayEntries.filter(e => e.shiftData.toUpperCase() !== 'OFF');

    if (nonOff.length > 0) {
        filtered.push(...nonOff);
    }
    // Remove the 'else' block to hide OFF days entirely
}
```

### 6. Change Date Format

**Current format:** `2025-10-05` (YYYY-MM-DD)

**To change to DD/MM/YYYY:**

```javascript
// In generateHTML(), around line 394:
<span class="date">${day.dateStr}</span>

// Replace with:
<span class="date">${day.dateStr.split('-').reverse().join('/')}</span>
// Result: 05/10/2025
```

**To add weekday before date:**

```javascript
<span class="date">${day.dayName}, ${day.dateStr}</span>
// Result: Sunday, 2025-10-05
```

### 7. Change Time Format

**Current:** 24-hour format (15:25-20:25)

Shift data comes directly from TIMS, so this would require parsing and reformatting in the JavaScript:

```javascript
// Add this function to tims_live_formatter.js:
function formatTime12Hour(time24) {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

// Then in the generateHTML function, process times before displaying
```

### 8. Add Custom Elements

**Example: Add a "Print" button**

```javascript
// In generateHTML(), add to the header section:
<button class="refresh-btn" onclick="window.print()">🖨️ Print</button>
```

**Example: Add shift count**

```javascript
// Before the roster list:
<div style="text-align: center; padding: 10px; color: #b0b0b0;">
    Showing ${days.length} shifts
</div>
```

---

## Deployment Workflow

### Making Changes

1. **Edit the source file:**
   ```bash
   # Edit this file:
   E:\Downloads\Software\TIMS_Live_Formatter_V2\tims_live_formatter.js
   ```

2. **Test locally:**
   - Copy the entire file contents
   - Wrap in: `javascript:(` ... `)()`
   - Create a temporary bookmark
   - Test on TIMS roster page

3. **Minify for full bookmarklet:**
   ```python
   # Run minify script (if you have it) or:
   # Manually: Remove comments, extra spaces, newlines
   # Save to bookmarklet.txt
   ```

4. **Update install.html:**
   - Replace `bookmarkletCode` variable with minified version
   - Escape quotes and backslashes properly

5. **Commit to GitHub:**
   ```bash
   cd E:\Downloads\Software\TIMS_Live_Formatter_V2
   git add tims_live_formatter.js bookmarklet.txt install.html
   git commit -m "Update: [describe changes]"
   git push origin main
   ```

6. **Short bookmarklet updates automatically:**
   - jsDelivr CDN picks up changes from GitHub
   - May take a few minutes to propagate
   - Users automatically get the latest version

### Important Notes

- **Short version users** get updates automatically (via CDN)
- **Full version users** need to re-copy the bookmarklet
- Always test changes before pushing to GitHub
- Document changes in commit messages

---

## Troubleshooting

### Common Issues

**1. Dates are off by one day**
- **Cause:** Using UTC instead of local timezone
- **Fix:** Ensure using `getLocalDateStr()` function, not `toISOString()`

**2. Today/Tomorrow showing wrong data**
- **Cause:** Timezone mismatch in date comparison
- **Fix:** Check that both generation and comparison use local dates

**3. Bookmarklet doesn't work after changes**
- **Check:** JavaScript syntax errors
- **Check:** Escaping issues (quotes, backslashes)
- **Test:** Use browser console to see error messages

**4. Short version not updating**
- **Cause:** CDN cache
- **Fix:** Wait 5-10 minutes, or use cache-busting URL parameter

**5. OFF days showing multiple times**
- **Cause:** Filtering logic not working
- **Check:** The `filterDays()` function logic

### Debugging Tips

**View console errors:**
```javascript
// Open browser DevTools (F12)
// Click Console tab
// Click the bookmarklet
// Look for red error messages
```

**Add debug logging:**
```javascript
// Add to tims_live_formatter.js:
console.log('Days extracted:', allDays.length);
console.log('Filtered days:', filteredDays.length);
console.log('Today string:', todayStr);
```

**Test data extraction:**
```javascript
// In browser console on TIMS page:
const rows = document.querySelectorAll('table tbody tr');
console.log('Table rows found:', rows.length);
console.log('First row cells:', rows[0].querySelectorAll('td').length);
```

---

## Version History

### V2.0 - October 6, 2025
- Initial public release
- Fixed timezone handling
- Added short bookmarklet version
- Mobile-optimized installer

### V1.0 - October 5, 2025
- Offline Python version
- Basic dark theme
- Smart filtering

---

## Code Reference

### Key Functions

**1. `extractRosterData()`**
- **Purpose:** Reads TIMS table and creates day objects
- **Returns:** Array of day objects
- **Location:** Line ~16

**2. `filterDays(allDays)`**
- **Purpose:** Removes duplicate OFF entries
- **Input:** All extracted days
- **Returns:** Filtered array
- **Location:** Line ~74

**3. `generateHTML(days)`**
- **Purpose:** Creates formatted HTML page
- **Input:** Filtered days
- **Returns:** Complete HTML string
- **Location:** Line ~106

**4. `getLocalDateStr(date)`**
- **Purpose:** Convert Date to YYYY-MM-DD string (local timezone)
- **Critical:** Don't use `toISOString()`
- **Location:** Line ~8

### Data Structure

**Day Object:**
```javascript
{
    date: Date,              // JavaScript Date object (local timezone)
    dateStr: "2025-10-05",   // YYYY-MM-DD string
    dayName: "Sunday",       // Day of week
    rosterType: "VOTSUN",    // Roster type
    shiftData: "D815 n\n8:15\n15:25-20:25\n21:15-00:30",  // Raw shift data
    dept: "TEMDRV",          // Department
    employee: "TEM1525"      // Employee ID
}
```

### CSS Class Reference

**Main Elements:**
- `.header` - Top title bar
- `.quick-view` - Today/Tomorrow section
- `.roster-list` - Main list container
- `.day-entry` - Individual day card
- `.day-header` - Date and roster type row
- `.shift-details` - Shift information row

**State Classes:**
- `.today` - Applied to current date
- `.off` - Applied to OFF days
- `.leave` - Applied to leave days (A/L, PHOL, ADO/Off)

**Component Classes:**
- `.shift-code` - Shift code (e.g., D815 n)
- `.shift-hours` - Hours text (e.g., 8:15 hours)
- `.shift-times` - Time ranges (e.g., 15:25-20:25)
- `.roster-type` - Roster badge (Normal, ADO, PRO, VOTSUN)

---

## Quick Modification Examples

### Example 1: Make everything bigger

```javascript
// In <style> section:
body { font-size: 18px; }         // Was 15px
.header h1 { font-size: 26px; }   // Was 22px
.date { font-size: 17px; }        // Was 14px
.shift-code { font-size: 17px; }  // Was 14px
```

### Example 2: Change to light theme

```javascript
// In <style> section:
body { background: #ffffff; color: #333333; }
.day-entry { background: #f5f5f5; }
.day-header { background: #e0e0e0; }
.date { color: #000000; }
```

### Example 3: Show only work days (hide OFF)

```javascript
// In filterDays() function:
for (let dateStr in daysByDate) {
    const dayEntries = daysByDate[dateStr];
    const nonOff = dayEntries.filter(e => e.shiftData.toUpperCase() !== 'OFF');

    if (nonOff.length > 0) {
        filtered.push(...nonOff);
    }
    // Remove the else block that adds Normal OFF days
}
```

### Example 4: Sort oldest first (instead of newest)

```javascript
// In filterDays() function:
filtered.sort((a, b) => a.date - b.date);  // Was: b.date - a.date
```

---

## Testing Checklist

Before deploying changes:

- [ ] Test on TIMS roster page
- [ ] Verify dates are correct (not off by one day)
- [ ] Check Today/Tomorrow cards show correct data
- [ ] Test on mobile device
- [ ] Verify OFF days filtered correctly
- [ ] Check all roster types display (Normal, ADO, PRO, VOTSUN)
- [ ] Test with future and past dates
- [ ] Verify auto-scroll to today works
- [ ] Check responsive design (resize browser)
- [ ] Test refresh button works

---

## Contact & Support

- **GitHub Repo:** https://github.com/MangledShepherd/TIMS_Formatter
- **Issues:** Report on GitHub Issues tab
- **Version:** See VERSION.txt

---

**Last Updated:** October 6, 2025
**Maintainer:** MangledShepherd
**Generated with:** Claude Code
