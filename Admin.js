// Authentication Check - MUST BE AT THE TOP
        function checkAuthentication() {
            const isLoggedIn = sessionStorage.getItem('isLoggedIn');
            const username = sessionStorage.getItem('username');
            
            if (!isLoggedIn || isLoggedIn !== 'true') {
                // Redirect to login page if not authenticated
                window.location.href = 'login.html';
                return false;
            }
            
            // Display username if available
            if (username) {
                document.getElementById('usernameDisplay').textContent = username;
            }
            
            return true;
        }

        // Logout Function
        function logout() {
            // Clear session storage
            sessionStorage.removeItem('isLoggedIn');
            sessionStorage.removeItem('username');
            
            // Clear localStorage if remember me was used
            localStorage.removeItem('rememberMe');
            
            // Redirect to login page
            window.location.href = 'login.html';
        }

        // Firebase configuration
        const firebaseConfig = {
            apiKey: "AIzaSyA02hhmSbJpCFcbBF6FQ6DcBUnSje6p0_M",
            authDomain: "core-digital-institute.firebaseapp.com",
            databaseURL: "https://core-digital-institute-default-rtdb.firebaseio.com",
            projectId: "core-digital-institute",
            storageBucket: "core-digital-institute.firebasestorage.app",
            messagingSenderId: "377928151947",
            appId: "1:377928151947:web:7a702d60c876860bd7b58e",
            measurementId: "G-D3BF2JBFPZ"
        };

        // Initialize Firebase
        let database;
        if (typeof firebase !== 'undefined') {
            firebase.initializeApp(firebaseConfig);
            database = firebase.database();
        } else {
            console.error("Firebase is not loaded. Check if Firebase SDK is included.");
        }

        // DOM Elements
        const registrationsTable = document.getElementById('registrationsTable');
        const loadingIndicator = document.getElementById('loadingIndicator');
        const emptyState = document.getElementById('emptyState');
        const searchInput = document.getElementById('searchInput');
        const courseFilter = document.getElementById('courseFilter');
        const countryFilter = document.getElementById('countryFilter');
        const statsContainer = document.getElementById('statsContainer');
        const successAlert = document.getElementById('successAlert');
        const errorAlert = document.getElementById('errorAlert');
        const logoutBtn = document.getElementById('logoutBtn');
        const logoutModal = document.getElementById('logoutModal');

        // Modal Elements
        const editModal = document.getElementById('editModal');
        const viewModal = document.getElementById('viewModal');
        const editForm = document.getElementById('editForm');
        const viewDetails = document.getElementById('viewDetails');

        // Course mapping
        const courses = {
            'app': 'Application Packages',
            'web': 'Web Development',
            'ai': 'Responsible AI',
            'design': 'Graphic Design',
            'cyber': 'Cybersecurity',
            'data': 'Data Science'
        };

        // Global variables
        let registrations = [];
        let filteredRegistrations = [];

        // Initialize the dashboard
        document.addEventListener('DOMContentLoaded', function() {
            // Check authentication first
            if (!checkAuthentication()) {
                return;
            }
            
            loadRegistrations();
            
            // Event listeners for filters
            searchInput.addEventListener('input', filterRegistrations);
            courseFilter.addEventListener('change', filterRegistrations);
            countryFilter.addEventListener('change', filterRegistrations);
            
            // Modal event listeners
            document.getElementById('closeEditModal').addEventListener('click', () => editModal.style.display = 'none');
            document.getElementById('cancelEdit').addEventListener('click', () => editModal.style.display = 'none');
            document.getElementById('closeViewModal').addEventListener('click', () => viewModal.style.display = 'none');
            document.getElementById('closeView').addEventListener('click', () => viewModal.style.display = 'none');
            document.getElementById('saveChanges').addEventListener('click', saveEditedRegistration);
            
            // Logout event listeners
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                logoutModal.style.display = 'flex';
            });
            
            document.getElementById('closeLogoutModal').addEventListener('click', () => logoutModal.style.display = 'none');
            document.getElementById('cancelLogout').addEventListener('click', () => logoutModal.style.display = 'none');
            document.getElementById('confirmLogout').addEventListener('click', logout);
            
            // Mobile menu toggle
            document.querySelector('.mobile-menu-btn').addEventListener('click', function() {
                document.querySelector('.nav-links').classList.toggle('active');
            });
            
            // Close modals when clicking outside
            window.addEventListener('click', (e) => {
                if (e.target === editModal) editModal.style.display = 'none';
                if (e.target === viewModal) viewModal.style.display = 'none';
                if (e.target === logoutModal) logoutModal.style.display = 'none';
            });

            // Auto-logout after 30 minutes of inactivity
            setupAutoLogout();
        });

        // Auto logout after 30 minutes of inactivity
        function setupAutoLogout() {
            let timeout;
            
            function resetTimer() {
                clearTimeout(timeout);
                timeout = setTimeout(logout, 30 * 60 * 1000); // 30 minutes
            }
            
            // Reset timer on user activity
            ['click', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
                document.addEventListener(event, resetTimer);
            });
            
            resetTimer(); // Start the timer
        }

        // Load registrations from Firebase
        function loadRegistrations() {
            loadingIndicator.style.display = 'flex';
            emptyState.style.display = 'none';
            
            const registrationsRef = database.ref('coredigitalregistration');
            
            registrationsRef.on('value', (snapshot) => {
                registrations = [];
                snapshot.forEach((childSnapshot) => {
                    const registration = childSnapshot.val();
                    registration.id = childSnapshot.key;
                    registrations.push(registration);
                });
                
                updateDashboardStats();
                filterRegistrations();
                loadingIndicator.style.display = 'none';
            }, (error) => {
                console.error("Error loading data: ", error);
                showAlert(errorAlert, "Error loading registration data");
                loadingIndicator.style.display = 'none';
            });
        }

        // Update dashboard statistics with all courses
        function updateDashboardStats() {
            // Clear existing stats
            statsContainer.innerHTML = '';
            
            // Total registrations card
            const totalCard = document.createElement('div');
            totalCard.className = 'stat-card';
            totalCard.innerHTML = `
                <div class="stat-value">${registrations.length}</div>
                <div class="stat-label">Total Registrations</div>
            `;
            statsContainer.appendChild(totalCard);
            
            // Create a card for each course
            Object.keys(courses).forEach(courseCode => {
                const courseCount = registrations.filter(reg => reg.course === courseCode).length;
                const courseCard = document.createElement('div');
                courseCard.className = 'stat-card';
                courseCard.innerHTML = `
                    <div class="stat-value">${courseCount}</div>
                    <div class="stat-label">${courses[courseCode]}</div>
                `;
                statsContainer.appendChild(courseCard);
            });
        }

        // Filter registrations based on search and filters
        function filterRegistrations() {
            const searchTerm = searchInput.value.toLowerCase();
            const courseValue = courseFilter.value;
            const countryValue = countryFilter.value;
            
            filteredRegistrations = registrations.filter(registration => {
                const matchesSearch = !searchTerm || 
                    registration.firstName.toLowerCase().includes(searchTerm) ||
                    registration.lastName.toLowerCase().includes(searchTerm) ||
                    registration.email.toLowerCase().includes(searchTerm) ||
                    getCourseName(registration.course).toLowerCase().includes(searchTerm);
                
                const matchesCourse = !courseValue || registration.course === courseValue;
                const matchesCountry = !countryValue || registration.country === countryValue;
                
                return matchesSearch && matchesCourse && matchesCountry;
            });
            
            renderRegistrationsTable();
        }

        // Render the registrations table
        function renderRegistrationsTable() {
            registrationsTable.innerHTML = '';
            
            if (filteredRegistrations.length === 0) {
                emptyState.style.display = 'block';
                return;
            }
            
            emptyState.style.display = 'none';
            
            filteredRegistrations.forEach(registration => {
                const row = document.createElement('tr');
                
                // Format date
                const date = registration.timestamp ? 
                    new Date(registration.timestamp).toLocaleDateString() : 'N/A';
                
                row.innerHTML = `
                    <td>${registration.firstName} ${registration.lastName}</td>
                    <td>${registration.email}</td>
                    <td>${registration.phone}</td>
                    <td>${getCountryName(registration.country)}</td>
                    <td>${getCourseName(registration.course)}</td>
                    <td>${getEducationLevel(registration.education)}</td>
                    <td>${getExperienceLevel(registration.experience)}</td>
                    <td>${date}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-view" onclick="viewRegistration('${registration.id}')">
                                <i class="fas fa-eye"></i> View
                            </button>
                            <button class="btn btn-edit" onclick="editRegistration('${registration.id}')">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="btn btn-delete" onclick="deleteRegistration('${registration.id}')">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    </td>
                `;
                
                registrationsTable.appendChild(row);
            });
        }

        // View registration details
        function viewRegistration(id) {
            const registration = registrations.find(reg => reg.id === id);
            if (!registration) return;
            
            const date = registration.timestamp ? 
                new Date(registration.timestamp).toLocaleString() : 'N/A';
            
            viewDetails.innerHTML = `
                <div class="form-group">
                    <label>Name:</label>
                    <p>${registration.firstName} ${registration.lastName}</p>
                </div>
                <div class="form-group">
                    <label>Email:</label>
                    <p>${registration.email}</p>
                </div>
                <div class="form-group">
                    <label>Phone:</label>
                    <p>${registration.phone}</p>
                </div>
                <div class="form-group">
                    <label>Country:</label>
                    <p>${getCountryName(registration.country)}</p>
                </div>
                <div class="form-group">
                    <label>Course:</label>
                    <p>${getCourseName(registration.course)}</p>
                </div>
                <div class="form-group">
                    <label>Education Level:</label>
                    <p>${getEducationLevel(registration.education)}</p>
                </div>
                <div class="form-group">
                    <label>Experience Level:</label>
                    <p>${getExperienceLevel(registration.experience)}</p>
                </div>
                <div class="form-group">
                    <label>Additional Information:</label>
                    <p>${registration.message || 'None provided'}</p>
                </div>
                <div class="form-group">
                    <label>Registration Date:</label>
                    <p>${date}</p>
                </div>
            `;
            
            viewModal.style.display = 'flex';
        }

        // Edit registration
        function editRegistration(id) {
            const registration = registrations.find(reg => reg.id === id);
            if (!registration) return;
            
            document.getElementById('editId').value = registration.id;
            document.getElementById('editFirstName').value = registration.firstName;
            document.getElementById('editLastName').value = registration.lastName;
            document.getElementById('editEmail').value = registration.email;
            document.getElementById('editPhone').value = registration.phone;
            document.getElementById('editCountry').value = registration.country;
            document.getElementById('editCourse').value = registration.course;
            document.getElementById('editEducation').value = registration.education;
            document.getElementById('editExperience').value = registration.experience;
            document.getElementById('editMessage').value = registration.message || '';
            
            editModal.style.display = 'flex';
        }

        // Save edited registration
        function saveEditedRegistration() {
            const id = document.getElementById('editId').value;
            const updatedData = {
                firstName: document.getElementById('editFirstName').value,
                lastName: document.getElementById('editLastName').value,
                email: document.getElementById('editEmail').value,
                phone: document.getElementById('editPhone').value,
                country: document.getElementById('editCountry').value,
                course: document.getElementById('editCourse').value,
                education: document.getElementById('editEducation').value,
                experience: document.getElementById('editExperience').value,
                message: document.getElementById('editMessage').value
            };
            
            // Update in Firebase
            database.ref('coredigitalregistration/' + id).update(updatedData)
                .then(() => {
                    showAlert(successAlert, "Registration updated successfully");
                    editModal.style.display = 'none';
                })
                .catch((error) => {
                    console.error("Error updating registration: ", error);
                    showAlert(errorAlert, "Error updating registration");
                });
        }

        // Delete registration
        function deleteRegistration(id) {
            if (confirm("Are you sure you want to delete this registration? This action cannot be undone.")) {
                database.ref('coredigitalregistration/' + id).remove()
                    .then(() => {
                        showAlert(successAlert, "Registration deleted successfully");
                    })
                    .catch((error) => {
                        console.error("Error deleting registration: ", error);
                        showAlert(errorAlert, "Error deleting registration");
                    });
            }
        }

        // Helper functions
        function getCourseName(courseCode) {
            return courses[courseCode] || courseCode;
        }

        function getCountryName(countryCode) {
            const countries = {
                'us': 'United States',
                'uk': 'United Kingdom',
                'ca': 'Canada',
                'au': 'Australia',
                'in': 'India',
                'ng': 'Nigeria',
                'br': 'Brazil',
                'de': 'Germany',
                'other': 'Other'
            };
            return countries[countryCode] || countryCode;
        }

        function getEducationLevel(educationCode) {
            const educationLevels = {
                'highschool': 'High School',
                'associate': 'Associate Degree',
                'bachelor': 'Bachelor\'s Degree',
                'master': 'Master\'s Degree',
                'doctorate': 'Doctorate',
                'other': 'Other'
            };
            return educationLevels[educationCode] || educationCode;
        }

        function getExperienceLevel(experienceCode) {
            const experienceLevels = {
                'none': 'No experience',
                'beginner': 'Beginner (0-1 years)',
                'intermediate': 'Intermediate (1-3 years)',
                'advanced': 'Advanced (3+ years)'
            };
            return experienceLevels[experienceCode] || experienceCode;
        }

        function showAlert(alertElement, message) {
            alertElement.textContent = message;
            alertElement.style.display = 'block';
            setTimeout(() => {
                alertElement.style.display = 'none';
            }, 5000);
        }