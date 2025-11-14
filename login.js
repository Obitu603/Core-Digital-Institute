// Demo credentials (In a real application, these would be stored securely on a server)
const VALID_CREDENTIALS = [
    { username: 'admin', password: 'admin123' },
    { username: 'coredigital', password: 'digital2024' },
    { username: 'institute', password: 'core123' }
];

// DOM Elements
const loginForm = document.getElementById('loginForm');
const successAlert = document.getElementById('successAlert');
const errorAlert = document.getElementById('errorAlert');
const buttonLoader = document.getElementById('buttonLoader');
const loginButton = document.querySelector('.login-button');

// Initialize the login page
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in (from sessionStorage)
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
        redirectToAdmin();
        return;
    }

    // Add event listener to the form
    loginForm.addEventListener('submit', handleLogin);
});

// Handle login form submission
function handleLogin(event) {
    event.preventDefault();
    
    // Get form values
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Validate inputs
    if (!username || !password) {
        showError('Please fill in all fields');
        return;
    }
    
    // Show loading state
    setLoadingState(true);
    
    // Simulate API call delay
    setTimeout(() => {
        // Check credentials
        const isValid = validateCredentials(username, password);
        
        if (isValid) {
            // Login successful
            handleSuccessfulLogin(rememberMe);
        } else {
            // Login failed
            handleFailedLogin();
        }
        
        // Hide loading state
        setLoadingState(false);
    }, 1500);
}

// Validate user credentials
function validateCredentials(username, password) {
    return VALID_CREDENTIALS.some(cred => 
        cred.username === username && cred.password === password
    );
}

// Handle successful login
function handleSuccessfulLogin(rememberMe) {
    // Store login state
    sessionStorage.setItem('isLoggedIn', 'true');
    if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
    }
    
    // Show success message
    showSuccess();
    
    // Redirect to admin page after delay
    setTimeout(() => {
        redirectToAdmin();
    }, 2000);
}

// Handle failed login
function handleFailedLogin() {
    showError('Invalid username or password. Please try again.');
    
    // Clear password field
    document.getElementById('password').value = '';
    
    // Shake animation for form
    loginForm.style.animation = 'shake 0.5s ease-in-out';
    setTimeout(() => {
        loginForm.style.animation = '';
    }, 500);
}

// Set loading state
function setLoadingState(isLoading) {
    if (isLoading) {
        loginButton.classList.add('loading');
        loginButton.disabled = true;
    } else {
        loginButton.classList.remove('loading');
        loginButton.disabled = false;
    }
}

// Show success alert
function showSuccess() {
    // Hide error alert if visible
    errorAlert.style.display = 'none';
    
    // Show success alert
    successAlert.style.display = 'flex';
    
    // Add success animation to form
    loginForm.style.transform = 'scale(0.98)';
    setTimeout(() => {
        loginForm.style.transform = 'scale(1)';
    }, 300);
}

// Show error alert
function showError(message) {
    // Hide success alert if visible
    successAlert.style.display = 'none';
    
    // Update error message
    errorAlert.querySelector('span').textContent = message;
    
    // Show error alert
    errorAlert.style.display = 'flex';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        hideError();
    }, 5000);
}

// Hide error alert
function hideError() {
    errorAlert.style.display = 'none';
}

// Redirect to admin page
function redirectToAdmin() {
    window.location.href = 'Admin.html';
}

// Add shake animation for failed login
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
`;
document.head.appendChild(style);

// Demo credentials hint (remove in production)
console.log('Demo Credentials:');
console.log('Username: admin, Password: admin123');
console.log('Username: coredigital, Password: digital2024');

console.log('Username: institute, Password: core123');
