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
NUM_OF_USERS = 120


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

    // re-render the pagination based on situation
    if (filteredUsers.length) {
      renderPaginators(filteredUsers.length)
    } else {
      renderPaginators(users.length)
    }
  }
})


// Add to close friends
modal.addEventListener('click', function onButtonClicked(event) {
  const sha1 = event.target.dataset.sha1

  if (event.target.classList.contains('btn-add-to-close-friends')) {
    addToClose(sha1)
  }
})

// Change the pages (when clicking paginations)
paginators.addEventListener('click', function onPaginatorClicked(event) {
  page = Number(event.target.dataset.page)
  loadUserData(getUsersByPage(page))
})


// Change the gender
genderContainer.addEventListener('click', function onGenderButtonClicked(event) {
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
  if (!filteredUsers.length && !filteredUsersGendered.length) {
    // get the data of users
    axios
      .get(BASE_URL + `?results=${NUM_OF_USERS}`)
      .then(function (response) {
        // 1. Store the data
        users = []
        users.push(...response.data.results)

        // 2. Render the panel
        loadUserData(getUsersByPage(1))
        renderPaginators(users.length)
      })
      .catch((error) => console.log(error));
  } else if (filteredUsers.length && !filteredUsersGendered.length) { // double guarantees
    // load all the filtered users with all kinds of genders
    loadUserData(getUsersByPage(1)) // will load all the filtered users
    renderPaginators(filteredUsers.length)
  }
}

//////////////////////////////
function changeGender(gender) {
  if (!filteredUsers.length && !filteredUsersGendered.length) { // double guarantees (even if seems unnacessary)
    // generate another set of users with specific gender
    axios
      .get(BASE_URL + `?gender=${gender}&results=${NUM_OF_USERS}`)
      .then(function (response) {
        users = []
        users.push(...response.data.results)

        loadUserData(getUsersByPage(1)) // render the user panel
        renderPaginators(users.length) // render the pagination
      })
      .catch((error) => console.log(error));
  } else {
    // only shows the filtered users with specific gender

    filteredUsers.forEach(function (user) {
      if (user.gender === gender) {
        filteredUsersGendered.push(user) // if meets the specific gender, then store it in a temporary array
      }
    })

    // check if there is any user with specific gender
    if (!filteredUsersGendered.length) {
      loadUserData(getUsersByPage(1)) // render the user panel
      renderPaginators(filteredUsers.length) // render the pagination
      alert("無此性別之相關用戶!")
    } else {
      loadUserData(getUsersByPage(1)) // render the user panel (filteredUsersGendered)
      renderPaginators(filteredUsersGendered.length) // render the pagination (filteredUsersGendered)
    }

    // remove the gendered users to avoid potential rendering contents problems (May wrongfully load the gendered users when selecting non-specific gender if there are still users in the filteredUsersGendered list)
    filteredUsersGendered = []
  }
}

//////////////////////////////

function loadUserData(users) {
  let rawHTML = "";

  users.forEach(function (user) {
    rawHTML += `
    <div class="col-3">
		<div class="card m-4" id="user-card" style="width: 17rem;">
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
  const modalButton = document.querySelector('.btn-add-to-close-friends')

  const data = users.find(function (user) {
    return user.login.sha1 === sha1
  })

  modalTitle.innerText = `${data.name.first}  ${data.name.last}`
  modalDescription.innerHTML = `Age: ${data.dob.age}</br>Gender: ${data.gender}</br>Birthday: ${data.dob.date}</br>Region: ${data.location.city}, ${data.location.countrys}</br>Email: ${data.email}`
  modalImage.innerHTML = `<img src=${data.picture.large} alt="user-avatar" class="img-fluid" style="width: 75%">`
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

function renderPaginators(numOfUsers) {
  // 1. Find the # of pages
  const numOfPages = Math.ceil(numOfUsers / USERS_PER_PAGE)

  // 2. Generate the paginators
  let rawHTML = ''
  for (let page = 1; page <= numOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page = ${page}>${page}</a></li>`
  }
  paginators.innerHTML = rawHTML
}

////////////////////////////////////////////////////////////

// Return the data of a specific page
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