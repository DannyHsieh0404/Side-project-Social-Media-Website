const BASE_URL = "https://randomuser.me/api/"
const introduction = document.querySelector('#introduction')
const features = document.querySelector('#features')
const dataContainer = document.querySelector('#data-container')
const userPanel = document.querySelector('#user-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const modal = document.querySelector('#user-modal')
const paginators = document.querySelector('.pagination')
const genderContainer = document.querySelector('#gender-button-container')
const dropDownGender = document.querySelector('#dropdown-menu-gender')

let users = []
let filteredUsers = []
let filteredUsersGendered = []
let closeFirends = []

USERS_PER_PAGE = 16
PAG_PER_PAGE = 5
NUM_OF_USERS = 800

let currentPage = 1

////////////////////////////// Execution //////////////////////////////
generateUsers()

dataContainer.addEventListener('click', function onUserClicked(event) {
  const target = event.target
  if (target.classList.contains("show-user-info") || target.tagName === "IMG") {
    showUserModal(target.dataset.sha1)
  } else if (target.matches('#heart-add-to-close-friends')) {
    const sha1 = target.dataset.sha1
    if (!target.classList.contains('added')) {
      // Not added yet
      addToClose(sha1)
      target.classList.add('added')
    } else {
      // Added, need to remove
      removeCloseFriend(sha1)
      target.classList.remove('added')
    }
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
    renderPaginators(1) // re-render the pagination
  }
})


// Add to close friends
modal.addEventListener('click', function onButtonClicked(event) {
  const sha1 = event.target.dataset.sha1

  if (event.target.classList.contains('btn-add-to-close-friends')) {
    addToClose(sha1)
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


// Change the gender from navbar
dropDownGender.addEventListener('click', function onGenderButtonClicked(event) {
  event.preventDefault()
  const target = event.target
  if (target.classList.contains('male')) {
    changeGender('male')
  } else if (target.classList.contains('female')) {
    changeGender('female')
  } else {
    generateUsers()
  }
})


////////////////////////////// Functions //////////////////////////////
function generateUsers() {
  if (!filteredUsers.length && !filteredUsersGendered.length) { // 沒有搜尋過關鍵字，選擇了未指定性別 (一開始時)
    axios
      .get(BASE_URL + `?results=${NUM_OF_USERS}`)
      .then(function (response) {
        // 1. Store the data
        users = []
        users.push(...response.data.results)
        loadUserData(getUsersByPage(1))
        renderPaginators(1)
      })
      .catch((error) => console.log(error));
  } else {
    // 避免 getUsersByPage 在 filteredUsersGendered 的情況下，誤 render 篩選過性別的結果
    filteredUsersGendered = []

    loadUserData(getUsersByPage(1))
    renderPaginators(1)
  }
}

//////////////////////////////

function changeGender(gender) {
  // Avoid potential rendering contents problems (May wrongfully load the gendered users when selecting non-specific gender if there are still users in the filteredUsersGendered list)
  filteredUsersGendered = []

  if (!filteredUsers.length && !filteredUsersGendered.length) { // double guarantees (even if seems unnacessary)
    // find users with specific gender in the users list
    filteredUsersGendered = users.filter(user => user.gender === gender)
  } else {
    // only shows the filtered users with specific gender
    filteredUsersGendered = filteredUsers.filter(user => user.gender === gender)
  }
  // check if there is any user with specific gender
  if (!filteredUsersGendered.length) {
    return alert("無此性別之相關用戶!")
  }

  loadUserData(getUsersByPage(1)) // render the user panel
  renderPaginators(1) // render the pagination
}

//////////////////////////////

function loadUserData(users) {
  userPanel.innerHTML = users.map(user => (
    `<div class="col">
		<div class="card m-4" id="user-card" style="width: 15rem;">
		<button type="button" class="btn btn-light show-user-info" data-bs-toggle="modal" data-bs-target="#user-modal" data-sha1="${user.login.sha1}">
    <img src=${user.picture.large} alt="" data-sha1="${user.login.sha1}">
		</button>
		<div class="card-body">
			<h5>${user.name.first} ${user.name.last}</h5>
      <span>
        <i class="far fa-heart fa" id="heart-add-to-close-friends" data-sha1="${user.login.sha1}"></i>
      </span>
		</div>
	</div>
  </div>`)).join('')
}

////////////////////////////// This function is called when event is triggered

function showUserModal(sha1) {
  const modalTitle = document.querySelector('#user-modal-title')
  const modalImage = document.querySelector('#user-modal-image')
  const modalDescription = document.querySelector('#user-modal-description')
  const modalButton = document.querySelector('.btn-add-to-close-friends')

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
  modalImage.innerHTML = `<img src=${data.picture.large} alt="user-avatar" class="img-fluid" id="modal-avatar">`
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
  filteredUsers = Userlist.length ? Userlist : []

  // 5. Clean up the search input
  searchInput.value = ""
  // Since the "filtered" user list is modified, we do NOT need to return anything!


  // FIXME: Potential problem: sometimes after filtering users (with results), and then click search btn without entering input will generate users of specific gender and not able to change to another gender (generate users with another gender).
}

////////////////////////////////////////////////////////////

function addToClose(sha1) {
  // 1. Get the closeFriends list from the local storage
  closeFirends = JSON.parse(localStorage.getItem('closeFriends')) || []

  // 2. Get the corresponding user
  const newCloseFriend = users.find(function (user) {
    return user.login.sha1 === sha1
  })

  // 3. Check if the user is in the closeFriends list
  if (closeFirends.some(user => user.login.sha1 === sha1)) {
    return alert("名單中已有此用戶!")
  }

  // 4. Store the closeFirends list to the local storage
  closeFirends.push(newCloseFriend)
  localStorage.setItem('closeFriends', JSON.stringify(closeFirends))
}

////////////////////////////////////////////////////////////

function removeCloseFriend(sha1) {
  // 0. Get the favorite friend list
  closeFirends = JSON.parse(localStorage.getItem('closeFriends')) || []

  // 1. Get the closeFriends list (if any)
  if (!closeFirends.length || !closeFirends) { return alert('您已無 close friends...') }

  // 2. Find the corresponding user ID
  const removedIndex = closeFirends.findIndex(user => user.login.sha1 === sha1)

  // 3. Remove the user
  closeFirends.splice(removedIndex, 1)

  // 4. Update and store the list to local storage
  localStorage.setItem('closeFriends', JSON.stringify(closeFirends))
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
  } else {
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

// Return the data of a specific page
function getUsersByPage(page) {
  // 1. Determine which user list to split
  let list = []

  if (!filteredUsers.length && !filteredUsersGendered.length) {
    list = users
  } else if (filteredUsers.length && !filteredUsersGendered.length) {
    list = filteredUsers
  } else {
    list = filteredUsersGendered
  }

  // 2. Find where to start
  let startIndex = (page - 1) * USERS_PER_PAGE

  // 3. Split the data of users
  return list.slice(startIndex, startIndex + USERS_PER_PAGE)
}