document.getElementById('login-form').addEventListener('submit', function (e) {
    let valid = true;

    // Validate Email
    const email = document.getElementById('email');
    const emailError = document.getElementById('email-error');
    if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
        emailError.classList.remove('hidden');
        email.classList.add('border-red-500');
        valid = false;
    } else {
        emailError.classList.add('hidden');
        email.classList.remove('border-red-500');
    }

    // Validate Password
    const password = document.getElementById('password');
    const passwordError = document.getElementById('password-error');
    if (!password.value || password.value.length < 8) {
        passwordError.classList.remove('hidden');
        password.classList.add('border-red-500');
        valid = false;
    } else {
        passwordError.classList.add('hidden');
        password.classList.remove('border-red-500');
    }

    // Validate Role
    const role = document.getElementById('role');
    const roleError = document.getElementById('role-error');
    if (!role.value) {
        roleError.classList.remove('hidden');
        role.classList.add('border-red-500');
        valid = false;
    } else {
        roleError.classList.add('hidden');
        role.classList.remove('border-red-500');
    }

    // Prevent form submission if validation fails
    if (!valid) {
        e.preventDefault();
    }
});

// Toggle Password Visibility
function togglePassword() {
    const passwordField = document.getElementById('password');
    const eyeIcon = document.getElementById('eye-icon');
    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        eyeIcon.classList.remove('fa-eye');
        eyeIcon.classList.add('fa-eye-slash');
    } else {
        passwordField.type = 'password';
        eyeIcon.classList.remove('fa-eye-slash');
        eyeIcon.classList.add('fa-eye');
    }
}
