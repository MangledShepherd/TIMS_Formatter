# TIMS Live Roster Formatter - V3

**One-tap formatting of your TIMS roster - simplified for mobile!**

---

## Quick Setup (30 seconds)

### Step 1: Copy the Bookmarklet Code

Copy this entire line:

```
javascript:(function(){var s=document.createElement('script');s.src='https://cdn.jsdelivr.net/gh/MangledShepherd/TIMS_Formatter@main/tims_live_formatter.js';document.head.appendChild(s);})();
```

### Step 2: Create a Bookmark

1. **Create a new bookmark** in your mobile browser
2. **Name it:** `F` (just the letter F - makes it easy to search)
3. **Paste** the code from Step 1 as the bookmark URL

### Step 3: Done!

You're ready to use it!

---

## How to Use

1. **Open your TIMS roster page** in your mobile browser
2. **Tap the address bar** and type `F`
3. **Select your "F" bookmark** from the suggestions
4. **Your roster is now formatted!**

### Why search for it instead of opening from bookmarks?

On most mobile browsers (especially Brave, Chrome), you can't run a bookmarklet on an existing page from the bookmarks menu - it tries to open it as a new page. The workaround is to search for it in the address bar, which runs the bookmarklet on the current page.

---

## ⚠️ Important: Browser Cache Issue

**If you get "No roster data found" error after an update:**

Your browser may be using an old cached version of the script. Here's how to fix it:

### Quick Fix (Desktop & Mobile):
1. Go to your TIMS roster page
2. Press **Ctrl+Shift+R** (Windows) or **Cmd+Shift+R** (Mac) to hard refresh
3. Run the bookmarklet again - should work now!

### If Hard Refresh Doesn't Work:

**Desktop (Brave/Chrome/Edge):**
1. Press **Ctrl+Shift+Delete**
2. Select **"Cached images and files"** only (don't clear cookies/passwords!)
3. Time range: **"All time"**
4. Click **"Clear data"**
5. Refresh TIMS page and run bookmarklet

**Mobile (Brave/Chrome):**
1. Open Settings → Privacy → Clear browsing data
2. Select **"Cached images and files"** only
3. Tap **"Clear data"**
4. Refresh TIMS and run bookmarklet

**Test in Incognito/Private Mode:**
- If it works in incognito but not normal browser → definitely a cache issue
- Use the steps above to clear cache

---

## What This Does

- 🌙 **Dark Theme** - Easy on the eyes
- 📱 **Mobile Optimized** - Perfect for phones
- 🔄 **Live Data** - Always shows your current roster from TIMS
- ⚡ **Instant** - One tap to reformat
- 🎯 **Smart** - Removes duplicate OFF entries
- 📅 **Quick View** - See today and tomorrow at the top

---

## Detailed Instructions for Sharing

When helping someone install this, you can:

1. **Text them the bookmarklet code** (copy from `bookmarklet_short.txt`)
2. **Walk them through:**
   - Create a new bookmark
   - Name it "F"
   - Paste the code as the URL
   - Save it

That's it! No downloads, no installer, no complicated steps.

---

## Desktop Users

This works on desktop too! You can drag the bookmarklet to your bookmarks bar or follow the same copy-paste method.

---

## What's Different in V3?

**V3 is simplified:**
- No installer page
- No zip files to download
- Just copy the link and create a bookmark
- Perfect for quickly sharing with coworkers

**V2 had:**
- install.html with drag-and-drop
- Multiple instruction files
- More steps to follow

V3 cuts right to the chase - just the short link and simple instructions.

---

## Troubleshooting

**"No roster data found" error:**
- **Most common:** Browser cache issue - see the "Browser Cache Issue" section above for fix
- Make sure you're on the TIMS roster page (not the login page)
- Try hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Test in incognito mode to confirm it's a cache issue

**The bookmarklet doesn't do anything:**
- Make sure you're on the TIMS roster page (not the login page)
- Try refreshing the TIMS page first
- Check if you have JavaScript enabled

**Can't find the bookmark when searching:**
- Make sure you named it "F" (capital F)
- Try typing "format" if "F" doesn't work

**Dates look wrong:**
- Check your phone's date/time settings
- Make sure automatic timezone is enabled

---

## For Developers

Want to customize the formatter? See `DEVELOPER_GUIDE.md` for technical documentation.

The bookmarklet loads the script from GitHub, so any updates to `tims_live_formatter.js` are automatically available to all users.

---

## Privacy & Security

- **No data collection** - Everything runs in your browser
- **No external servers** - Script doesn't send data anywhere
- **Open source** - You can read the code in `tims_live_formatter.js`

---

## Share With Coworkers

To share this with someone:

1. **Send them the bookmarklet code** (from `bookmarklet_short.txt`)
2. **Tell them:**
   - Create a bookmark named "F"
   - Paste the code as the URL
   - Use it by searching "F" in the address bar on TIMS

Or just send them this whole folder!

---

**Version:** 3.0
**Last Updated:** October 2025
**GitHub:** https://github.com/MangledShepherd/TIMS_Formatter
