// TIMS Live Roster Formatter - Bookmarklet Version
// This script reformats the TIMS roster page in real-time
//
// PLANNED FEATURE: Duty Break Location Display
// Future enhancement will fetch duty_break_locations.json from GitHub
// to display lunch break locations (Depot/Offsite) for each duty code.
// This helps employees decide whether to bring a cooler box or use the depot fridge.
// See DEVELOPER_GUIDE.md "Planned Features" section for details.

(function() {
    'use strict';

    // Helper function to get local date string in YYYY-MM-DD format
    function getLocalDateStr(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Extract roster data from the current TIMS page
    function extractRosterData() {
        const allDays = [];
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        // Find all table rows
        const rows = document.querySelectorAll('table tbody tr');

        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            // NEW TABLE STRUCTURE (Oct 2025): 10 columns instead of 11
            // Cols: Week | Location | Duty | Sun-Sat (7 days)
            if (cells.length >= 10) {
                const weekStart = cells[0].textContent.trim();
                const dept = cells[1].textContent.trim(); // Now "Location"
                const employee = cells[2].textContent.trim(); // Now "Duty"
                const rosterType = "Normal"; // No longer in table, use default

                // Skip invalid rows
                if (!weekStart || weekStart.includes('No data')) return;

                // Parse date - split and create as local date
                let startDate;
                try {
                    const parts = weekStart.split('-');
                    if (parts.length === 3) {
                        // Create date in local timezone (not UTC)
                        startDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                    } else {
                        return;
                    }
                } catch (e) {
                    return;
                }

                // Process each day (cells 3-9 are the 7 days - changed from 4-10)
                for (let i = 0; i < 7; i++) {
                    const currentDate = new Date(startDate);
                    currentDate.setDate(currentDate.getDate() + i);

                    const dateStr = getLocalDateStr(currentDate);
                    const dayName = dayNames[currentDate.getDay()];
                    const shiftData = cells[3 + i].textContent.trim();

                    // TODO: Parse duty code from shiftData (e.g., "D815 n" -> "D815")
                    // Future: Fetch break location from duty_break_locations.json
                    // and add breakLocation property to day object

                    allDays.push({
                        date: currentDate,
                        dateStr: dateStr,
                        dayName: dayName,
                        rosterType: rosterType,
                        shiftData: shiftData,
                        dept: dept,
                        employee: employee
                        // breakLocation: "Depot" | "Offsite" | null (to be added)
                    });
                }
            }
        });

        return allDays;
    }

    // Filter duplicate OFF entries
    function filterDays(allDays) {
        const daysByDate = {};

        allDays.forEach(day => {
            if (!daysByDate[day.dateStr]) {
                daysByDate[day.dateStr] = [];
            }
            daysByDate[day.dateStr].push(day);
        });

        const filtered = [];
        for (let dateStr in daysByDate) {
            const dayEntries = daysByDate[dateStr];

            // Find non-OFF entries
            const nonOff = dayEntries.filter(e => e.shiftData.toUpperCase() !== 'OFF');

            if (nonOff.length > 0) {
                filtered.push(...nonOff);
            } else {
                // All OFF - prefer Normal roster type
                const normal = dayEntries.find(e => e.rosterType.toUpperCase() === 'NORMAL');
                filtered.push(normal || dayEntries[0]);
            }
        }

        // Sort by date (newest first)
        filtered.sort((a, b) => b.date - a.date);

        return filtered;
    }

    // Generate formatted HTML
    function generateHTML(days) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayStr = getLocalDateStr(today);
        const tomorrowStr = getLocalDateStr(tomorrow);

        let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TIMS Roster - Live</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            background: #121212;
            color: #e0e0e0;
            padding: 0;
            font-size: 15px;
            line-height: 1.5;
        }

        .header {
            background: #1f1f1f;
            color: #ffffff;
            padding: 20px;
            text-align: center;
            border-bottom: 2px solid #2196f3;
            position: sticky;
            top: 0;
            z-index: 100;
            box-shadow: 0 2px 8px rgba(0,0,0,0.5);
        }

        .header h1 { font-size: 22px; font-weight: 600; }

        .refresh-btn {
            background: #2196f3;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            margin-top: 10px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
        }

        .refresh-btn:hover { background: #1976d2; }

        .quick-view {
            max-width: 800px;
            margin: 15px auto;
            padding: 0 10px;
        }

        .quick-view-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
        }

        .quick-shift {
            background: #1e1e1e;
            border-radius: 6px;
            padding: 12px;
            border: 2px solid #2196f3;
        }

        .quick-shift.today-shift {
            border-color: #4caf50;
            background: #1a2e1a;
        }

        .quick-shift.tomorrow-shift {
            border-color: #ff9800;
            background: #2e2419;
        }

        .quick-shift-header {
            font-weight: 600;
            font-size: 13px;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .quick-shift.today-shift .quick-shift-header { color: #4caf50; }
        .quick-shift.tomorrow-shift .quick-shift-header { color: #ff9800; }

        .quick-date {
            font-size: 15px;
            font-weight: 600;
            color: #ffffff;
            margin-bottom: 6px;
        }

        .quick-details {
            font-size: 13px;
            color: #b0b0b0;
            line-height: 1.6;
        }

        .quick-code { color: #64b5f6; font-weight: 600; }
        .quick-hours { color: #ffb74d; }
        .quick-off { color: #888; font-style: italic; }

        .divider { height: 20px; }

        .roster-list {
            max-width: 800px;
            margin: 0 auto;
            padding: 10px;
        }

        .day-entry {
            background: #1e1e1e;
            border-left: 4px solid #2196f3;
            margin-bottom: 4px;
            border-radius: 4px;
            overflow: hidden;
            transition: transform 0.2s, box-shadow 0.2s;
        }

        .day-entry:hover {
            transform: translateX(4px);
            box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
        }

        .day-entry.off {
            border-left-color: #555;
            opacity: 0.6;
        }

        .day-entry.leave { border-left-color: #ffa726; }

        .day-entry.today {
            border-left-width: 6px;
            border-left-color: #4caf50;
            background: #1a2e1a;
            box-shadow: 0 0 15px rgba(76, 175, 80, 0.4);
        }

        .day-entry.today .day-header { background: #2d4a2d; }

        .day-entry.today .date::after {
            content: " (TODAY)";
            color: #4caf50;
            font-size: 12px;
            font-weight: 700;
            margin-left: 8px;
        }

        .day-header {
            padding: 8px 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #252525;
            flex-wrap: wrap;
            gap: 8px;
        }

        .date-info {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .date {
            font-weight: 600;
            font-size: 14px;
            color: #ffffff;
        }

        .day-name {
            color: #90caf9;
            font-size: 13px;
            font-weight: 500;
        }

        .roster-type {
            background: #2196f3;
            color: white;
            padding: 2px 10px;
            border-radius: 10px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
        }

        .roster-type.ado { background: #ff9800; }
        .roster-type.pro { background: #9c27b0; }
        .roster-type.votsun { background: #4caf50; }

        .shift-details {
            padding: 8px 12px;
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            align-items: center;
        }

        .shift-code {
            font-weight: 600;
            color: #64b5f6;
            font-size: 14px;
        }

        .shift-hours {
            color: #ffb74d;
            font-size: 13px;
            font-weight: 500;
        }

        .shift-times {
            color: #b0b0b0;
            font-size: 13px;
        }

        .off-day {
            color: #777;
            font-style: italic;
            font-size: 13px;
            padding: 8px 12px;
        }

        .leave-badge {
            background: #ff9800;
            color: #000;
            padding: 4px 10px;
            border-radius: 4px;
            display: inline-block;
            font-weight: 600;
            font-size: 12px;
        }

        @media (max-width: 600px) {
            .quick-view-grid { grid-template-columns: 1fr; }
            .day-header {
                flex-direction: column;
                align-items: flex-start;
            }
            .date-info { width: 100%; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>TIMS Roster - Live</h1>
        <button class="refresh-btn" onclick="location.reload()">🔄 Refresh from TIMS</button>
    </div>

    <div class="quick-view">
        <div class="quick-view-grid">
            <div class="quick-shift today-shift">
                <div class="quick-shift-header">Today</div>
                <div class="quick-date" id="today-date">Loading...</div>
                <div class="quick-details" id="today-details">...</div>
            </div>
            <div class="quick-shift tomorrow-shift">
                <div class="quick-shift-header">Tomorrow</div>
                <div class="quick-date" id="tomorrow-date">Loading...</div>
                <div class="quick-details" id="tomorrow-details">...</div>
            </div>
        </div>
    </div>

    <div class="divider"></div>

    <div class="roster-list">
`;

        // Generate day entries
        days.forEach(day => {
            const lines = day.shiftData.split('\n').map(l => l.trim()).filter(l => l);
            const isOff = !lines.length || day.shiftData.toUpperCase() === 'OFF';
            const isLeave = day.shiftData.includes('A/L') || day.shiftData.includes('PHOL') || day.shiftData.includes('ADO/Off');

            let entryClass = 'day-entry';
            if (isOff) entryClass += ' off';
            else if (isLeave) entryClass += ' leave';
            if (day.dateStr === todayStr) entryClass += ' today';

            let rosterClass = 'roster-type';
            const rosterLower = day.rosterType.toLowerCase();
            if (rosterLower.includes('ado')) rosterClass += ' ado';
            else if (rosterLower.includes('pro')) rosterClass += ' pro';
            else if (rosterLower.includes('votsun')) rosterClass += ' votsun';

            html += `
        <div class="${entryClass}" data-date="${day.dateStr}">
            <div class="day-header">
                <div class="date-info">
                    <span class="date">${day.dateStr}</span>
                    <span class="day-name">${day.dayName}</span>
                </div>
                <span class="${rosterClass}">${day.rosterType}</span>
            </div>
`;

            if (isOff) {
                html += '            <div class="off-day">OFF</div>\n';
            } else if (lines.length > 0) {
                html += '            <div class="shift-details">\n';

                // NEW FORMAT (Oct 2025): Hours moved to last line, no " hours" suffix
                // Format: shift_code, times..., hours
                // Leave format: leave_type, times..., hours, leave_code

                // Detect leave code (last line is 3 uppercase letters like "ANL")
                const lastLine = lines[lines.length - 1];
                const hasLeaveCode = isLeave && /^[A-Z]{2,4}$/i.test(lastLine);

                // Find hours line (second-to-last if leave code exists, otherwise last)
                let hoursLineIdx = hasLeaveCode ? lines.length - 2 : lines.length - 1;
                let hoursText = lines[hoursLineIdx];

                // Times are between line 1 and the hours line
                let timesLines = lines.slice(1, hoursLineIdx);

                if (isLeave) {
                    html += `                <span class="leave-badge">${lines[0]}</span>\n`;
                    if (hoursText) {
                        html += `                <span class="shift-hours">${hoursText} hours</span>\n`;
                    }
                    if (timesLines.length > 0) {
                        html += `                <span class="shift-times">${timesLines.join(' | ')}</span>\n`;
                    }
                } else {
                    html += `                <span class="shift-code">${lines[0]}</span>\n`;
                    if (hoursText) {
                        html += `                <span class="shift-hours">${hoursText} hours</span>\n`;
                    }
                    if (timesLines.length > 0) {
                        html += `                <span class="shift-times">${timesLines.join(' | ')}</span>\n`;
                    }
                }

                html += '            </div>\n';
            }

            html += '        </div>\n';
        });

        html += `
    </div>

    <script>
        function formatDate(date) {
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return days[date.getDay()] + ', ' + months[date.getMonth()] + ' ' + date.getDate();
        }

        function getLocalDateStr(date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return year + '-' + month + '-' + day;
        }

        // Populate quick view
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayStr = getLocalDateStr(today);
        const tomorrowStr = getLocalDateStr(tomorrow);

        const todayEntry = document.querySelector('[data-date="' + todayStr + '"]');
        const tomorrowEntry = document.querySelector('[data-date="' + tomorrowStr + '"]');

        function extractShiftInfo(entry) {
            if (!entry) return '<span class="quick-off">No roster data</span>';

            const offDay = entry.querySelector('.off-day');
            if (offDay) return '<span class="quick-off">OFF</span>';

            const shiftDetails = entry.querySelector('.shift-details');
            if (!shiftDetails) return '<span class="quick-off">No details</span>';

            const code = entry.querySelector('.shift-code');
            const hours = entry.querySelector('.shift-hours');
            const times = entry.querySelector('.shift-times');
            const leave = entry.querySelector('.leave-badge');

            let html = '';
            if (leave) html += '<div><span style="background: #ff9800; color: #000; padding: 2px 8px; border-radius: 3px; font-weight: 600; font-size: 11px;">' + leave.textContent + '</span></div>';
            if (code) html += '<div><span class="quick-code">' + code.textContent + '</span></div>';
            if (hours) html += '<div><span class="quick-hours">' + hours.textContent + '</span></div>';
            if (times) html += '<div>' + times.textContent + '</div>';

            return html || '<span class="quick-off">No details</span>';
        }

        document.getElementById('today-date').textContent = formatDate(today);
        document.getElementById('today-details').innerHTML = extractShiftInfo(todayEntry);

        document.getElementById('tomorrow-date').textContent = formatDate(tomorrow);
        document.getElementById('tomorrow-details').innerHTML = extractShiftInfo(tomorrowEntry);

        // Scroll to today
        if (todayEntry) {
            setTimeout(() => {
                todayEntry.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    </script>
</body>
</html>
`;

        return html;
    }

    // Main execution
    try {
        const allDays = extractRosterData();
        if (allDays.length === 0) {
            alert('No roster data found on this page. Make sure you are on the TIMS roster page.');
            return;
        }

        const filteredDays = filterDays(allDays);
        const html = generateHTML(filteredDays);

        // Replace page content
        document.open();
        document.write(html);
        document.close();

    } catch (error) {
        alert('Error formatting roster: ' + error.message);
        console.error('TIMS Formatter Error:', error);
    }
})();
