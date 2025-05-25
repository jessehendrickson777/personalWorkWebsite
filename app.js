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
    noteItem.innerHTML = `<strong>${note.id}-${note.title}</strong><p>${note.content}</p>`;
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
  const barChart = document.querySelector("#bar-chart");
  const analyticsFunnel = document.querySelector("#analytics-funnel");
  const retailReports = document.querySelector("#retail-reports");
  const googleCalendar = document.querySelector("#google-calendar");
  button.addEventListener("click", function () {
    const tabID = this.dataset.tab;
    if (tabID === "tab3") {
      barChart.classList.remove("show");
      analyticsFunnel.classList.remove("show");
      retailReports.classList.remove("show");
      notesContainer.classList.toggle("show");
    }

    if (tabID === "tab2") {
      analyticsFunnel.classList.remove("show");
      notesContainer.classList.remove("show");
      retailReports.classList.toggle("show");
      barChart.classList.toggle("show");
    }
    if (tabID === "tab1") {
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

showNotesBtn.addEventListener("click", function () {
  notesListContainer.classList.toggle("show");
  if (showNotesBtn.innerText === `Hide Notes List`) {
    showNotesBtn.innerText = "Show Notes List";
  } else {
    showNotesBtn.innerText = "Hide Notes List";
    notesList.innerHTML = "";
  }
});

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
