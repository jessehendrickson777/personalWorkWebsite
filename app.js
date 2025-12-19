const contact = document.querySelector(".contact");
const contactButton = contact.querySelector("button");
const dropDownMenu = document.querySelector(".dropdown-menu");
const takeNotesBtn = document.querySelector("#take-notes-button");
const noteTitle = document.querySelector("#note-title");
const noteContent = document.querySelector("#note");
const showNotesBtn = document.querySelector("#show-btn");
const loadNotesBtn = document.querySelector("#load-btn");
const notesListContainer = document.querySelector(".notes-list-container");
const notesList = document.querySelector(".notes-list");

const loadNotes = () => {
  const raw = JSON.parse(localStorage.getItem("notes")) || [];
  notesList.innerHTML = "";

  if (!raw || raw.length === 0) {
    notesList.innerHTML = '<p class="no-notes">No notes available.</p>';
    return;
  }

  // Normalize a variety of legacy shapes into the expected note object
  let needSave = false;
  const normalized = raw.map((item, idx) => {
    // If item is a primitive (string/number), convert to object
    if (typeof item !== "object" || item === null) {
      needSave = true;
      return {
        id: Date.now() + idx,
        title: "",
        content: String(item),
        date: "",
        createdAt: new Date().toISOString(),
      };
    }

    // Try several possible keys for content/title/date/createdAt
    const content =
      item.content ??
      item.note ??
      item.noteContent ??
      item.body ??
      item.text ??
      item.note_text ??
      "";

    let title =
      item.title ?? item.noteTitle ?? item.note_title ?? item.heading ?? "";

    // If there's no explicit title, derive first non-empty line (limited length)
    if (!title && content) {
      const firstLine = content.split("\n").find((l) => l.trim() !== "");
      if (firstLine) title = firstLine.trim().slice(0, 80);
    }

    const date =
      item.date ?? item.noteDate ?? item.note_date ?? item.dueDate ?? "";

    const createdAt =
      item.createdAt ?? item.created_at ?? item.created ?? item.timestamp ?? "";

    let id = item.id;
    if (id === undefined || id === null) {
      // create a reasonably unique numeric id
      id = Date.now() + idx;
      needSave = true;
    }

    // If createdAt missing, set it so we can reliably sort old, undated notes
    const finalCreatedAt = createdAt || new Date().toISOString();
    if (!createdAt) needSave = true;

    return {
      id: Number(id),
      title: title || "",
      content: content || "",
      date: date || "",
      createdAt: finalCreatedAt,
    };
  });

  // Persist normalized structure if we added ids/createdAt or converted primitives
  if (needSave) {
    try {
      localStorage.setItem("notes", JSON.stringify(normalized));
    } catch (e) {
      // If storage fails for some reason, continue without persisting
      console.warn("Failed to persist normalized notes:", e);
    }
  }

  // Sort: dated notes first (by date desc), then undated notes (by createdAt desc, then id desc)
  normalized
    .sort((a, b) => {
      const aHasDate = a.date && a.date.toString().trim() !== "";
      const bHasDate = b.date && b.date.toString().trim() !== "";

      if (aHasDate && bHasDate) {
        // both have dates -> newest first
        return new Date(b.date) - new Date(a.date);
      } else if (aHasDate && !bHasDate) {
        return -1; // a (dated) comes before b (undated)
      } else if (!aHasDate && bHasDate) {
        return 1; // b comes before a
      } else {
        // neither have a date -> use createdAt (newest first), then id to make order stable
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        return (b.id || 0) - (a.id || 0);
      }
    })
    .forEach((note) => {
      const noteCard = document.createElement("div");
      noteCard.className = "note-card";
      noteCard.setAttribute("data-id", note.id);

      // Format content preserving original order
      const lines = (note.content || "").split("\n");
      let formattedContent = "";

      lines.forEach((line) => {
        if (line.startsWith("  ○ ") || line.startsWith("  • ")) {
          formattedContent += `<div class="note-sub-bullet">${line.slice(
            4
          )}</div>`;
        } else if (line.startsWith("• ")) {
          formattedContent += `<div class="note-bullet">${line.slice(2)}</div>`;
        } else if (line.trim()) {
          formattedContent += `<div class="note-text">${line}</div>`;
        } else {
          formattedContent += '<div class="note-spacer"></div>';
        }
      });

      const noteDate = note.date ? formatNoteDate(note.date) : "No date set";

      noteCard.innerHTML = `
      <div class="note-card-header">
        <h4 class="note-title-display">${note.title}</h4>
        <span class="note-id-badge">#${note.id}</span>
      </div>
      <div class="note-date-display">
        <i class="fas fa-calendar"></i>
        <span>${noteDate}</span>
      </div>
      <div class="note-content-display">${formattedContent}</div>
      <div class="note-actions">
        <button class="btn-edit-note" onclick="editNoteById(${note.id})">
          <i class="fas fa-edit"></i> Edit
        </button>
        <button class="btn-email-note" onclick="emailNoteById(${note.id})">
          <i class="fas fa-paper-plane"></i> Email
        </button>
        <button class="btn-delete-note" onclick="deleteNoteById(${note.id})">
          <i class="fas fa-trash"></i> Delete
        </button>
      </div>
    `;
      notesList.appendChild(noteCard);
    });
};

// Format date for display
function formatNoteDate(dateString) {
  if (!dateString) return "Not set";
  // Parse date as local time to avoid timezone issues
  const [year, month, day] = dateString.split("-");
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const deleteNote = (noteId) => {
  const notes = JSON.parse(localStorage.getItem("notes")) || [];
  const updatedNotes = notes.filter((note) => note.id !== noteId);
  localStorage.setItem("notes", JSON.stringify(updatedNotes));
};

document.querySelectorAll(".tab-button").forEach((button) => {
  const notesContainer = document.querySelector(".notes-container");
  const fiscalCalendar = document.querySelector("#fiscal-calendar-container");
  const monthCalendar = document.querySelector("#month-calendar-container");
  const barChart = document.querySelector("#bar-chart");
  const analyticsFunnel = document.querySelector("#analytics-funnel");
  const retailReports = document.querySelector("#retail-reports");
  const googleCalendar = document.querySelector("#google-calendar");
  const projectsList = document.querySelector("#projects-list-container");

  button.addEventListener("click", function () {
    const tabID = this.dataset.tab;
    // Hide all tabs
    fiscalCalendar.classList.remove("show");
    monthCalendar.classList.remove("show");
    notesContainer.classList.remove("show");
    barChart.classList.remove("show");
    analyticsFunnel.classList.remove("show");
    retailReports.classList.remove("show");
    projectsList.classList.remove("show");

    // Show selected tab
    if (tabID === "tab5") {
      projectsList.classList.add("show");
      loadProjects(); // Load projects when tab is shown
    }
    if (tabID === "tab4") {
      fiscalCalendar.classList.add("show");
      renderFiscalCalendar();
    }
    if (tabID === "tab3") {
      notesContainer.classList.add("show");
      loadNotes();
    }
    if (tabID === "tab2") {
      retailReports.classList.add("show");
      barChart.classList.add("show");
    }
    if (tabID === "tab1") {
      analyticsFunnel.classList.add("show");
    }

    const anyTabShown = [
      notesContainer,
      barChart,
      analyticsFunnel,
      retailReports,
      fiscalCalendar,
      monthCalendar,
      projectsList,
    ].some((tab) => tab.classList.contains("show"));

    if (anyTabShown) {
      googleCalendar.classList.add("hide");
    } else {
      googleCalendar.classList.remove("hide");
    }
  });
});

// takeNotesBtn.addEventListener("click", function () {
//   const takeNotesButtonText = document.querySelector(".note-pad-btn-text");
//   document.querySelector(".notes-container").classList.toggle("show");
//   if (takeNotesButtonText.innerText === `Hide Note Pad`) {
//     takeNotesButtonText.innerText = "Show Note Pad";
//   } else {
//     takeNotesButtonText.innerText = "Hide Note Pad";
//   }
// });

document.addEventListener("click", function (e) {
  if (contact.contains(e.target)) {
    dropDownMenu.classList.toggle("show");
  }

  if (!contact.contains(e.target) && !contactButton.contains(e.target)) {
    dropDownMenu.classList.remove("show");
  }
});

document.querySelector("#clear-btn").addEventListener("click", function () {
  noteContent.value = "";
  noteTitle.value = "";
  const dateInput = document.querySelector("#note-date");
  if (dateInput) dateInput.value = new Date().toISOString().split("T")[0];
});

document.querySelector("#save-btn").addEventListener("click", function () {
  const title = noteTitle.value;
  const content = noteContent.value;
  const dateInput = document.querySelector("#note-date");
  const date = dateInput
    ? dateInput.value
    : new Date().toISOString().split("T")[0];

  if (title && content) {
    const notes = JSON.parse(localStorage.getItem("notes")) || [];
    const noteIdentifier = Date.now();
    const id = Number(noteIdentifier.toString().slice(-4));
    notes.push({
      id,
      title,
      content,
      date,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem("notes", JSON.stringify(notes));
    noteTitle.value = "";
    noteContent.value = "";
    if (dateInput) dateInput.value = new Date().toISOString().split("T")[0];
    loadNotes();
  } else {
    alert("Please fill in both title and content fields.");
  }
});

loadNotesBtn.addEventListener("click", function () {
  loadNotes();
});

// showNotesBtn.addEventListener("click", function () {
//   notesListContainer.classList.toggle("show");
//   if (showNotesBtn.innerText === `Hide Notes List`) {
//     showNotesBtn.innerText = "Show Notes List";
//   } else {
//     showNotesBtn.innerText = "Hide Notes List";
//     notesList.innerHTML = "";
//   }
// });

// New consolidated note action functions

function deleteNoteById(noteId) {
  if (
    confirm("Are you sure you want to delete this note? This cannot be undone.")
  ) {
    deleteNote(noteId);
    loadNotes();
    alert("Note deleted successfully!");
  }
}

function editNoteById(noteId) {
  const notes = JSON.parse(localStorage.getItem("notes")) || [];
  const note = notes.find((n) => n.id === noteId);

  if (!note) {
    alert("Note not found.");
    return;
  }

  // Create modal overlay
  const modal = document.createElement("div");
  modal.className = "edit-note-modal";
  modal.innerHTML = `
    <div class="edit-modal-content">
      <div class="edit-modal-header">
        <h3><i class="fas fa-edit"></i> Edit Note</h3>
        <button class="close-modal" onclick="closeEditNoteModal()">&times;</button>
      </div>
      
      <form id="edit-note-form">
        <div class="form-row">
          <div class="form-group">
            <label for="edit-note-title">Note Title <span class="required">*</span></label>
            <input type="text" id="edit-note-title" value="${
              note.title
            }" required />
          </div>
          
          <div class="form-group">
            <label for="edit-note-date">Note Date <span class="required">*</span></label>
            <input type="date" id="edit-note-date" value="${
              note.date || ""
            }" required />
          </div>
        </div>
        
        <div class="form-group">
          <label for="edit-note-content">Note Content <span class="required">*</span></label>
          <div class="note-editor-help">
            <span><i class="fas fa-info-circle"></i> Press Tab on a bullet to create a sub-bullet</span>
          </div>
          <textarea id="edit-note-content" rows="10" required>${
            note.content
          }</textarea>
          <button type="button" id="edit-bullets-btn" class="btn-bullet" style="margin-top: 0.5rem;">
            <i class="fas fa-circle"></i> Add Bullet
          </button>
        </div>
        
        <div class="edit-modal-actions">
          <button type="submit" class="btn-save-edit">
            <i class="fas fa-save"></i> Save Changes
          </button>
          <button type="button" class="btn-cancel-edit" onclick="closeEditNoteModal()">
            <i class="fas fa-times"></i> Cancel
          </button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  // Add bullet button functionality to the edit textarea
  const editBulletsBtn = document.getElementById("edit-bullets-btn");
  const editTextarea = document.getElementById("edit-note-content");

  editBulletsBtn.addEventListener("click", function () {
    const start = editTextarea.selectionStart;
    const end = editTextarea.selectionEnd;
    const value = editTextarea.value;
    // Insert bullet at cursor position
    editTextarea.value =
      value.substring(0, start) + "• " + value.substring(end);
    // Move cursor after bullet
    editTextarea.selectionStart = editTextarea.selectionEnd = start + 2;
    editTextarea.focus();
  });

  // Add bullet functionality to the edit textarea
  editTextarea.addEventListener("keydown", function (e) {
    const value = editTextarea.value;
    const start = editTextarea.selectionStart;
    const lastNewline = value.lastIndexOf("\n", start - 1);
    const lineStart = lastNewline + 1;
    const currentLine = value.slice(lineStart, start);

    if (e.key === "Tab") {
      e.preventDefault();
      if (currentLine.startsWith("• ") && !currentLine.startsWith("  ○ ")) {
        const before = value.substring(0, lineStart);
        const after = value.substring(start);
        const lineContent = currentLine.slice(2);
        editTextarea.value = before + "  ○ " + lineContent + after;
        editTextarea.selectionStart = editTextarea.selectionEnd =
          lineStart + 4 + lineContent.length;
      } else {
        const before = value.substring(0, start);
        const after = value.substring(start);
        editTextarea.value = before + "  " + after;
        editTextarea.selectionStart = editTextarea.selectionEnd = start + 2;
      }
    } else if (e.key === "Enter") {
      if (currentLine.startsWith("  ○ ") && currentLine.trim() !== "○") {
        e.preventDefault();
        const before = value.substring(0, start);
        const after = value.substring(start);
        editTextarea.value = before + "\n  ○ " + after;
        editTextarea.selectionStart = editTextarea.selectionEnd = start + 5;
      } else if (currentLine.startsWith("• ") && currentLine.trim() !== "•") {
        e.preventDefault();
        const before = value.substring(0, start);
        const after = value.substring(start);
        editTextarea.value = before + "\n• " + after;
        editTextarea.selectionStart = editTextarea.selectionEnd = start + 3;
      } else if (
        currentLine.trim() === "•" ||
        currentLine.trim() === "○" ||
        currentLine.trim() === "  ○"
      ) {
        e.preventDefault();
        const before = value.substring(0, lineStart);
        const after = value.substring(start);
        editTextarea.value = before + "\n" + after;
        editTextarea.selectionStart = editTextarea.selectionEnd = lineStart + 1;
      }
    }
  });

  // Handle form submission
  document
    .getElementById("edit-note-form")
    .addEventListener("submit", function (e) {
      e.preventDefault();

      const updatedData = {
        title: document.getElementById("edit-note-title").value.trim(),
        content: document.getElementById("edit-note-content").value,
        date: document.getElementById("edit-note-date").value,
      };

      if (!updatedData.title || !updatedData.content || !updatedData.date) {
        alert("Please fill in all required fields");
        return;
      }

      // Update the note
      const notes = JSON.parse(localStorage.getItem("notes")) || [];
      const noteIndex = notes.findIndex((n) => n.id === noteId);
      if (noteIndex !== -1) {
        notes[noteIndex] = {
          ...notes[noteIndex],
          ...updatedData,
        };
        localStorage.setItem("notes", JSON.stringify(notes));
      }

      closeEditNoteModal();
      loadNotes();
    });

  // Close on overlay click
  // modal.addEventListener("click", function (e) {
  //   if (e.target === modal) {
  //     closeEditNoteModal();
  //   }
  // });
}

// Close edit note modal
function closeEditNoteModal() {
  const modal = document.querySelector(".edit-note-modal");
  if (modal) {
    modal.remove();
  }
}

function emailNoteById(noteId) {
  const notes = JSON.parse(localStorage.getItem("notes")) || [];
  const note = notes.find((n) => n.id === noteId);

  if (!note) {
    alert("Note not found.");
    return;
  }

  const subject = `Note: ${note.title}`;
  const body = `${note.title}\n\n${note.content}`;
  const recipient = "jesse.hendrickson@goodwillindy.org"; // change if needed

  const mailto = `mailto:${encodeURIComponent(
    recipient
  )}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  // Try natural anchor click first (more reliable than window.open in some browsers)
  try {
    const a = document.createElement("a");
    a.href = mailto;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    a.remove();
    // After clicking the mailto, we can't detect success reliably. Provide a fallback UI.
    setTimeout(() => {
      // Offer fallback options if user's environment didn't open a mail client
      showEmailFallback(mailto, subject, body);
    }, 700);
  } catch (err) {
    // If something throws, immediately show fallback
    showEmailFallback(mailto, subject, body);
  }
}

function showEmailFallback(mailto, subject, body) {
  // Compose a Gmail web compose URL (user must be logged into Gmail)
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    "jesse.hendrickson@goodwillindy.org"
  )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  const message =
    "It looks like your device doesn't have a configured mail app. You can:\n\n" +
    "- Click OK to open Gmail compose (requires you to be logged in to Gmail),\n" +
    "- Or copy the note contents to your clipboard and paste into your email client.\n\n" +
    "Press OK to open Gmail, or Cancel to copy the content to clipboard.";

  if (confirm(message)) {
    window.open(gmailUrl, "_blank");
  } else {
    // Copy body to clipboard so user can paste into webmail manually
    const textToCopy = `To: jesse.hendrickson@goodwillindy.org\nSubject: ${subject}\n\n${body}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(textToCopy)
        .then(() =>
          alert("Note copied to clipboard. Paste into your email to send.")
        )
        .catch(() => fallbackCopyPrompt(textToCopy));
    } else {
      fallbackCopyPrompt(textToCopy);
    }
  }
}

function fallbackCopyPrompt(text) {
  // Older browsers fallback: show text in a prompt (user can Ctrl+C)
  prompt(
    "Copy the message below (Ctrl+C / Cmd+C) and paste into your email:",
    text
  );
}

// function emailNoteById(noteId) {
//   const notes = JSON.parse(localStorage.getItem("notes")) || [];
//   const note = notes.find((n) => n.id === noteId);

//   if (!note) {
//     alert("Note not found.");
//     return;
//   }

//   const subject = encodeURIComponent(`Note: ${note.title}`);
//   const body = encodeURIComponent(`${note.title}\n\n${note.content}`);
//   const mailtoLink = `mailto:jesse.hendrickson@goodwillindy.org?subject=${subject}&body=${body}`;
//   window.open(mailtoLink, "_blank");
// }

document.querySelector("#bullets-btn").addEventListener("click", function () {
  const textarea = document.querySelector("#note");
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const value = textarea.value;
  // Insert bullet at cursor position
  textarea.value = value.substring(0, start) + "• " + value.substring(end);
  // Move cursor after bullet
  textarea.selectionStart = textarea.selectionEnd = start + 2;
  textarea.focus();
});

noteContent.addEventListener("keydown", function (e) {
  const value = noteContent.value;
  const start = noteContent.selectionStart;
  const lastNewline = value.lastIndexOf("\n", start - 1);
  const lineStart = lastNewline + 1;
  const currentLine = value.slice(lineStart, start);

  if (e.key === "Tab") {
    e.preventDefault();

    // If on a bullet line, convert to sub-bullet with hollow circle
    if (currentLine.startsWith("• ") && !currentLine.startsWith("  ○ ")) {
      const before = value.substring(0, lineStart);
      const after = value.substring(start);
      const lineContent = currentLine.slice(2); // Remove "• "
      noteContent.value = before + "  ○ " + lineContent + after;
      noteContent.selectionStart = noteContent.selectionEnd =
        lineStart + 4 + lineContent.length;
    } else {
      // Regular tab functionality
      const before = value.substring(0, start);
      const after = value.substring(start);
      noteContent.value = before + "  " + after;
      noteContent.selectionStart = noteContent.selectionEnd = start + 2;
    }
  } else if (e.key === "Enter") {
    if (currentLine.startsWith("  ○ ") && currentLine.trim() !== "○") {
      // Continue sub-bullets with hollow circle
      e.preventDefault();
      const before = value.substring(0, start);
      const after = value.substring(start);
      noteContent.value = before + "\n  ○ " + after;
      noteContent.selectionStart = noteContent.selectionEnd = start + 5;
    } else if (currentLine.startsWith("• ") && currentLine.trim() !== "•") {
      // Continue main bullets
      e.preventDefault();
      const before = value.substring(0, start);
      const after = value.substring(start);
      noteContent.value = before + "\n• " + after;
      noteContent.selectionStart = noteContent.selectionEnd = start + 3;
    } else if (
      currentLine.trim() === "•" ||
      currentLine.trim() === "○" ||
      currentLine.trim() === "  ○"
    ) {
      // Empty bullet - remove it and create new line
      e.preventDefault();
      const before = value.substring(0, lineStart);
      const after = value.substring(start);
      noteContent.value = before + "\n" + after;
      noteContent.selectionStart = noteContent.selectionEnd = lineStart + 1;
    }
  }
});

function getFiscalMonthsDynamic(fiscalYearStartStr = "06/29/2025") {
  const monthNames = [
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
  ];

  function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  let fiscalStart = new Date(fiscalYearStartStr);
  let fiscalEnd;
  const today = new Date();

  while (true) {
    fiscalEnd = addDays(fiscalStart, 364 - 1);
    if (today >= fiscalStart && today <= fiscalEnd) {
      break;
    }

    fiscalStart = addDays(fiscalEnd, 1);
  }

  const months = {};
  let startDate = new Date(fiscalStart);

  for (let i = 0; i < 12; i++) {
    const isFiveWeek = i % 3 === 2;
    const daysInMonth = isFiveWeek ? 35 : 28;
    const endDate = addDays(startDate, daysInMonth - 1);

    if (!months[monthNames[i]]) {
      months[monthNames[i]] = {};
    }

    months[monthNames[i]].name = monthNames[i];
    months[monthNames[i]].start = formatDate(startDate);
    months[monthNames[i]].end = formatDate(endDate);
    months[monthNames[i]].weeks = isFiveWeek ? 5 : 4;

    startDate = addDays(endDate, 1);
  }
  return months;
}

function formatDate(date) {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

function isDateBetween(dateStr) {
  const fiscalMonths = getFiscalMonthsDynamic();

  const [mm, dd, yyyy] = formatDate(new Date(dateStr)).split("/");

  let currentFiscalMonth = null;

  Object.entries(fiscalMonths).forEach(([month, range]) => {
    const [smm, sdd, syyyy] = range.start.split("/");
    const [emm, edd, eyyyy] = range.end.split("/");

    const date = new Date(`${yyyy}-${mm}-${dd}`);
    const start = new Date(`${syyyy}-${smm}-${sdd}`);
    const end = new Date(`${eyyyy}-${emm}-${edd}`);

    if (date >= start && date <= end) {
      currentFiscalMonth = { month, ...fiscalMonths[month] };
    }
  });

  return currentFiscalMonth;
}

function renderFiscalCalendar() {
  const months = getFiscalMonthsDynamic();
  console.log(months);
  const calendarContainer = document.getElementById(
    "fiscal-calendar-container"
  );
  calendarContainer.innerHTML = "";

  Object.keys(months).forEach((key, i) => {
    let quarter = Math.floor(i / 3) + 1;
    if (i % 3 === 0) {
      const quarterDiv = document.createElement("div");
      quarterDiv.className = "fiscal-quarter";
      quarterDiv.innerHTML = `<h2>Quarter ${quarter}</h2>`;
      calendarContainer.appendChild(quarterDiv);
    }
    const month = months[key];
    const monthDiv = document.createElement("div");
    monthDiv.className = "fiscal-calendar";
    monthDiv.innerHTML = `
      <h3>${month.name}</h3>
      <p>${month.start} - ${month.end}</p>
      <p>Weeks: ${month.weeks}</p>
    `;
    monthDiv.addEventListener("click", () => {
      renderMonthCalendar(month);
    });
    calendarContainer.appendChild(monthDiv);
  });
}

// Render day-by-day calendar for a fiscal month
function renderMonthCalendar(month) {
  const container = document.getElementById("month-calendar-container");
  container.innerHTML = `<h2>${month.name} ${month.start} - ${month.end}</h2>`;
  container.classList.add("show");
  document.getElementById("fiscal-calendar-container").classList.remove("show");

  // Generate days
  const startDate = new Date(month.start);
  const endDate = new Date(month.end);
  let days = [];
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }

  // Render days in a grid
  const grid = document.createElement("div");
  grid.className = "month-grid";
  days.forEach((day) => {
    const dayDiv = document.createElement("div");
    dayDiv.className = "month-day";
    const weekday = day.toLocaleDateString(undefined, { weekday: "short" });
    const dateStr = day.toISOString().split("T")[0];
    dayDiv.innerHTML = `<div class="weekday">${weekday}</div><div class="date">${dateStr}</div>`;
    grid.appendChild(dayDiv);
  });

  // Add back button
  const backBtn = document.createElement("button");
  backBtn.className = "calendar-back-button";
  backBtn.innerHTML =
    '<i class="fa fa-arrow-left"></i> Back to Fiscal Calendar';
  backBtn.addEventListener("click", () => {
    container.classList.remove("show");
    // Always hide all other tab contents
    document
      .querySelectorAll(".tabContent")
      .forEach((tab) => tab.classList.remove("show"));
    document.getElementById("fiscal-calendar-container").classList.add("show");
  });

  container.appendChild(grid);
  container.appendChild(backBtn);
}

// Initial render
document.addEventListener("DOMContentLoaded", renderFiscalCalendar);

/* ============================================
   PROJECTS LIST FUNCTIONALITY
   ============================================ */

// Projects state management
const ProjectsManager = {
  storageKey: "analytics_projects",

  // Get all projects from localStorage
  getProjects() {
    const projects = localStorage.getItem(this.storageKey);
    return projects ? JSON.parse(projects) : [];
  },

  // Save projects to localStorage
  saveProjects(projects) {
    localStorage.setItem(this.storageKey, JSON.stringify(projects));
  },

  // Add a new project
  addProject(projectData) {
    const projects = this.getProjects();
    const newProject = {
      id: Date.now(),
      name: projectData.name,
      description: projectData.description || "",
      startDate: projectData.startDate,
      dueDate: projectData.dueDate || "",
      status: "active",
      createdAt: new Date().toISOString(),
      completedAt: null,
    };
    projects.push(newProject);
    this.saveProjects(projects);
    return newProject;
  },

  // Mark project as completed
  completeProject(projectId) {
    const projects = this.getProjects();
    const project = projects.find((p) => p.id === projectId);
    if (project) {
      project.status = "completed";
      project.completedAt = new Date().toISOString();
      this.saveProjects(projects);
    }
    return project;
  },

  // Delete a project
  deleteProject(projectId) {
    const projects = this.getProjects();
    const filteredProjects = projects.filter((p) => p.id !== projectId);
    this.saveProjects(filteredProjects);
  },

  // Update an existing project
  updateProject(projectId, updatedData) {
    const projects = this.getProjects();
    const projectIndex = projects.findIndex((p) => p.id === projectId);
    if (projectIndex !== -1) {
      projects[projectIndex] = {
        ...projects[projectIndex],
        ...updatedData,
      };
      this.saveProjects(projects);
      return projects[projectIndex];
    }
    return null;
  },

  // Get active projects
  getActiveProjects() {
    return this.getProjects().filter((p) => p.status === "active");
  },

  // Get completed projects
  getCompletedProjects() {
    return this.getProjects().filter((p) => p.status === "completed");
  },
};

// Format date for display
function formatProjectDate(dateString) {
  if (!dateString) return "Not set";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Create a project card element
function createProjectCard(project) {
  const card = document.createElement("div");
  card.className = `project-card ${project.status}`;
  card.dataset.projectId = project.id;

  const isCompleted = project.status === "completed";

  card.innerHTML = `
    <div class="project-card-header">
      <h4 class="project-name">${project.name}</h4>
      <span class="project-status-badge ${project.status}">
        ${isCompleted ? "✓ Completed" : "Active"}
      </span>
    </div>
    
    ${
      project.description
        ? `<p class="project-description">${project.description}</p>`
        : ""
    }
    
    <div class="project-dates">
      <div class="project-date-item">
        <i class="fas fa-calendar-plus"></i>
        <span class="project-date-label">Start:</span>
        <span>${formatProjectDate(project.startDate)}</span>
      </div>
      ${
        project.dueDate
          ? `
        <div class="project-date-item">
          <i class="fas fa-calendar-check"></i>
          <span class="project-date-label">Due:</span>
          <span>${formatProjectDate(project.dueDate)}</span>
        </div>
      `
          : ""
      }
    </div>
    
    ${
      isCompleted
        ? `
      <div class="completed-date">
        <i class="fas fa-check-circle"></i>
        Completed: ${formatProjectDate(project.completedAt)}
      </div>
    `
        : ""
    }
    
    <div class="project-actions">
      ${
        !isCompleted
          ? `
        <button class="btn-edit-project" onclick="editProject(${project.id})">
          <i class="fas fa-edit"></i> Edit
        </button>
        <button class="btn-complete" onclick="completeProject(${project.id})">
          <i class="fas fa-check"></i> Mark Complete
        </button>
      `
          : ""
      }
      <button class="btn-delete-project" onclick="deleteProject(${project.id})">
        <i class="fas fa-trash"></i> Delete
      </button>
    </div>
  `;

  return card;
}

// Render all projects
function renderProjects() {
  const activeList = document.getElementById("active-projects-list");
  const completedList = document.getElementById("completed-projects-list");
  const activeCount = document.getElementById("active-count");
  const completedCount = document.getElementById("completed-count");

  const activeProjects = ProjectsManager.getActiveProjects();
  const completedProjects = ProjectsManager.getCompletedProjects();

  // Update counts
  activeCount.textContent = activeProjects.length;
  completedCount.textContent = completedProjects.length;

  // Render active projects
  activeList.innerHTML = "";
  if (activeProjects.length === 0) {
    activeList.innerHTML = '<p class="no-projects">No active projects</p>';
  } else {
    activeProjects
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .forEach((project) => {
        activeList.appendChild(createProjectCard(project));
      });
  }

  // Render completed projects
  completedList.innerHTML = "";
  if (completedProjects.length === 0) {
    completedList.innerHTML =
      '<p class="no-projects">No completed projects</p>';
  } else {
    completedProjects
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
      .forEach((project) => {
        completedList.appendChild(createProjectCard(project));
      });
  }
}

// Load projects (called when tab is shown)
function loadProjects() {
  renderProjects();
}

// Complete a project
function completeProject(projectId) {
  if (confirm("Mark this project as completed?")) {
    ProjectsManager.completeProject(projectId);
    renderProjects();
  }
}

// Delete a project
function deleteProject(projectId) {
  if (
    confirm(
      "Are you sure you want to delete this project? This cannot be undone."
    )
  ) {
    ProjectsManager.deleteProject(projectId);
    renderProjects();
  }
}

// Edit a project
function editProject(projectId) {
  const projects = ProjectsManager.getProjects();
  const project = projects.find((p) => p.id === projectId);

  if (!project) return;

  // Create modal overlay
  const modal = document.createElement("div");
  modal.className = "edit-project-modal";
  modal.innerHTML = `
    <div class="edit-modal-content">
      <div class="edit-modal-header">
        <h3><i class="fas fa-edit"></i> Edit Project</h3>
        <button class="close-modal" onclick="closeEditModal()">&times;</button>
      </div>
      
      <form id="edit-project-form">
        <div class="form-group">
          <label for="edit-project-name">Project Name <span class="required">*</span></label>
          <input type="text" id="edit-project-name" value="${
            project.name
          }" required />
        </div>
        
        <div class="form-group">
          <label for="edit-project-description">Description</label>
          <textarea id="edit-project-description" rows="3">${
            project.description || ""
          }</textarea>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="edit-project-start-date">Start Date <span class="required">*</span></label>
            <input type="date" id="edit-project-start-date" value="${
              project.startDate
            }" required />
          </div>
          
          <div class="form-group">
            <label for="edit-project-due-date">Due Date</label>
            <input type="date" id="edit-project-due-date" value="${
              project.dueDate || ""
            }" />
          </div>
        </div>
        
        <div class="edit-modal-actions">
          <button type="submit" class="btn-save-edit">
            <i class="fas fa-save"></i> Save Changes
          </button>
          <button type="button" class="btn-cancel-edit" onclick="closeEditModal()">
            <i class="fas fa-times"></i> Cancel
          </button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  // Handle form submission
  document
    .getElementById("edit-project-form")
    .addEventListener("submit", function (e) {
      e.preventDefault();

      const updatedData = {
        name: document.getElementById("edit-project-name").value.trim(),
        description: document
          .getElementById("edit-project-description")
          .value.trim(),
        startDate: document.getElementById("edit-project-start-date").value,
        dueDate: document.getElementById("edit-project-due-date").value,
      };

      if (!updatedData.name || !updatedData.startDate) {
        alert("Please fill in all required fields");
        return;
      }

      ProjectsManager.updateProject(projectId, updatedData);
      closeEditModal();
      renderProjects();
      alert("Project updated successfully!");
    });

  // Close on overlay click
  modal.addEventListener("click", function (e) {
    if (e.target === modal) {
      closeEditModal();
    }
  });
}

// Close edit modal
function closeEditModal() {
  const modal = document.querySelector(".edit-project-modal");
  if (modal) {
    modal.remove();
  }
}

// Handle project form submission
document.addEventListener("DOMContentLoaded", function () {
  const projectForm = document.getElementById("project-form");
  const clearButton = document.getElementById("clear-project-form");

  if (projectForm) {
    projectForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const projectData = {
        name: document.getElementById("project-name").value.trim(),
        description: document
          .getElementById("project-description")
          .value.trim(),
        startDate: document.getElementById("project-start-date").value,
        dueDate: document.getElementById("project-due-date").value,
      };

      if (!projectData.name || !projectData.startDate) {
        alert(
          "Please fill in all required fields (Project Name and Start Date)"
        );
        return;
      }

      ProjectsManager.addProject(projectData);
      projectForm.reset();
      renderProjects();

      // Show success message
      alert("Project added successfully!");
    });
  }

  if (clearButton) {
    clearButton.addEventListener("click", function () {
      projectForm.reset();
    });
  }

  // Set today's date as default for start date
  const startDateInput = document.getElementById("project-start-date");
  if (startDateInput) {
    const today = new Date().toISOString().split("T")[0];
    startDateInput.value = today;
  }

  // Initialize note date field
  const noteDateInput = document.getElementById("note-date");
  if (noteDateInput) {
    const today = new Date().toISOString().split("T")[0];
    noteDateInput.value = today;
  }

  // Handle note form submission
  const noteForm = document.getElementById("note-form");
  if (noteForm) {
    noteForm.addEventListener("submit", function (e) {
      e.preventDefault();
      document.getElementById("save-btn").click();
    });
  }

  // Load notes on tab switch
  const notesTab = document.querySelector('[data-tab="tab3"]');
  if (notesTab) {
    notesTab.addEventListener("click", function () {
      loadNotes();
    });
  }
});

// Sync page padding with fixed navbar height so content does not sit behind it.
(function () {
  function syncNavbarSpacing() {
    const navbar = document.querySelector(".navbar");
    if (!navbar) return;
    const h = Math.ceil(navbar.getBoundingClientRect().height);
    // set a CSS variable if you prefer, or set padding on body
    document.documentElement.style.setProperty("--navbar-height", `${h}px`);
    document.body.style.paddingTop = `${h}px`;
  }

  // Run on load and when window resizes (debounced)
  document.addEventListener("DOMContentLoaded", syncNavbarSpacing);
  window.addEventListener("load", syncNavbarSpacing);
  let resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(syncNavbarSpacing, 120);
  });

  // If your UI can change the navbar height (e.g., toggling mobile menu),
  // call syncNavbarSpacing() after those actions as well.
})();

/* ===== Export localStorage to a JSON file ===== */
function exportLocalStorage(keys = []) {
  // If no keys provided, export entire localStorage
  if (!keys || keys.length === 0) {
    keys = Object.keys(localStorage);
  }

  const payload = {
    exportedAt: new Date().toISOString(),
    origin: window.location.href,
    data: {},
  };

  keys.forEach((k) => {
    try {
      const raw = localStorage.getItem(k);
      // Try to parse JSON values, otherwise keep as string
      let parsed = raw;
      try {
        parsed = JSON.parse(raw);
      } catch (e) {
        // leave as string
      }
      payload.data[k] = parsed;
    } catch (err) {
      console.warn("Failed to read localStorage key", k, err);
    }
  });

  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const filename = `notes-data-${new Date()
    .toISOString()
    .replace(/[:.]/g, "-")}.json`;

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  // Append -> click -> remove to trigger download
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Release memory after a short delay
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

/* ===== Import JSON file (file object or input event) =====
   strategy: 'merge' | 'replace' | 'ask' (default 'ask' uses confirm prompts)
*/
async function importLocalStorageFile(file, options = {}) {
  const { strategy = "ask", keysToImport = null } = options;
  if (!file) throw new Error("No file provided");

  const text = await file.text();
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    alert("Selected file is not valid JSON.");
    throw err;
  }

  // Support both { data: { key: value } } (our export shape) and raw key:value object
  const incomingData = parsed && parsed.data ? parsed.data : parsed;

  // Filter keys if caller asked for a subset
  const keys = keysToImport ? keysToImport : Object.keys(incomingData);

  for (const k of keys) {
    const incomingValue = incomingData[k];
    if (incomingValue === undefined) continue;

    const existingRaw = localStorage.getItem(k);
    let existingValue = null;
    try {
      existingValue = existingRaw ? JSON.parse(existingRaw) : null;
    } catch (e) {
      existingValue = existingRaw;
    }

    // Resolve strategy
    let chosenStrategy = strategy;
    if (strategy === "ask") {
      // Simple UI: confirm -> replace, cancel -> merge (if possible)
      const doReplace = confirm(
        `Import key "${k}": replace existing value? [OK=Replace, Cancel=Merge if possible]`
      );
      chosenStrategy = doReplace ? "replace" : "merge";
    }

    if (chosenStrategy === "replace") {
      // Overwrite
      localStorage.setItem(k, JSON.stringify(incomingValue));
    } else if (chosenStrategy === "merge") {
      // Attempt safe merges for arrays or objects; otherwise replace
      if (Array.isArray(existingValue) && Array.isArray(incomingValue)) {
        const merged = mergeArraysById(existingValue, incomingValue);
        localStorage.setItem(k, JSON.stringify(merged));
      } else if (isPlainObject(existingValue) && isPlainObject(incomingValue)) {
        const mergedObj = { ...existingValue, ...incomingValue };
        localStorage.setItem(k, JSON.stringify(mergedObj));
      } else {
        // Not mergeable -> replace
        localStorage.setItem(k, JSON.stringify(incomingValue));
      }
    } else {
      // unknown strategy fallback -> replace
      localStorage.setItem(k, JSON.stringify(incomingValue));
    }
  }
  alert("Import complete.");
}

/* ===== Helpers ===== */
function isPlainObject(v) {
  return v && typeof v === "object" && !Array.isArray(v);
}

// Merge two arrays of objects by 'id' where possible.
// Keeps existing items and adds new items from incoming; updates items with same id by shallow-merge.
function mergeArraysById(existing = [], incoming = []) {
  // build lookup by id from existing
  const out = [];
  const existingById = new Map();
  existing.forEach((it) => {
    const id = it && (it.id ?? it.ID ?? it.key ?? null);
    if (id != null) existingById.set(String(id), it);
    else out.push(it); // items without id - keep
  });

  // incorporate incoming: if id exists, shallow-merge; otherwise push
  incoming.forEach((incomingItem) => {
    const id =
      incomingItem &&
      (incomingItem.id ?? incomingItem.ID ?? incomingItem.key ?? null);
    if (id != null) {
      const key = String(id);
      if (existingById.has(key)) {
        // merge (incoming wins for conflicts)
        const merged = { ...existingById.get(key), ...incomingItem };
        existingById.set(key, merged);
      } else {
        existingById.set(key, incomingItem);
      }
    } else {
      // no id - just push (may produce duplicates)
      out.push(incomingItem);
    }
  });

  // build final array: items without id (kept earlier) + items from map
  return out.concat(Array.from(existingById.values()));
}

/* ===== Convenience UI wiring =====
   Call `installStorageExportImportUI()` once after DOMContentLoaded.
   It will add two small buttons to the top-right of the page. */
function installStorageExportImportUI(config = {}) {
  const container = document.createElement("div");
  container.className = "storage-export-import-ui";
  container.style.position = "fixed";
  container.style.right = "200px";
  container.style.top = "12px";
  container.style.zIndex = 9999;
  container.style.display = "flex";
  container.style.gap = "8px";

  const exportBtn = document.createElement("button");
  exportBtn.textContent = "Export Data";
  exportBtn.className = "btn-export-data";
  exportBtn.style.padding = "6px 10px";

  const importBtn = document.createElement("button");
  importBtn.textContent = "Import Data";
  importBtn.className = "btn-import-data";
  importBtn.style.padding = "6px 10px";

  container.appendChild(exportBtn);
  container.appendChild(importBtn);
  document.body.appendChild(container);

  // Hidden file input for import
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".json,application/json";
  fileInput.style.display = "none";
  document.body.appendChild(fileInput);

  exportBtn.addEventListener("click", function () {
    // Example: export only 'notes' and 'analytics_projects' keys. Remove keys arg to export all.
    exportLocalStorage(["notes", "analytics_projects"]);
  });

  importBtn.addEventListener("click", function () {
    fileInput.value = "";
    fileInput.click();
  });

  fileInput.addEventListener("change", async function (e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    try {
      // Ask user: replace or merge
      const choice = confirm(
        "Click OK to REPLACE storage keys from file. Click Cancel to MERGE where possible."
      );
      await importLocalStorageFile(f, {
        strategy: choice ? "replace" : "merge",
      });
      // Optional: refresh UI after import: call your app's load functions
      if (typeof loadNotes === "function") loadNotes();
      if (typeof renderProjects === "function") renderProjects();
    } catch (err) {
      console.error("Import failed", err);
      alert("Import failed. Check console for details.");
    }
  });
}

window.addEventListener("DOMContentLoaded", function () {
  installStorageExportImportUI();
});
