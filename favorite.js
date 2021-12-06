// TODO: 
// 1. Add gender selecting feature (both users and filteredUsers).
// 2. Add pagination (both users and filteredUsers). (Done)
// 3. Change Search bar layout. (Done)
// 4. Change contents layout in Modals. (Done)

const BASE_URL = "https://randomuser.me/api/"
const dataContainer = document.querySelector('#data-container')
const userPanel = document.querySelector('#user-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginators = document.querySelector('.pagination')
const modal = document.querySelector('#user-modal')

const users = [] // The closeFriends list
let filteredUsers = [] // For searching close friends with keywords
let filteredUsersGendered = [] // For filtering by gender

USERS_PER_PAGE = 8
PAG_PER_PAGE = 5

////////////////////////////// Execution //////////////////////////////
generateUsers();

dataContainer.addEventListener('click', function onUserClicked(event) {
  const target = event.target
  if (target.classList.contains("show-user-info") || target.tagName === "IMG") {
    showUserModal(target.dataset.sha1)
  }
})

// Searching users with keywords
searchForm.addEventListener('click', function onFormSubmitted(event) {
  const target = event.target

  if (target.classList.contains("search-btn")) {
    event.preventDefault() // avoid the page being re-loaded
    findUsers() // find the specific users (filtered users)
    loadUserData(getUsersByPage(1)) // re-render the panel
    renderPaginators(1) // re-render pagination
  }
})

// Remove close friends
modal.addEventListener('click', function onButtonClicked(event) {
  if (event.target.classList.contains('btn-remove-close-friends')) {
    const sha1 = event.target.dataset.sha1
    removeCloseFriend(sha1)
    loadUserData(getUsersByPage(1))
  }
})

// Credit: 曉諭同學的 pagination 寫法修改
// Change the pages (when clicking paginations)
paginators.addEventListener('click', function onPaginatorClicked(event) {
  event.preventDefault()
  const target = event.target
  page = Number(event.target.dataset.page)

  if (target.classList.contains("previous")) {
    renderPaginators(page - 1)
  } else if (target.classList.contains("next")) {
    renderPaginators(page + 1)
  } else {
    loadUserData(getUsersByPage(page))
  }
})


////////////////////////////// Functions //////////////////////////////
function generateUsers() {
  if (!filteredUsers.length && !filteredUsersGendered.length) {
    // get the data of users
    const userList = JSON.parse(localStorage.getItem('closeFriends'))
    users.push(...userList)
    loadUserData(getUsersByPage(1))
    renderPaginators(1)
  } else if (filteredUsers.length && !filteredUsersGendered.length) { // double guarantees
    // load all the filtered users with all kinds of genders
    loadUserData(getUsersByPage(1)) // will load all the filtered users
    renderPaginators(1)
  }
}
////////////////////////////////////////////////////////////

function loadUserData(users) {
  let rawHTML = "";

  users.forEach(function (user) {

    rawHTML += `
    <div class="col-3">
		<div class="card m-4" style="width: 17rem;">
		<button type="button" class="btn btn-light show-user-info" data-bs-toggle="modal" data-bs-target="#user-modal" data-sha1="${user.login.sha1}">
    <img src=${user.picture.large} alt="" data-sha1="${user.login.sha1}">
		</button>
		<div class="card-body">
			<h5>${user.name.first} ${user.name.last}</h5>
		</div>
	</div>
  </div>`;
  });
  userPanel.innerHTML = rawHTML;
}

////////////////////////////// This function is called when event is triggered

function showUserModal(sha1) {
  const modalTitle = document.querySelector('#user-modal-title')
  const modalImage = document.querySelector('#user-modal-image')
  const modalDescription = document.querySelector('#user-modal-description')
  const modalButton = document.querySelector('.btn-remove-close-friends')

  const data = users.find(function (user) {
    return user.login.sha1 === sha1
  })

  modalTitle.innerText = `${data.name.first}  ${data.name.last}`
  modalDescription.innerHTML = `<ul class="list-group list-group-flush">
  <li class="list-group-item">Age: ${data.dob.age}</li>
  <li class="list-group-item">Gender: ${data.gender}</li>
  <li class="list-group-item">Birthday: ${data.dob.date}</li>
  <li class="list-group-item">Region: ${data.location.city}, ${data.location.country}</li>
  <li class="list-group-item">Email: ${data.email}</li>
  </ul>`
  modalImage.innerHTML = `<img src=${data.picture.large} alt="user-avatar" class="img-fluid rounded" style="width: 12rem;">`
  modalButton.dataset.sha1 = sha1
}


////////////////////////////////////////////////////////////

function findUsers() {
  // 1. Get the keywords
  const keyword = searchInput.value.toLowerCase().trim()

  // 2. Filter the users list
  const Userlist = users.filter(function (user) {
    return user.name.first.toLowerCase().includes(keyword) || user.name.last.toLowerCase().includes(keyword)
  })

  // 3. Check the exceptions (when the button is clicked)
  if (!Userlist.length) {
    alert('請輸入有效關鍵字!')
  }

  // 4. Determine what's the contents for filteredUsers
  filteredUsers = Userlist.length ? Userlist : users

  // 5. Clean up the search input
  searchInput.value = ""
  // Since the "filtered" user list is modified, we do NOT need to return anything!
}

////////////////////////////////////////////////////////////

function removeCloseFriend(sha1) {
  // 1. Get the closeFriends list (if any)
  if (!users.length || !users) { return alert('您已無 close friends...') }

  // 2. Find the corresponding user ID
  const removedIndex = users.findIndex(user => user.login.sha1 === sha1)

  // 3. Remove the user
  users.splice(removedIndex, 1)

  // 4. Update and store the list to local storage
  localStorage.setItem('closeFriends', JSON.stringify(users))
}

////////////////////////////////////////////////////////////

function renderPaginators(pageNum) {
  // Find the length of the list
  let listLength = 0
  if (!filteredUsers.length) {
    listLength = users.length
  } else {
    if (filteredUsersGendered.length) { listLength = filteredUsersGendered.length }
    else { listLength = filteredUsers.length }
  }

  // Find the total number of pages & right number pages of paginators
  totalPages = Math.ceil(listLength / USERS_PER_PAGE)
  totalPagesOfPag = Math.ceil(totalPages / PAG_PER_PAGE)

  // Deal with exceptions
  if (pageNum < 1 || pageNum > totalPagesOfPag) { return }

  // Determine the current page (=== page inputted)
  currentPage = pageNum

  // Determine which page to start from
  const startPage = (pageNum - 1) * PAG_PER_PAGE + 1

  let rawHTML = `<li class="page-item">
       <a class="page-link previous" href="#" aria-label="Previous" data-page=${pageNum}>
         <span aria-hidden="true" class = "previous" data-page=${pageNum}>&laquo;</span>
       </a>
     </li>`

  // Number of pages of paginators doesn't meet "a page" of pages of paginators
  if (pageNum === totalPages && totalPages % PAG_PER_PAGE !== 0) {
    for (let page = startPage; page < startPage + totalPages % PAG_PER_PAGE; page++) {
      rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page = ${page}>${page}</a></li>`
    }
  } else if (totalPages < PAG_PER_PAGE) {
    for (let page = startPage; page < startPage + totalPages; page++) {
      rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page = ${page}>${page}</a></li>`
    }
  }
  else {
    for (let page = startPage; page < startPage + PAG_PER_PAGE; page++) {
      rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page = ${page}>${page}</a></li>`
    }
  }
  rawHTML += `<li class="page-item">
       <a class="page-link next" href="#" aria-label="Next" data-page=${pageNum}>
        <span aria-hidden="true" class = "next" data-page=${pageNum}>&raquo;</span>
       </a>
     </li>`
  paginators.innerHTML = rawHTML
}

////////////////////////////////////////////////////////////

function getUsersByPage(page) {
  // 1. Determine which user list to split
  let list = []

  if (!filteredUsers.length) {
    list = users
  } else if (filteredUsers.length && !filteredUsersGendered.length) {
    list = filteredUsers
  } else if (filteredUsers.length && filteredUsersGendered.length) {
    list = filteredUsersGendered
  }

  // 2. Find where to start
  let startIndex = (page - 1) * USERS_PER_PAGE

  // 3. Split the data of users
  return list.slice(startIndex, startIndex + USERS_PER_PAGE)
}