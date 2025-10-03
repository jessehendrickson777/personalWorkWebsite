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
  const notes = JSON.parse(localStorage.getItem("notes")) || [];
  notesList.innerHTML = "";

  if (notes.length === 0) {
    notesList.innerHTML = "<p>No notes available.</p>";
    return;
  }

  notes.forEach((note, index) => {
    const noteItem = document.createElement("div");
    noteItem.className = "note-item";
    noteItem.setAttribute("data-id", note.id);

    const lines = note.content.split("\n");
    let formattedContent = "";
    if (lines.some((line) => line.startsWith("• "))) {
      formattedContent =
        "<ul>" +
        lines
          .filter((line) => line.startsWith("• "))
          .map((line) => `<li>${line.slice(2)}</li>`)
          .join("") +
        "</ul>";

      const nonBullets = lines
        .filter((line) => !line.startsWith("• "))
        .join("<br>");
      if (nonBullets) formattedContent = nonBullets + "<br>" + formattedContent;
    } else {
      formattedContent = note.content.replace(/\n/g, "<br>");
    }

    noteItem.innerHTML = `<strong>${note.id}-${note.title}</strong><p>${formattedContent}</p>`;
    notesList.appendChild(noteItem);
  });
};

const deleteNote = (noteId) => {
  const notes = JSON.parse(localStorage.getItem("notes")) || [];
  const updatedNotes = notes.filter((note) => note.id !== noteId);
  localStorage.setItem("notes", JSON.stringify(updatedNotes));
};

document.querySelectorAll(".tab-button").forEach((button) => {
  const notesContainer = document.querySelector(".notes-container");
  const fiscalCalendar = document.querySelector("#fiscal-calendar-container");
  const barChart = document.querySelector("#bar-chart");
  const analyticsFunnel = document.querySelector("#analytics-funnel");
  const retailReports = document.querySelector("#retail-reports");
  const googleCalendar = document.querySelector("#google-calendar");

  button.addEventListener("click", function () {
    const tabID = this.dataset.tab;

    if (tabID === "tab4") {
      fiscalCalendar.classList.toggle("show");
      renderFiscalCalendar();
      notesContainer.classList.remove("show");
      barChart.classList.remove("show");
      analyticsFunnel.classList.remove("show");
      retailReports.classList.remove("show");
    }

    if (tabID === "tab3") {
      fiscalCalendar.classList.remove("show");
      barChart.classList.remove("show");
      analyticsFunnel.classList.remove("show");
      retailReports.classList.remove("show");
      notesContainer.classList.toggle("show");
    }

    if (tabID === "tab2") {
      fiscalCalendar.classList.remove("show");
      analyticsFunnel.classList.remove("show");
      notesContainer.classList.remove("show");
      retailReports.classList.toggle("show");
      barChart.classList.toggle("show");
    }
    if (tabID === "tab1") {
      fiscalCalendar.classList.remove("show");
      barChart.classList.remove("show");
      notesContainer.classList.remove("show");
      retailReports.classList.remove("show");
      analyticsFunnel.classList.toggle("show");
    }

    const anyTabShown = [
      notesContainer,
      barChart,
      analyticsFunnel,
      retailReports,
      fiscalCalendar,
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
});

document.querySelector("#save-btn").addEventListener("click", function () {
  const title = noteTitle.value;
  const content = noteContent.value;

  if (title && content) {
    const notes = JSON.parse(localStorage.getItem("notes")) || [];
    const noteIdentifier = Date.now();
    const id = Number(noteIdentifier.toString().slice(-4));
    notes.push({ id, title, content });
    localStorage.setItem("notes", JSON.stringify(notes));
    alert("Note saved successfully!");
    noteTitle.value = "";
    noteContent.value = "";
    loadNotes();
  } else {
    alert("Please fill in both fields.");
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

document.querySelector("#delete-btn").addEventListener("click", function (e) {
  const input = document.querySelector("#note-id").value;
  // let notes = JSON.parse(localStorage.getItem("notes")) || [];
  // notes = notes.filter((note) => note.id !== Number(input));
  // localStorage.setItem("notes", JSON.stringify(notes));
  if (!input) {
    alert("Please enter a note ID to delete.");
    e.preventDefault();
    return;
  }
  deleteNote(Number(input));
  alert("Note deleted successfully!");
  document.querySelector("#note-id").value = "";
  loadNotes();
});

document
  .querySelector("#note-list-btn-email")
  .addEventListener("click", function (e) {
    const notes = JSON.parse(localStorage.getItem("notes")) || [];
    const noteID = document.querySelector("#note-id-email").value;
    const allNotes = noteID.split(",").map((id) => id.trim());
    const notesToEmail = allNotes
      .map((id) => {
        const note = notes.find((note) => note.id === Number(id));
        return note ? `${note.title.trim()}\n\n${note.content.trim()}` : null;
      })
      .filter(Boolean);

    if (!notesToEmail.length) {
      alert("Note not found.");
      e.preventDefault();
      return;
    }

    const subject = encodeURIComponent(`Notes from Note Pad`);
    const body = encodeURIComponent(notesToEmail.join("\n\n\n\n"));
    const mailtoLink = `mailto:jesse.hendrickson@goodwillindy.org?subject=${subject}&body=${body}`;
    this.href = mailtoLink;
    document.querySelector("#note-id-email").value = "";
  });

document.querySelector("#edit-btn").addEventListener("click", function (e) {
  const input = document.querySelector("#note-id-edit").value;
  const notes = JSON.parse(localStorage.getItem("notes")) || [];
  const noteToEdit = notes.find((note) => note.id === Number(input));

  if (noteToEdit) {
    noteTitle.value = noteToEdit.title;
    noteContent.value = noteToEdit.content;
    deleteNote(Number(input)); // Remove the note from localStorage
    alert("Note loaded for editing.");
    loadNotes();
    document.querySelector("#note-id-edit").value = "";
  } else {
    alert("Note not found.");
  }
});

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
  if (e.key === "Enter") {
    const value = noteContent.value;
    const start = noteContent.selectionStart;

    const lastNewline = value.lastIndexOf("\n", start - 1);
    const lineStart = lastNewline + 1;
    const currentLine = value.slice(lineStart, start);

    if (currentLine.startsWith("• ") && currentLine.trim() !== "•") {
      e.preventDefault();
      const before = value.substring(0, start);
      const after = value.substring(start);
      noteContent.value = before + "\n• " + after;
      noteContent.selectionStart = noteContent.selectionEnd = start + 3; //
    } else if (currentLine.trim() === "•") {
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
  container.style.display = "block";
  document.getElementById("fiscal-calendar-container").style.display = "none";

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
    container.style.display = "none";
    document.getElementById("fiscal-calendar-container").style.display = "flex";
  });

  container.appendChild(grid);
  container.appendChild(backBtn);
}

// Initial render
document.addEventListener("DOMContentLoaded", renderFiscalCalendar);
