/**
 * ConnectFlow - Contact Management Logic
 * Using Vanilla JavaScript (ES6+) and Fetch API
 */

const API_BASE_URL = '/api/contacts';

// DOM Elements
const contactsContainer = document.getElementById('contacts-container');
const addContactBtn = document.getElementById('add-contact-btn');
const contactModal = document.getElementById('contact-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const cancelContactBtn = document.getElementById('cancel-contact-btn');
const contactForm = document.getElementById('contact-form');
const contactSearch = document.getElementById('contact-search');
const noContactsMsg = document.getElementById('no-contacts-msg');
const totalContactsCount = document.getElementById('total-contacts-count');
const favoriteContactsCount = document.getElementById('favorite-contacts-count');
const confirmModal = document.getElementById('confirm-modal');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
const deleteContactNameElem = document.getElementById('delete-contact-name');
const contactPhotoInput = document.getElementById('contact-photo');
const photoPreviewContainer = document.getElementById('photo-preview-container');
const photoPreviewImg = document.getElementById('photo-preview-img');
const removePhotoBtn = document.getElementById('remove-photo-btn');
const profilePictureUrlInput = document.getElementById('profilePictureUrl');

// State
let contacts = [];
let contactToDelete = null;

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  checkProtocol();
  fetchContacts();
  setupEventListeners();
});

function checkProtocol() {
  if (window.location.protocol === 'file:') {
    const errorPrefix = '⚠️ PROTOCOL ERROR DETECTED: ';
    const fixMessage = 'You are opening index.html directly from your folders. This breaks connectivity.\n\nPLEASE GO TO: http://localhost:5000\n\nin your browser instead.';
    console.error(errorPrefix + fixMessage);
    alert(errorPrefix + fixMessage);
  }
}

function setupEventListeners() {
  // Modal toggle
  addContactBtn.addEventListener('click', () => openModal());
  closeModalBtn.addEventListener('click', closeModal);
  cancelContactBtn.addEventListener('click', closeModal);

  // Form submission
  contactForm.addEventListener('submit', handleFormSubmit);

  // Search functionality (with debouncing)
  contactSearch.addEventListener('input', debounce((e) => {
    fetchContacts(e.target.value);
  }, 300));

  // Global modal close on click outside
  window.addEventListener('click', (e) => {
    if (e.target === contactModal) closeModal();
    if (e.target === confirmModal) hideConfirmModal();
  });

  // Delete modal actions
  cancelDeleteBtn.addEventListener('click', hideConfirmModal);
  confirmDeleteBtn.addEventListener('click', async () => {
    if (contactToDelete) {
      await deleteContact(contactToDelete);
      hideConfirmModal();
    }
  });

  // Photo upload handling
  contactPhotoInput.addEventListener('change', handlePhotoSelection);
  removePhotoBtn.addEventListener('click', clearPhotoSelection);
}

function handlePhotoSelection(e) {
  const file = e.target.files[0];
  if (file) {
    if (file.size > 2 * 1024 * 1024) {
        alert('Image is too large. Please select a photo smaller than 2MB.');
        clearPhotoSelection();
        return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target.result;
      profilePictureUrlInput.value = base64String;
      photoPreviewImg.src = base64String;
      photoPreviewContainer.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  }
}

function clearPhotoSelection() {
  contactPhotoInput.value = '';
  profilePictureUrlInput.value = '';
  photoPreviewContainer.classList.add('hidden');
  photoPreviewImg.src = '';
}

// Store & Fetch Logic
async function fetchContacts(search = '') {
  try {
    const url = search ? `${API_BASE_URL}?search=${encodeURIComponent(search)}` : API_BASE_URL;
    const response = await fetch(url);
    contacts = await response.json();
    renderContacts(contacts);
    updateStats(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    showNotification('alert', 'Error connecting to server. Please check if backend is running.');
  }
}

async function handleFormSubmit(e) {
  e.preventDefault();

  const formData = new FormData(contactForm);
  const contactData = {
    name: formData.get('name'),
    phone: formData.get('phone'),
    email: formData.get('email'),
    address: formData.get('address'),
    profilePictureUrl: formData.get('profilePictureUrl'),
    isFavorite: formData.get('isFavorite') === 'on',
  };

  const contactId = document.getElementById('contact-id').value;

  try {
    let response;
    if (contactId) {
      // Update existing contact
      response = await fetch(`${API_BASE_URL}/${contactId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactData),
      });
    } else {
      // Create new contact
      response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactData),
      });
    }

    const result = await response.json();

    if (response.ok) {
      closeModal();
      fetchContacts(contactSearch.value);
      showNotification('success', contactId ? 'Contact updated!' : 'Contact added!');
    } else {
      console.error('Server Error Response:', result);
      const errorMessage = result.error || result.message || 'Error ' + response.status + ': ' + response.statusText;
      showNotification('error', errorMessage);
    }
  } catch (error) {
    console.error('Error saving contact:', error);
    showNotification('error', 'Network error. Please try again.');
  }
}

async function toggleFavorite(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}/favorite`, { method: 'PATCH' });
    if (response.ok) {
      const updatedContact = await response.json();
      contacts = contacts.map(c => c._id === id ? updatedContact : c);
      renderContacts(contacts);
      updateStats(contacts);
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
  }
}

async function deleteContact(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
    if (response.ok) {
        fetchContacts(contactSearch.value);
        showNotification('success', 'Contact deleted successfully.');
    }
  } catch (error) {
    console.error('Error deleting contact:', error);
  }
}

// UI Rendering Logic
function renderContacts(contactsToRender) {
  contactsContainer.innerHTML = '';

  if (contactsToRender.length === 0) {
    noContactsMsg.classList.remove('hidden');
    contactsContainer.classList.add('hidden');
    return;
  }

  noContactsMsg.classList.add('hidden');
  contactsContainer.classList.remove('hidden');

  contactsToRender.forEach(contact => {
    const card = createContactCard(contact);
    contactsContainer.appendChild(card);
  });
}

function createContactCard(contact) {
  const div = document.createElement('div');
  div.className = 'contact-card';

  const avatarUrl = contact.profilePictureUrl;

  div.innerHTML = `
    <div class="favorite-badge ${contact.isFavorite ? 'active' : ''}" onclick="event.stopPropagation(); window.toggleFavoriteOuter('${contact._id}')">
        <i class="${contact.isFavorite ? 'fas' : 'far'} fa-star"></i>
    </div>
    <div class="contact-image-container">
        <img src="${avatarUrl}" alt="${contact.name}">
    </div>
    <div class="contact-info">
        <h3>${contact.name}</h3>
        <span class="contact-phone">${contact.phone}</span>
        <span class="contact-email">${contact.email}</span>
        <p class="contact-address">${contact.address || 'No address provided'}</p>
    </div>
    <div class="contact-actions">
        <button class="btn edit-btn" onclick="window.editContactOuter('${contact._id}')">
            <i class="fas fa-edit"></i> Edit
        </button>
        <button class="btn danger-btn" onclick="window.deleteContactOuter('${contact._id}', '${contact.name}')">
            <i class="fas fa-trash"></i>
        </button>
    </div>
  `;

  return div;
}

// Expose functions to window for onclick handlers
window.toggleFavoriteOuter = (id) => toggleFavorite(id);
window.editContactOuter = (id) => {
  const contact = contacts.find(c => c._id === id);
  if (contact) {
    openModal(contact);
  }
};
window.deleteContactOuter = (id, name) => showConfirmModal(id, name);

// Utils & Helpers
function openModal(contact = null) {
  const modalTitle = document.getElementById('modal-title');
  const contactIdInput = document.getElementById('contact-id');
  const pfpInput = document.getElementById('profilePictureUrl');

  if (contact) {
    modalTitle.textContent = 'Edit Contact';
    contactIdInput.value = contact._id;
    document.getElementById('name').value = contact.name;
    document.getElementById('phone').value = contact.phone;
    document.getElementById('email').value = contact.email;
    document.getElementById('address').value = contact.address || '';
    
    // Fill the photo preview if an image exists
    if (contact.profilePictureUrl && contact.profilePictureUrl.startsWith('data:image')) {
        profilePictureUrlInput.value = contact.profilePictureUrl;
        photoPreviewImg.src = contact.profilePictureUrl;
        photoPreviewContainer.classList.remove('hidden');
    } else {
        clearPhotoSelection();
    }
    
    document.getElementById('isFavorite').checked = contact.isFavorite;
  } else {
    modalTitle.textContent = 'Add New Contact';
    contactForm.reset();
    contactIdInput.value = '';
    clearPhotoSelection();
  }

  contactModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  contactModal.classList.add('hidden');
  document.body.style.overflow = 'auto';
}

function showConfirmModal(id, name) {
  contactToDelete = id;
  deleteContactNameElem.textContent = name;
  confirmModal.classList.remove('hidden');
}

function hideConfirmModal() {
  confirmModal.classList.add('hidden');
  contactToDelete = null;
}

function updateStats(contacts) {
    totalContactsCount.textContent = contacts.length;
    favoriteContactsCount.textContent = contacts.filter(c => c.isFavorite).length;
}

function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

function showNotification(type, message) {
    // Simple alert for now, could be a toast system
    if (type === 'error' || type === 'alert') {
        alert(message);
    } else {
        console.log(`Notification [${type}]: ${message}`);
        // Optionally add a toast UI here
    }
}
