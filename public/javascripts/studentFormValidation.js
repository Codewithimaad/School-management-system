document.getElementById('student-form').addEventListener('submit', function (e) {
    let valid = true;

    function validateField(fieldId, errorId, condition, errorMessage) {
        const field = document.getElementById(fieldId);
        const error = document.getElementById(errorId);

        if (condition(field.value)) {
            error.style.display = "none";
            field.classList.remove('border-2');
        } else {
            error.innerText = errorMessage;
            error.style.display = "block";
            field.classList.add('border-2');
            valid = false;
        }
    }

    // Date of Birth Validation
    function validateDOB() {
        const dobField = document.getElementsByName("dob")[0];
        const dobError = document.getElementById("dob-error");
        const dobValue = new Date(dobField.value);
        const today = new Date();

        if (!dobField.value) {
            dobError.innerText = "Please select a Date of Birth";
            dobError.style.display = "block";
            dobField.classList.add("border-2");
            valid = false;
        } else if (dobValue >= today) {
            dobError.innerText = "Date of Birth cannot be in the future";
            dobError.style.display = "block";
            dobField.classList.add("border-2");
            valid = false;
        } else {
            dobError.style.display = "none";
            dobField.classList.remove("border-2");
        }
    }


    // Password Validation (Fixed)

    function validatePassword() {
        const passwordField = document.getElementById("password");
        const passwordError = document.getElementById("password-error");
        const passwordValue = passwordField.value.trim();

        if (!passwordValue) {
            passwordError.innerText = "Password cannot be empty.";
            passwordError.style.display = "block";
            passwordField.classList.add("border-2");
            valid = false;
        } else if (passwordValue.length < 8) {
            passwordError.innerText = "Password must be at least 8 characters long.";
            passwordError.style.display = "block";
            passwordField.classList.add("border-2");
            valid = false;
        } else if (!/^[A-Z]/.test(passwordValue)) {
            passwordError.innerText = "Password's first letter must be uppercase.";
            passwordError.style.display = "block";
            passwordField.classList.add("border-2");
            valid = false;
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordValue)) {
            passwordError.innerText = "Password must include an uppercase letter, a lowercase letter, and a number.";
            passwordError.style.display = "block";
            passwordField.classList.add("border-2");
            valid = false;
        } else {
            passwordError.style.display = "none";
            passwordField.classList.remove("border-2");
        }
    }


    // Enrollement Validation

    function validateEnrollment() {
        const enrollField = document.getElementsByName("enrollmentDate")[0];
        const enrollError = document.getElementById("enrollmentDate-error");
        const enrollValue = new Date(enrollField.value);
        const today = new Date();

        if (!enrollField.value) {
            enrollError.innerText = "Please select a Enrollment Date";
            enrollError.style.display = "block";
            enrollError.classList.add("border-2");
            valid = false;
        } else if (enrollValue >= today) {
            enrollError.innerText = "Enrollment Date cannot be in the future";
            enrollError.style.display = "block";
            enrollField.classList.add("border-2");
            valid = false;
        } else {
            enrollError.style.display = "none";
            enrollField.classList.remove("border-2");
        }
    }

    // Phone No Validation

    function validatePhone() {
        const phoneField = document.getElementsByName("phone")[0];
        const phoneError = document.getElementById("phone-error");
        const phoneValue = phoneField.value.trim(); // Trim to remove extra spaces

        if (!phoneValue) {
            phoneError.innerText = "Phone No field cannot be empty.";
            phoneError.style.display = "block";
            phoneField.classList.add("border-2");
            valid = false;
        } else if (!/^\d{11}$/.test(phoneValue)) {  // Checks if it's exactly 11 digits
            phoneError.innerText = "Phone number must be exactly 11 digits.";
            phoneError.style.display = "block";
            phoneField.classList.add("border-2");
            valid = false;
        } else {
            phoneError.style.display = "none"; // Hide error message when valid
            phoneField.classList.remove("border-2");
        }
    }

    function validateEmail() {
        const emailField = document.getElementById('email');
        const emailError = document.getElementById('email-error');
        const emailValue = emailField.value.trim(); // Trim spaces

        // Regular expression for validating email format
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailValue) {
            emailError.innerText = "Email is required.";
            emailError.style.display = 'block';
            emailField.classList.add("border-2");
            valid = false;
        } else if (!emailPattern.test(emailValue)) {
            emailError.innerText = "Please enter a valid email address.";
            emailError.style.display = 'block';
            emailField.classList.add("border-2");
            valid = false;
        } else {
            emailError.style.display = 'none'; // Hide error if valid
            emailField.classList.remove("border-2");
        }
    }


    // Required field validations
    validateField("name", "name-error", value => value.trim() !== "", "Name is required");
    validateField("fname", "fname-error", value => value.trim() !== "", "Father's name is required");
    validateField("roll_number", "roll_number-error", value => value.trim() !== "", "Roll number is required");
    validateField("resgistrationNo", "resgistrationNo-error", value => value.trim() !== "", "Registration number is required");
    validateField("address", "address-error", value => value.trim() !== "", "Address is required");
    validateField("gender", "gender-error", value => value !== "", "Please select a gender");
    validateField("stdClass", "stdClass-error", value => value !== "", "Please select a class");

    // DOB validation
    validateDOB();

    validatePhone();

    // Password Validation
    validatePassword();

    validateEnrollment();

    validateEmail();



    if (!valid) {
        e.preventDefault();
    }
});

