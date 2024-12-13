document.getElementById('add-admin-form').addEventListener('submit', function (e) {
    let valid = true;

    // Validate Name
    const name = document.getElementById('name');
    const nameError = document.getElementById('name-error');
    if (!name.value.trim()) {
        nameError.classList.remove('hidden');
        name.classList.add('border-red-500');
        valid = false;
    } else {
        nameError.classList.add('hidden');
        name.classList.remove('border-red-500');
    }

    // Validate Email
    const email = document.getElementById('email');
    const emailError = document.getElementById('email-error');
    const emailPattern = /\S+@\S+\.\S+/; // Regex for email validation
    if (!email.value.trim() || !emailPattern.test(email.value)) {
        emailError.classList.remove('hidden');
        email.classList.add('border-red-500');
        valid = false;
    } else {
        emailError.classList.add('hidden');
        email.classList.remove('border-red-500');
    }

    // Validate Phone
    const phone = document.getElementById('phone');
    const phoneError = document.getElementById('phone-error');
    if (!phone.value.trim() || phone.value.length < 10) {
        phoneError.classList.remove('hidden');
        phone.classList.add('border-red-500');
        valid = false;
    } else {
        phoneError.classList.add('hidden');
        phone.classList.remove('border-red-500');
    }

    // Validate Password
    const password = document.getElementById('password');
    const passwordError = document.getElementById('password-error');
    const passwordStrength = document.getElementById('password-strength');
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/; // Password regex

    if (!password.value.trim()) {
        passwordError.classList.remove('hidden');
        password.classList.add('border-red-500');
        valid = false;
    } else if (!passwordPattern.test(password.value)) {
        passwordStrength.classList.remove('hidden');
        password.classList.add('border-red-500');
        valid = false;
    } else {
        passwordError.classList.add('hidden');
        passwordStrength.classList.add('hidden');
        password.classList.remove('border-red-500');
    }

    // Validate Description
    const description = document.getElementById('description');
    const descriptionError = document.getElementById('description-error');
    if (!description.value.trim()) {
        descriptionError.classList.remove('hidden');
        description.classList.add('border-red-500');
        valid = false;
    } else {
        descriptionError.classList.add('hidden');
        description.classList.remove('border-red-500');
    }

    // Validate Image Upload
    const image = document.getElementById('image');
    const imageError = document.getElementById('image-error');
    if (!image.files || !image.files.length) {
        imageError.classList.remove('hidden');
        image.classList.add('border-red-500');
        valid = false;
    } else {
        imageError.classList.add('hidden');
        image.classList.remove('border-red-500');
    }

    // Prevent form submission if validation fails
    if (!valid) {
        e.preventDefault();
    }
});
