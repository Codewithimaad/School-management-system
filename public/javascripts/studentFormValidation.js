document.getElementById('student-form').addEventListener('submit', function (e) {
    let valid = true;

    // Validate Name
    const name = document.getElementById('name');
    const nameError = document.getElementById('name-error');
    if (!name.value) {
        nameError.classList.remove('hidden');
        name.classList.add('border-red-500');
        valid = false;
    } else {
        nameError.classList.add('hidden');
        name.classList.remove('border-red-500');
    }

    // Validate Father's Name
    const fname = document.getElementById('fname');
    const fnameError = document.getElementById('fname-error');
    if (!fname.value) {
        fnameError.classList.remove('hidden');
        fname.classList.add('border-red-500');
        valid = false;
    } else {
        fnameError.classList.add('hidden');
        fname.classList.remove('border-red-500');
    }

    // Validate Roll Number
    const roll_number = document.getElementById('roll_number');
    const roll_numberError = document.getElementById('roll_number-error');
    if (!roll_number.value) {
        roll_numberError.classList.remove('hidden');
        roll_number.classList.add('border-red-500');
        valid = false;
    } else {
        roll_numberError.classList.add('hidden');
        roll_number.classList.remove('border-red-500');
    }

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
    const passwordStrength = document.getElementById('password-strength');
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/; // Regex for password validation
    if (!password.value) {
        passwordError.classList.remove('hidden');
        password.classList.add('border-red-500');
        valid = false;
    } else if (!passwordPattern.test(password.value)) {
        passwordStrength.classList.remove('hidden');
        password.classList.add('border-red-500');
        valid = false; // Fix: Set valid to false here
    } else {
        passwordError.classList.add('hidden');
        passwordStrength.classList.add('hidden');
        password.classList.remove('border-red-500');
    }

    // Validate Phone
    const phone = document.getElementById('phone');
    const phoneError = document.getElementById('phone-error');
    if (!phone.value) {
        phoneError.classList.remove('hidden');
        phone.classList.add('border-red-500');
        valid = false;
    } else {
        phoneError.classList.add('hidden');
        phone.classList.remove('border-red-500');
    }

    // Validate Date of Birth
    const dob = document.getElementById('dob');
    const dobError = document.getElementById('dob-error');
    if (!dob.value) {
        dobError.classList.remove('hidden');
        dob.classList.add('border-red-500');
        valid = false;
    } else {
        dobError.classList.add('hidden');
        dob.classList.remove('border-red-500');
    }

    // Validate Gender
    const gender = document.getElementById('gender');
    const genderError = document.getElementById('gender-error');
    if (gender.value === "Select Gender") {
        genderError.classList.remove('hidden');
        gender.classList.add('border-red-500');
        valid = false;
    } else {
        genderError.classList.add('hidden');
        gender.classList.remove('border-red-500');
    }

    // Validate Class
    const classItem = document.getElementById('class');
    const classError = document.getElementById('class-error');
    if (!classItem.value) {
        classError.classList.remove('hidden');
        classItem.classList.add('border-red-500');
        valid = false;
    } else {
        classError.classList.add('hidden');
        classItem.classList.remove('border-red-500');
    }

    // Validate Address
    const address = document.getElementById('address');
    const addressError = document.getElementById('address-error');
    if (!address.value) {
        addressError.classList.remove('hidden');
        address.classList.add('border-red-500');
        valid = false;
    } else {
        addressError.classList.add('hidden');
        address.classList.remove('border-red-500');
    }

    // If invalid, prevent form submission
    if (!valid) {
        e.preventDefault();
    }
});
