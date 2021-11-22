const BASE_URL = "https://lighthouse-user-api.herokuapp.com"
const INDEX_URL = BASE_URL + "/api/v1/users"
const USER_URL = INDEX_URL + '/'
const introduction = document.querySelector('#introduction')
const features = document.querySelector('#features')
const dataContainer = document.querySelector('#data-container')
const userPanel = document.querySelector('#user-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const modal = document.querySelector('#user-modal')
const paginators = document.querySelector('.pagination')

const users = []
let filteredUsers = []
let closeFirends = []

USERS_PER_PAGE = 16

////////////////////////////// Execution //////////////////////////////
generateUsers();

dataContainer.addEventListener('click', function onCardClicked(event) {
  const target = event.target
  showUserModal(event.target.dataset.id)
})

// Searching users with keywords
searchForm.addEventListener('click', function onFormSubmitted(event) {
  event.preventDefault() // avoid the page being re-loaded
  findUsers(event) // find the specific users (filtered users)
  loadUserData(getUsersByPage(1)) // re-render the panel (page 1 by default)
  renderPaginators(filteredUsers.length) // re-render the paginators
})

// Add to close friends
modal.addEventListener('click', function onButtonClicked(event) {
  const id = Number(event.target.dataset.id)

  if (event.target.classList.contains('btn-add-to-close-friends')) {
    addToClose(id)
  }
})

// Change the pages (when clicking paginations)
paginators.addEventListener('click', function onPaginatorClicked(event) {
  page = Number(event.target.dataset.page)
  loadUserData(getUsersByPage(page))
})


////////////////////////////// Functions //////////////////////////////
function generateUsers() {
  // get the data of users
  axios
    .get(INDEX_URL)
    .then(function (response) {
      // 1. Store the data
      users.push(...response.data.results)

      // 2. Render the panel
      loadUserData(getUsersByPage(1))
      renderPaginators(users.length)
    })
    .catch((error) => console.log(error));
}

//////////////////////////////

function loadUserData(users) {
  let rawHTML = "";

  users.forEach(function (user) {
    rawHTML += `
    <div class="col-3">
		<div class="card m-4" style="width: 17rem;">
		<button type="button" class="btn btn-light show-user-info" data-bs-toggle="modal" data-bs-target="#user-modal" data-id="${user.id}">
    <img src=${user.avatar} alt="" data-id=${user.id}>
		</button>
		<div class="card-body">
			<h5>${user.name} ${user.surname}</h5>
		</div>
	</div>
  </div>`;
  });
  userPanel.innerHTML = rawHTML;
}

////////////////////////////// This function is called when event is triggered

function showUserModal(id) {
  const modalTitle = document.querySelector('#user-modal-title')
  const modalImage = document.querySelector('#user-modal-image')
  const modalDescription = document.querySelector('#user-modal-description')
  const modalButton = document.querySelector('.btn-add-to-close-friends')

  axios.get(USER_URL + id).then((response) => {
    const data = response.data

    modalTitle.innerText = `${data.surname}  ${data.name}`
    modalDescription.innerHTML = `Age: ${data.age}</br>Gender: ${data.gender}</br>Birthday: ${data.birthday}</br>Region: ${data.region}</br>Email: ${data.email}`
    modalImage.innerHTML = `<img src=${data.avatar} alt="user-avatar" class="img-fluid" style="width: 75%">`
    modalButton.dataset.id = id
  }).catch(error => console.log(error))
}

////////////////////////////////////////////////////////////

function findUsers(event) {
  // 1. Get the keywords
  const keyword = searchInput.value.toLowerCase().trim()

  // 2. Filter the users list
  filteredUsers = users.filter(function (user) {
    return user.name.toLowerCase().includes(keyword) || user.surname.toLowerCase().includes(keyword)
  })

  // 3. Check the exceptions (when the button is clicked)
  if (!filteredUsers.length && event.target.tagName === "BUTTON") {
    return alert('請輸入有效關鍵字!')
  }

  // Since the "filtered" user list is modified, we do NOT need to return anything!
}

////////////////////////////////////////////////////////////

function addToClose(id) {
  // 1. Get the closeFriends list from the local storage
  closeFirends = JSON.parse(localStorage.getItem('closeFriends')) || []

  // 2. Get the corresponding user
  const newCloseFriend = users.find(user => user.id === id)

  // 3. Check if the user is in the closeFriends list
  if (closeFirends.some(user => user.id === id)) {
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
  let list = filteredUsers.length ? filteredUsers : users

  // 2. Find where to start
  let startIndex = (page - 1) * USERS_PER_PAGE

  // 3. Split the data of users
  return list.slice(startIndex, startIndex + USERS_PER_PAGE)
}