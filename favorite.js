const BASE_URL = "https://randomuser.me/api/"
const dataContainer = document.querySelector('#data-container')
const userPanel = document.querySelector('#user-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const modal = document.querySelector('#user-modal')

const users = [] // The closeFriends list
let filteredUsers = [] // For searching close friends with keywords


////////////////////////////// Execution //////////////////////////////
generateUsers();

dataContainer.addEventListener('click', function onUserClicked(event) {
  const target = event.target
  showUserModal(event.target.dataset.id)
})

// Searching users with keywords
searchForm.addEventListener('click', function onFormSubmitted(event) {
  event.preventDefault() // avoid the page being re-loaded
  findUsers(users, event) // find the specific users (filtered users)
  loadUserData(filteredUsers) // re-render the panel
})

// Remove close friends
modal.addEventListener('click', function onButtonClicked(event) {
  if (event.target.classList.contains('btn-remove-close-friends')) {
    const id = Number(event.target.dataset.id)
    removeCloseFriend(id)
    loadUserData(users)
  }
})


////////////////////////////// Functions //////////////////////////////
function generateUsers() {
  // get the data of users
  const userList = JSON.parse(localStorage.getItem('closeFriends'))
  users.push(...userList)
  loadUserData(users)
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
  const modalButton = document.querySelector('.btn-add-to-close-friends')

  const data = users.find(function (user) {
    return user.login.sha1 === sha1
  })

  modalTitle.innerText = `${data.name.first}  ${data.name.last}`
  modalDescription.innerHTML = `Age: ${data.dob.age}</br>Gender: ${data.gender}</br>Birthday: ${data.dob.date}</br>Region: ${data.location.city}, ${data.location.countrys}</br>Email: ${data.email}`
  modalImage.innerHTML = `<img src=${data.picture.large} alt="user-avatar" class="img-fluid" style="width: 75%">`
  modalButton.dataset.id = id
}


////////////////////////////////////////////////////////////

function findUsers(users, event) {
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

function removeCloseFriend(id) {
  // 1. Get the closeFriends list (if any)
  if (!users.length || !users) { return alert('您已無 close friends...') }

  // 2. Find the corresponding user ID
  const removedIndex = users.findIndex(user => user.id === id)

  // 3. Remove the user
  users.splice(removedIndex, 1)

  // 4. Update and store the list to local storage
  localStorage.setItem('closeFriends', JSON.stringify(users))
}