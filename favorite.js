const BASE_URL = "https://randomuser.me/api/"
const dataContainer = document.querySelector('#data-container')
const userPanel = document.querySelector('#user-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const genderContainer = document.querySelector('#gender-button-container')
const paginators = document.querySelector('.pagination')
const modal = document.querySelector('#user-modal')

let users = [] // The closeFriends list
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

    // 避免載入 filteredUsersGenderded，而是要載入 filteredUsers
    filteredUsersGendered = []

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

// Change the gender
genderContainer.addEventListener('click', function onGenderButtonClicked(event) {
  event.preventDefault()
  const target = event.target

  if (target.id === 'gender-button-male') {
    changeGender('male')
  } else if (target.id === 'gender-button-female') {
    changeGender('female')
  } else {
    generateUsers()
  }
})

////////////////////////////// Functions //////////////////////////////

function changeGender(gender) {
  // Avoid potential rendering contents problems (May wrongfully load the gendered users when selecting non-specific gender if there are still users in the filteredUsersGendered list)
  filteredUsersGendered = []

  if (!filteredUsers.length && !filteredUsersGendered.length) { // 沒有搜尋關鍵字過，無論是否選取過性別
    // generate another set of users with specific gender
    filteredUsersGendered = users.filter(user => user.gender === gender)
  } else { // 有搜尋過關鍵字，從 filteredUsers 中尋找
    filteredUsersGendered = filteredUsers.filter(user => user.gender === gender)
  }

  // check if there is any user with specific gender
  if (!filteredUsersGendered.length) {
    return alert("無此性別之相關用戶!")
  }

  loadUserData(getUsersByPage(1)) // render the user panel
  renderPaginators(1) // render the pagination
}

////////////////////////////////////////////////////////////

function generateUsers() {
  // 避免 getUsersByPage 在 filteredUsersGendered 的情況下，誤 render 篩選過性別的結果
  filteredUsersGendered = []

  if (!filteredUsers.length && !filteredUsersGendered.length) { // 仍未載入最愛使用者 (一開始時)
    const userList = JSON.parse(localStorage.getItem('closeFriends'))
    users = []
    users.push(...userList)
  } else {
    // 避免 getUsersByPage 在 filteredUsersGendered 的情況下，誤 render 篩選過性別的結果
    filteredUsersGendered = []
  }

  loadUserData(getUsersByPage(1)) // will load all the filtered users
  renderPaginators(1)
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
  if (!filteredUsers.length && !filteredUsersGendered.length) { // 沒有篩選過關鍵字與性別
    listLength = users.length
  } else if (filteredUsers.length && !filteredUsersGendered.length) { // 有篩選過關鍵字，沒有選過性別
    listLength = filteredUsers.length
  } else { // 有選過性別
    listLength = filteredUsersGendered.length
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
  if (pageNum === totalPagesOfPag && totalPages % PAG_PER_PAGE !== 0) {
    for (let page = startPage; page < startPage + (totalPages % PAG_PER_PAGE); page++) {
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

  if (!filteredUsers.length && !filteredUsersGendered.length) { // 沒有篩選過關鍵字與性別
    list = users
  } else if (filteredUsers.length && !filteredUsersGendered.length) { // 有篩選過關鍵字，沒有選過性別
    list = filteredUsers
  } else {
    list = filteredUsersGendered
  }

  // 2. Find where to start
  let startIndex = (page - 1) * USERS_PER_PAGE

  // 3. Split the data of users
  return list.slice(startIndex, startIndex + USERS_PER_PAGE)
}