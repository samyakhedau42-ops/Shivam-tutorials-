// Authentication Check: allow public pages to load without login, but protect dashboard/profile/admin pages
(function() {
  const currentPath = window.location.pathname.toLowerCase();
  const isLoginPage = currentPath.endsWith("sign-in.html") || currentPath.endsWith("sign-in to shivam tutorials .html") || currentPath.endsWith("sign-in to shivam tutorials.html");
  const publicPages = [
    "index.html",
    "about us-shivam tutorials.html",
    "student reports-shivam tutorials.html",
    "sign-in.html",
    "sign-in to shivam tutorials .html", // Note: filename with space
    "sign-in to shivam tutorials.html",
    "portion.html",
    "test.html", // Added test page to public pages
    "social-and-culture.html"
  ];

  const currentPage = currentPath.split('/').pop() || '';
  const isPublicPage = publicPages.includes(currentPage);

  const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true' || localStorage.getItem('isLoggedIn') === 'true';

  if (!isLoginPage && !isPublicPage && !isLoggedIn) {
    window.location.href = "sign-in.html";
  }
})();

const defaultAdminUser = {
  id: 1,
  firstName: 'Samyak',
  lastName: 'Hedau',
  email: 'samyakhedau42@gmail.com',
  password: 'samyak@m24', // NOTE: Hardcoded password is a security risk.
  role: 'admin'
};

function getUsersDatabase() {
  try {
    const rawUsers = localStorage.getItem('usersList');
    if (!rawUsers) return [];
    const parsedUsers = JSON.parse(rawUsers);
    return Array.isArray(parsedUsers) ? parsedUsers : [];
  } catch (error) {
    console.error('Failed to parse usersList:', error);
    localStorage.removeItem('usersList'); // Clear corrupted data
    return [];
  }
}

function saveUsersDatabase(usersDatabase) {
  if (Array.isArray(usersDatabase)) {
    localStorage.setItem('usersList', JSON.stringify(usersDatabase));
  }
}

function ensureAdminUser() {
  let usersDatabase = getUsersDatabase();
  const adminUserIndex = usersDatabase.findIndex(user => user && user.email && user.email.toLowerCase() === defaultAdminUser.email.toLowerCase());

  if (adminUserIndex === -1) {
    // Admin does not exist, add it.
    usersDatabase.push(defaultAdminUser);
  } else {
    // Admin exists, ensure their role is 'admin' without overwriting other details like profile pic.
    usersDatabase[adminUserIndex].role = 'admin';
    // Optional: You might want to enforce the default password on every load for this demo.
    // usersDatabase[adminUserIndex].password = defaultAdminUser.password;
  }
  saveUsersDatabase(usersDatabase);
}

function signOut() {
  // Clear both storages to ensure a full logout regardless of user type
  localStorage.removeItem("isLoggedIn");
  // Also clear the old keys for good measure to prevent conflicts.
  localStorage.removeItem("currentUserEmail");
  localStorage.removeItem("currentUserRole");

  // sessionStorage is cleared completely for simplicity as it only holds temporary admin sessions
  sessionStorage.clear(); 
  
  window.location.href = "sign-in.html";
}

function getAuthStorage() {
    // Admin session is in sessionStorage, user session is in localStorage.
    // Check for admin session first, as it's more temporary.
    if (sessionStorage.getItem('isLoggedIn') === 'true') {
        return sessionStorage;
    }
    // Fallback to localStorage for regular users or if no session is active.
    return localStorage;
}

function getCurrentUserSession() {
  const storage = getAuthStorage();
  const email = storage.getItem('currentUserEmail') || '';
  const role = storage.getItem('currentUserRole') || 'user';
  return { email, role };
}

function isCurrentUserAdmin() {
  const { email, role } = getCurrentUserSession();
  return role === 'admin';
}

window.addEventListener("load", function () {
  renderStudentTable();
});

function loadSiteComponents() {
  const headerContainer = document.getElementById("header");
  const navbarContainer = document.getElementById("navbar");
  const footerContainer = document.getElementById("footer");

  if (!headerContainer && !navbarContainer && !footerContainer) {
    return;
  }

  $("#header").load("header.html");
  $("#navbar").load("navbar.html", function () {
    setActiveNavLink();
    loadAndSetProfilePictures();

    const isAdmin = isCurrentUserAdmin();
    const adminNavItem = document.getElementById('adminUsersNav');
    if (adminNavItem) {
      adminNavItem.style.display = isAdmin ? '' : 'none';
    }
  });
  $("#footer").load("footer.html");
}

function updateAdminNavVisibility() {
  const isAdmin = isCurrentUserAdmin();
  const adminLinks = document.querySelectorAll('#adminUsersNav, .admin-only-link');

  adminLinks.forEach((link) => {
    link.style.display = isAdmin ? '' : 'none';
  });
}

function setActiveNavLink() {
  const currentPage = decodeURIComponent((window.location.pathname.split("/").pop() || "index.html")).trim();
  const navLinks = document.querySelectorAll(".nav-link");

  const normalizePageName = (value) => {
    if (!value) return "";
    return decodeURIComponent(value).split("?")[0].split("#")[0].trim().toLowerCase();
  };

  navLinks.forEach((link) => {
    link.classList.remove("active");
    const href = link.getAttribute("href") || "";
    const normalizedCurrentPage = normalizePageName(currentPage);
    const normalizedHref = normalizePageName(href);

    const isActive =
      normalizedHref === normalizedCurrentPage ||
      (normalizedCurrentPage === "" && normalizedHref === "index.html") ||
      (normalizedCurrentPage === "index.html" && normalizedHref === "index.html");

    if (isActive) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  updateAdminNavVisibility();
}

function getGrade(marks) {
  if (marks >= 91) return "A+";
  if (marks >= 81) return "A";
  if (marks >= 71) return "B+";
  if (marks >= 61) return "B";
  if (marks >= 51) return "C+";
  if (marks >= 41) return "C";
  if (marks >= 35) return "D";
  return "Fail";
}

function getStandardMaxMarks(standard, board) {
  return 600;
}

const defaultStudents = [
  {
    name: "peter parter",
    roll_no: 1,
    standard: "4th Standard",
    board: "SSC",
    marks: { English: 45, Hindi: 54, Marathi: 67, 'EVS 1': 90, Maths: 80, 'EVS 2': 75 },
    total: 411,
    percentage: "68.5%",
    grade: "B"
  },
  {
    name: "meter",
    roll_no: 5,
    standard: "4th Standard",
    board: "SSC",
    marks: { English: 45, Hindi: 54, Marathi: 67, 'EVS 1': 90, Maths: 80, 'EVS 2': 75 },
    total: 411,
    percentage: "68.5%",
    grade: "B"
  },
  {
    name: "Yulim",
    roll_no: 4,
    standard: "4th Standard",
    board: "SSC",
    marks: { English: 45, Hindi: 54, Marathi: 67, 'EVS 1': 90, Maths: 80, 'EVS 2': 75 },
    total: 411,
    percentage: "68.5%",
    grade: "B"
  },
  {
    name: "Aryan",
    roll_no: 2,
    standard: "4th Standard",
    board: "SSC",
    marks: { English: 45, Hindi: 54, Marathi: 67, 'EVS 1': 90, Maths: 80, 'EVS 2': 75 },
    total: 411,
    percentage: "68.5%",
    grade: "B"
  },
  {
    name: "Jack Sparrow",
    roll_no: 3,
    standard: "4th Standard",
    board: "SSC",
    marks: { English: 45, Hindi: 54, Marathi: 67, 'EVS 1': 90, Maths: 80, 'EVS 2': 75 },
    total: 411,
    percentage: "68.5%",
    grade: "B"
  },
];

let students = JSON.parse(localStorage.getItem("studentsData")) || defaultStudents;
students = students.map(student => ({
  ...student,
  createdBy: student.createdBy || 'samyakhedau42@gmail.com'
}));

function getCurrentStudentOwner(student) {
  return student && student.createdBy ? student.createdBy : 'unknown';
}

function canManageStudentRecord(student) {
  const { email } = getCurrentUserSession();
  const isAdmin = isCurrentUserAdmin();

  if (isAdmin) return true;
  if (!student) return false;

  return (student.createdBy || 'unknown').toLowerCase() === (email || '').toLowerCase();
}

function saveStudentsToLocalStorage() {
  localStorage.setItem("studentsData", JSON.stringify(students));
}

function hideReportCard() {
  const reportContainer = document.getElementById("reportContainer");
  if (reportContainer) {
    reportContainer.style.display = "none";
  }
}

function display(index) {
  let student = students[index];
  const reportContainer = document.getElementById("reportContainer");
  if (!reportContainer) return;

  reportContainer.style.display = "block";
  document.getElementById("nameOfStudent").textContent = student.name;
  document.getElementById("rollOfStudent").textContent = student.roll_no;
  
  const standardElement = document.getElementById("standardOfStudent");
  if (standardElement) {
    standardElement.textContent = (student.standard || "10th Standard") + (student.board ? ` (${student.board})` : "");
  }

  let tableData = "";
  
  for (let subject in student.marks) {
    let subjectMarks = student.marks[subject];
    let subjectGrade = getGrade(subjectMarks);
    tableData += `<tr><td>${subject}</td><td>100</td><td>${subjectMarks}</td><td class="grade-text">${subjectGrade}</td></tr>`;
  }

  document.getElementById("marksOfStudent").innerHTML = tableData;
  document.getElementById("totalMarks").textContent = student.total;
  document.getElementById("percentageOfStudent").textContent = student.percentage;
  document.getElementById("gradeOfStudent").textContent = "GRADE: " + student.grade;
}

function searchStudent() {
  const searchInput = document.getElementById("studentSearch");
  if (!searchInput) return;

  const enteredValue = searchInput.value.toLowerCase().trim();
  const currentPath = window.location.pathname.toLowerCase();

  if (enteredValue === "") {
    renderStudentTable();
    const reportContainer = document.getElementById("reportContainer");
    if (reportContainer && currentPath.includes("students dashboard-shivam tutorials.html")) {
      reportContainer.style.display = "none";
    }
    return;
  }

  const { email } = getCurrentUserSession();
  const isAdmin = isCurrentUserAdmin();

  const foundStudents = students.filter((student) => {
    // Ensure student.name exists before calling .toLowerCase()
    const studentName = (student.name || "").toLowerCase();
    return studentName.includes(enteredValue) || student.roll_no.toString() === enteredValue;
  });

  if (foundStudents.length > 0) {
    if (currentPath.includes("students dashboard-shivam tutorials.html")) {
      displaySearchResults(foundStudents);
    }

    if (foundStudents.length === 1) {
      const matchedStudent = foundStudents[0];
      const studentIndex = students.findIndex(s => s.roll_no === matchedStudent.roll_no);
      if (studentIndex !== -1) {
        display(studentIndex);
      }
    }
  } else {
    Swal.fire("Not Found", "Student not found in the records.", "warning");
    if (currentPath.includes("students dashboard-shivam tutorials.html")) {
      displaySearchResults([]);
    }
    const reportContainer = document.getElementById("reportContainer");
    if (reportContainer) {
      reportContainer.style.display = "none";
    }
  }
}

function createStudentTableRow(student) {
  const canManage = canManageStudentRecord(student);
  let actionsCell = "<td></td>"; // Empty cell for non-manageable rows

  if (canManage) {
    actionsCell = `
      <td>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1 px-3 rounded-pill shadow-sm transition" onclick="editStudent(${student.roll_no})">Edit</button>
          <button class="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1 px-3 rounded-pill shadow-sm transition" onclick="deleteStudent(${student.roll_no})">Delete</button>
        </div>
      </td>
    `;
  }

  return `
    <tr>
      <td>${student.roll_no}</td>
      <td><a href="javascript:void(0);" onclick="displayStudentProfile(${student.roll_no})" class="text-decoration-none" style="color: var(--accent-blue); transition: opacity 0.3s;" onmouseover="this.style.opacity='0.7'" onmouseout="this.style.opacity='1'"><strong>${student.name}</strong></a></td>
      <td>${student.standard || "10th Standard"} ${student.board ? `<br><small class="text-muted">${student.board}</small>` : "" }</td>
      <td>${student.total} / ${getStandardMaxMarks(student.standard, student.board)}</td>
      <td>${student.percentage}</td>
      <td><span class="badge bg-secondary px-2.5 py-1.5">${student.grade}</span></td>
      ${actionsCell}
    </tr>
  `;
}

function displaySearchResults(results) {
  const tableBody = document.getElementById("studentTableBody");
  if (!tableBody) return;
  
  const isAdmin = isCurrentUserAdmin();
  const canPerformAnyAction = isAdmin || results.some(s => canManageStudentRecord(s));
  
  const actionsHeader = document.getElementById("actionsHeader");
  if (actionsHeader) {
    actionsHeader.style.display = canPerformAnyAction ? "" : "none";
  }

  if (results.length === 0) {
    const colspan = canPerformAnyAction ? 7 : 6;
    tableBody.innerHTML = `<tr><td colspan="${colspan}" class="text-center text-muted py-4">No matching records found.</td></tr>`;
    return;
  }

  const sortedResults = [...results].sort((a, b) => {
    const percentageA = parseFloat(a.percentage);
    const percentageB = parseFloat(b.percentage);
    return percentageB - percentageA;
  });

  tableBody.innerHTML = sortedResults.map(createStudentTableRow).join('');
}

function openAddStudentModal() {
  const form = document.getElementById("addStudentForm");
  if (form) {
    form.removeAttribute("data-editing-roll");
    form.reset();
    
    // Ensure academic fields are enabled for admins adding new records
    const academicFields = [
      "addBoard", "addStandard", "addEnglishMarks", "addHindiMarks", 
      "addMarathiMarks", "addScienceMarks", "addMathsMarks", "addSocialScienceMarks"
    ];
    academicFields.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.disabled = false;
    });
    
    const scienceLabel = document.querySelector('label[for="addScienceMarks"]');
    const socialLabel = document.querySelector('label[for="addSocialScienceMarks"]');
    if (scienceLabel) scienceLabel.textContent = "Science";
    if (socialLabel) socialLabel.textContent = "Social Science";
  }
  const rollInput = document.getElementById("addRollNumber");
  if (rollInput) {
    const nextRoll = students.length > 0 ? Math.max(...students.map(s => s.roll_no)) + 1 : 1;
    rollInput.value = nextRoll;
    rollInput.disabled = true;
  }
  
  const modalEl = document.getElementById("addStudentModal");
  if (modalEl) {
    // Reuse existing instance to prevent multiple backdrops stacking
    let modal = bootstrap.Modal.getInstance(modalEl);
    if (!modal) modal = new bootstrap.Modal(modalEl);
    modal.show();
  }
}

function renderStudentTable() {
  const tableBody = document.getElementById("studentTableBody");
  if (!tableBody) return;

  const { email } = getCurrentUserSession();
  const isAdmin = isCurrentUserAdmin();  
  const visibleStudents = getUsersDataFromLocalStorage(); // Ensure we always get the latest data
  const canPerformAnyAction = isAdmin || visibleStudents.some(s => canManageStudentRecord(s));
  
  const actionsHeader = document.getElementById("actionsHeader");
  if (actionsHeader) {
    actionsHeader.style.display = canPerformAnyAction ? "" : "none";
  }
  const addBtns = document.querySelectorAll('button[onclick="openAddStudentModal()"], #addStudentBtn');
  addBtns.forEach(btn => {
    if (isAdmin) {
      btn.style.display = btn.classList.contains('gap-2') ? 'inline-flex' : 'inline-block';
    } else {
      btn.style.display = 'none';
    }
  });

  const fragment = document.createDocumentFragment();

  if (visibleStudents.length === 0) {
    const colspan = canPerformAnyAction ? 7 : 6;
    const emptyRow = document.createElement('tr');
    emptyRow.innerHTML = `<td colspan="${colspan}" class="text-center text-muted py-4">No records available. Please add a student.</td>`;
    fragment.appendChild(emptyRow);
    tableBody.replaceChildren(fragment);
    return;
  }

  const sortedStudents = [...visibleStudents].sort((a, b) => {
    const percentageA = parseFloat(a.percentage);
    const percentageB = parseFloat(b.percentage);
    return percentageB - percentageA;
  });

  tableBody.innerHTML = sortedStudents.map(createStudentTableRow).join('');
}

function displayStudentProfile(rollNo) {
  const index = students.findIndex(s => s.roll_no === rollNo);
  if (index !== -1) {
    display(index);
    const reportContainer = document.getElementById("reportContainer");
    if (reportContainer) {
      reportContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}

function editStudent(rollNo) {
  const student = students.find(s => s.roll_no === rollNo);
  if (!student) return;

  if (!canManageStudentRecord(student)) {
    Swal.fire("Access Denied", "You do not have permission to edit this record.", "error");
    return;
  }

  openAddStudentModal();
  
  const form = document.getElementById("addStudentForm");
  form.setAttribute("data-editing-roll", rollNo);
  
  document.getElementById("addStudentName").value = student.name;
  document.getElementById("addRollNumber").value = student.roll_no;
  document.getElementById("addRollNumber").disabled = true; 
  document.getElementById("addEnglishMarks").value = student.marks.English || 0;
  document.getElementById("addHindiMarks").value = student.marks.Hindi || 0;
  document.getElementById("addMarathiMarks").value = student.marks.Marathi || 0;
  document.getElementById("addScienceMarks").value = student.marks.Science !== undefined ? student.marks.Science : (student.marks['EVS 1'] || 0);
  
  const mathEl = document.getElementById("addMathsMarks");
  if (mathEl) mathEl.value = student.marks.Maths || 0;
  
  const socialEl = document.getElementById("addSocialScienceMarks");
  if (socialEl) socialEl.value = student.marks['Social Science'] !== undefined ? student.marks['Social Science'] : (student.marks['EVS 2'] || 0);
  
  const boardSelect = document.getElementById("addBoard");
  if (boardSelect) {
    boardSelect.value = student.board || "SSC";
    // Trigger change to show/hide Marathi appropriately
    const event = new Event('change');
    boardSelect.dispatchEvent(event);
  }

  const standardSelect = document.getElementById("addStandard");
  if (standardSelect) {
    standardSelect.value = student.standard || "";
    standardSelect.dispatchEvent(new Event('change'));
  }
}

function deleteStudent(rollNo) {
  const student = students.find(s => s.roll_no === rollNo);
  if (!canManageStudentRecord(student)) {
    Swal.fire("Access Denied", "You do not have permission to delete this record.", "error");
    return;
  }

  Swal.fire({
    title: 'Delete Student Record?',
    text: "Are you sure you want to completely delete this student record? This action cannot be undone.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Yes, delete it!'
  }).then((result) => {
    if (result.isConfirmed) {
      students = students.filter(s => s.roll_no !== rollNo);
      saveStudentsToLocalStorage();
      renderStudentTable();
      Swal.fire("Deleted!", "The student record has been removed.", "success");
    }
  });
}

// Helper function to ensure we always get the latest student data from localStorage
function getUsersDataFromLocalStorage() {
  return JSON.parse(localStorage.getItem("studentsData")) || defaultStudents;
}

// Helper functions for Social/Culture page
function getSocialContent() {
  let posts = JSON.parse(localStorage.getItem("socialAndCultureContent")) || [];
  
  // Ensure we're always working with an array.
  if (!Array.isArray(posts)) {
      posts = [];
  }

  let needsSave = false;
  const now = Date.now();
  let counter = 0;

  // This loop migrates old data by ensuring every post has a unique ID, which is crucial for deletion.
  posts.forEach(post => {
    if (post.id === undefined || post.id === null) {
      post.id = now + counter++; // Assign a unique ID to any post that is missing one.
      needsSave = true;
    }
  });

  // If we modified any posts by adding an ID, save the changes back to localStorage.
  if (needsSave) {
    saveSocialContent(posts);
  }
  
  return posts;
}

function saveSocialContent(content) {
  localStorage.setItem("socialAndCultureContent", JSON.stringify(content));
}

function renderSocialMedia(url, title) {
    if (!url) return '';
    // Check for Data URLs first (from file upload)
    if (url.startsWith('data:image/')) {
        return `<img src="${url}" class="card-img-top" alt="${title}" style="max-height: 400px; object-fit: cover;">`;
    }
    if (url.startsWith('data:video/')) {
        return `
            <div class="card-img-top" style="background: #000;">
                <video controls style="width: 100%; max-height: 400px;">
                    <source src="${url}">
                    Your browser does not support the video tag.
                </video>
            </div>`;
    }

    // Then check for external URLs (YouTube, etc.)
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch && youtubeMatch[1]) {
        return `<div class="ratio ratio-16x9 mb-3"><iframe src="https://www.youtube.com/embed/${youtubeMatch[1]}" title="${title}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
    }

    // Image URL by extension
    if (url.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
        return `<img src="${url}" class="card-img-top" alt="${title}" style="max-height: 400px; object-fit: cover;" onerror="this.style.display='none'">`;
    }

    // Direct video file URL by extension
    if (url.match(/\.(mp4|webm|ogg)$/i)) {
        return `
            <div class="card-img-top" style="background: #000;">
                <video controls style="width: 100%; max-height: 400px;">
                    <source src="${url}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
            </div>`;
    }
    return '';
}

function renderSocialContent() {
  const container = document.getElementById("social-content-container");
  if (!container) {
    return;
  }

  const isAdmin = isCurrentUserAdmin();
  const addBtn = document.getElementById("addSocialPostBtn");
  if (addBtn) addBtn.classList.toggle('d-none', !isAdmin);

  const posts = getSocialContent();
  if (posts.length === 0) {
    container.innerHTML = '<p class="text-muted text-center mt-4">No social or cultural events have been posted yet.</p>';
    return;
  }

  container.innerHTML = posts
    .sort((a, b) => (b.date ? new Date(b.date) : 0) - (a.date ? new Date(a.date) : 0)) // Sort by date descending, handle null dates
    .map(post => `
      <div class="card mb-4 shadow-sm">
        ${renderSocialMedia(post.mediaUrl, post.title)}
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start">
              <div>
                  <h5 class="card-title">${post.title}</h5>
                  ${post.date ? `<h6 class="card-subtitle mb-2 text-muted">${new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</h6>` : ''}
              </div>
              ${isAdmin ? `<button class="btn btn-sm btn-outline-danger" onclick="deleteSocialPost(${post.id})">Delete</button>` : ''}
          </div>
          <p class="card-text mt-2">${post.description.replace(/\n/g, '<br>')}</p>
        </div>
      </div>
    `).join('');
}

function deleteSocialPost(postId) {
  if (!isCurrentUserAdmin()) {
    Swal.fire("Access Denied", "You do not have permission to perform this action.", "error");
    return;
  }
  Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!'
  }).then((result) => {
    if (result.isConfirmed) {
      let posts = getSocialContent();
      posts = posts.filter(post => post.id !== postId);
      saveSocialContent(posts);
      renderSocialContent();
      Swal.fire('Deleted!', 'The post has been deleted.', 'success');
    }
  });
}

document.addEventListener("DOMContentLoaded", function() {
  const isAdmin = isCurrentUserAdmin();

  const addBtns = document.querySelectorAll('button[onclick="openAddStudentModal()"], #addStudentBtn');
  addBtns.forEach(btn => {
    if (isAdmin) {
      btn.style.display = btn.classList.contains('gap-2') ? 'inline-flex' : 'inline-block';
    } else {
      btn.style.display = 'none';
    }
  });

  const addStandardEl = document.getElementById("addStandard");
  const addBoardEl = document.getElementById("addBoard");

  function updateSubjectLabels() {
    if (!addStandardEl || !addBoardEl) return;
    const standard = addStandardEl.value || "";
    const board = addBoardEl.value || "SSC";

    const isPrimarySSC = board === "SSC" && ["1st Standard", "2nd Standard", "3rd Standard", "4th Standard"].includes(standard);

    const scienceLabel = document.querySelector('label[for="addScienceMarks"]');
    const socialLabel = document.querySelector('label[for="addSocialScienceMarks"]');

    if (scienceLabel) scienceLabel.textContent = isPrimarySSC ? "EVS 1" : "Science";
    if (socialLabel) socialLabel.textContent = isPrimarySSC ? "EVS 2" : "Social Science";
  }

  if (addStandardEl) addStandardEl.addEventListener("change", updateSubjectLabels);
  if (addBoardEl) addBoardEl.addEventListener("change", updateSubjectLabels);

  const form = document.getElementById("addStudentForm");
  if (form) {
    form.addEventListener("submit", function(e) {
      e.preventDefault();
      
      const studentName = document.getElementById("addStudentName").value.trim();
      const rollNumber = parseInt(document.getElementById("addRollNumber").value);
      const standardEl = document.getElementById("addStandard");
      const standard = (standardEl && standardEl.value) ? standardEl.value : "10th Standard";
      const boardSelect = document.getElementById("addBoard");
      const board = (boardSelect && boardSelect.value) ? boardSelect.value : "SSC";
      
      const englishMarks = parseInt(document.getElementById("addEnglishMarks").value) || 0;
      const hindiMarks = parseInt(document.getElementById("addHindiMarks").value) || 0;
      const marathiMarks = parseInt(document.getElementById("addMarathiMarks").value) || 0;
      const scienceMarks = parseInt(document.getElementById("addScienceMarks").value) || 0;
      
      const mathEl = document.getElementById("addMathsMarks");
      const socialEl = document.getElementById("addSocialScienceMarks");
      const mathsMarks = mathEl ? (parseInt(mathEl.value) || 0) : 0;
      const socialScienceMarks = socialEl ? (parseInt(socialEl.value) || 0) : 0;
      
      if (englishMarks > 100 || hindiMarks > 100 || marathiMarks > 100 || scienceMarks > 100 || mathsMarks > 100 || socialScienceMarks > 100) {
        Swal.fire('Invalid Marks', 'Maximum marks per subject is 100.', 'warning');
        return;
      }

      const maxMarks = 600;
      const isPrimarySSC = board === "SSC" && ["1st Standard", "2nd Standard", "3rd Standard", "4th Standard"].includes(standard);
      let marksObj = { English: englishMarks, Hindi: hindiMarks, Marathi: marathiMarks, Maths: mathsMarks };
      if (isPrimarySSC) {
        marksObj['EVS 1'] = scienceMarks;
        marksObj['EVS 2'] = socialScienceMarks;
      } else {
        marksObj['Science'] = scienceMarks;
        marksObj['Social Science'] = socialScienceMarks;
      }

      let totalMarks = Object.values(marksObj).reduce((sum, mark) => sum + mark, 0);
      const percentageValue = (totalMarks / maxMarks) * 100;
      const percentage = percentageValue.toFixed(1) + "%";
      const autoCalculatedFinalGrade = getGrade(percentageValue);
      
      const editingRoll = form.getAttribute("data-editing-roll");
      const { email } = getCurrentUserSession(); // Get current user email for createdBy
      const isAdmin = isCurrentUserAdmin();

      const existingStudent = editingRoll ? students.find(s => s.roll_no === parseInt(editingRoll)) : null;

      if (existingStudent) {
        // Editing an existing student
        if (!canManageStudentRecord(existingStudent)) {
          Swal.fire('Access Denied', 'You do not have permission to edit this record.', 'error');
          return;
        }
        existingStudent.name = studentName;
        existingStudent.standard = standard;
        existingStudent.board = board;
        existingStudent.marks = marksObj;
        existingStudent.total = totalMarks;
        existingStudent.percentage = percentage;
        existingStudent.grade = autoCalculatedFinalGrade;
        // createdBy remains unchanged for existing students
      } else {
        // Adding a new student
        if (!isAdmin) {
          Swal.fire('Access Denied', 'Only administrators can add new students.', 'error');
          return;
        }

        if (students.some(s => s.roll_no === rollNumber)) {
          Swal.fire('Duplicate Entry', 'A student with this Roll Number already exists! Please use a unique Roll Number.', 'warning');
          return;
        }

        const newStudent = {
          name: studentName,
          roll_no: rollNumber,
          standard: standard,
          board: board,
          marks: marksObj,
          total: totalMarks,
          percentage: percentage,
          grade: autoCalculatedFinalGrade,
          createdBy: email || 'admin' // Assign the current user as creator
        };
        students.push(newStudent);
      }
      
      saveStudentsToLocalStorage();
      renderStudentTable();
      
      Swal.fire('Success!', editingRoll ? "Student records adjusted successfully!" : "Student added successfully!", 'success');
      form.reset();
      form.removeAttribute("data-editing-roll");
      
      const modalEl = document.getElementById("addStudentModal");
      const modal = bootstrap.Modal.getInstance(modalEl);
      if (modal) modal.hide();
    });
  }

  // Logic for Social and Culture Page
  if (window.location.pathname.includes("social-and-culture.html")) {
    renderSocialContent();

    const aiSummaryBtn = document.getElementById("generateAiSummaryBtn");
    if (aiSummaryBtn) {
      aiSummaryBtn.addEventListener('click', function() {
        const mediaUrlInput = document.getElementById("postMediaUrl");
        const mediaFileInput = document.getElementById("postMediaFile");
        const descriptionInput = document.getElementById("postDescription");
        
        const url = mediaUrlInput.value.trim();
        const file = mediaFileInput.files[0];

        let mediaSourceForSummary = '';

        if (file) {
            if (file.type.startsWith('image/')) {
                mediaSourceForSummary = 'image-file';
            } else if (file.type.startsWith('video/')) {
                mediaSourceForSummary = 'video-file';
            } else {
                Swal.fire('Unsupported File Type', 'AI summary is currently supported for image and video files.', 'info');
                return;
            }
        } else if (url) {
            mediaSourceForSummary = url;
        } else {
            Swal.fire('No Media', 'Please provide an image/video URL or upload a file first to generate a summary.', 'info');
            return;
        }

        // Simulate AI processing
        let summary = "\n\n--- AI Summary ---\n";
        if (mediaSourceForSummary === 'image-file' || mediaSourceForSummary.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
            summary += "This is an image. Key visual elements could be described here. For example, it might be a group photo from an event, a scenic view, or an award ceremony.";
        } else if (mediaSourceForSummary === 'video-file' || mediaSourceForSummary.includes("youtube.com") || mediaSourceForSummary.includes("youtu.be") || mediaSourceForSummary.match(/\.(mp4|webm|ogg)$/i)) {
            summary += "This is a YouTube video. A summary of the video's content, including key topics discussed or events shown, would be generated here.";
        } else {
            summary += "The provided link is for a media asset. A detailed description based on its content would be generated here.";
        }

        descriptionInput.value += summary;
        Swal.fire('Summary Generated', 'An AI-generated summary has been added to the description. Remember to review and edit it as needed.', 'success');
      });
    }

    const socialPostForm = document.getElementById("socialPostForm");
    if (socialPostForm) {
      socialPostForm.addEventListener("submit", function(e) {
        e.preventDefault();

        const title = document.getElementById("postTitle").value;
        const description = document.getElementById("postDescription").value;
        const date = document.getElementById("postDate").value;
        const mediaUrl = document.getElementById("postMediaUrl").value;
        const mediaFileInput = document.getElementById("postMediaFile");
        const file = mediaFileInput.files[0];

        const savePost = (postToSave) => {
            const posts = getSocialContent();
            posts.push(postToSave);
            saveSocialContent(posts);
            renderSocialContent();

            // Hide modal and reset form
            const modalEl = document.getElementById("socialPostModal");
            const modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) modal.hide();
            socialPostForm.reset();
            
            Swal.fire('Success!', 'The new post has been added.', 'success');
        };

        if (file) {
            // User uploaded a file, prioritize it.
            const reader = new FileReader();
            reader.onload = function(event) {
                const newPost = {
                    id: Date.now(),
                    title: title,
                    description: description,
                    mediaUrl: event.target.result, // The Base64 Data URL
                    date: date,
                };
                savePost(newPost);
            };
            reader.onerror = function() {
                Swal.fire('File Error', 'There was an error reading the file. It might be too large.', 'error');
            };
            reader.readAsDataURL(file);
        } else {
            // No file uploaded, use the URL field.
            const newPost = {
                id: Date.now(),
                title: title,
                description: description,
                mediaUrl: mediaUrl,
                date: date,
            };
            savePost(newPost);
        }
      });
    }
  }

  // Allow Enter key to trigger search
  const searchInput = document.getElementById("studentSearch");
  if (searchInput) {
    // Implement live search filtering as the user types.
    // The searchStudent() function handles both filtering and clearing. Using 'input' event for live search.
    searchInput.addEventListener("input", () => searchStudent());
  }
});

function updateNavbarProfileIcon(imageData) {
    const navIcon = document.getElementById('navbarProfileIcon');
    if (navIcon) {
        navIcon.src = imageData;
    }
}

function loadAndSetProfilePictures() {
    const defaultNavAvatar = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="white" class="bi bi-person-circle" viewBox="0 0 16 16"><path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/><path fill-rule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"/></svg>')}`;
    
    const usersDatabase = JSON.parse(localStorage.getItem('usersList')) || [];
    const { email } = getCurrentUserSession();
    let profilePicture = defaultNavAvatar;

    if (email && usersDatabase.length > 0) {
        const currentUser = usersDatabase.find(user => user.email === email);
        if (currentUser && currentUser.profilePicture) {
            profilePicture = currentUser.profilePicture;
        }
    }
    updateNavbarProfileIcon(profilePicture);
}
