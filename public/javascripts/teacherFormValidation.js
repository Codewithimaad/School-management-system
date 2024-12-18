document.getElementById('teacher-form').addEventListener('submit', function (e) {
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

    // Validate Subject
    const subject = document.getElementById('subject');
    const subjectError = document.getElementById('subject-error');
    if (!subject.value) {
        subjectError.classList.remove('hidden');
        subject.classList.add('border-red-500');
        valid = false;
    } else {
        subjectError.classList.add('hidden');
        subject.classList.remove('border-red-500');
    }

    // Validate Qualification
    const qualification = document.getElementById('qualification');
    const qualificationError = document.getElementById('qualification-error');
    if (!qualification.value) {
        qualificationError.classList.remove('hidden');
        qualification.classList.add('border-red-500');
        valid = false;
    } else {
        qualificationError.classList.add('hidden');
        qualification.classList.remove('border-red-500');
    }

    // Validate Phone No
    const phone = document.getElementById('phone');
    const phoneError = document.getElementById('phone-error');
    if (!phone.value || phone.value.length < 10) {
        phoneError.classList.remove('hidden');
        phone.classList.add('border-red-500');
        valid = false;
    } else {
        phoneError.classList.add('hidden');
        phone.classList.remove('border-red-500');
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
        valid = false; // Fix: Prevent submission if password fails strength test
    } else {
        passwordError.classList.add('hidden');
        passwordStrength.classList.add('hidden');
        password.classList.remove('border-red-500');
    }

    // Validate Salary
    const salary = document.getElementById('salary');
    const salaryError = document.getElementById('salary-error');
    if (!salary.value) {
        salaryError.classList.remove('hidden');
        salary.classList.add('border-red-500');
        valid = false;
    } else {
        salaryError.classList.add('hidden');
        salary.classList.remove('border-red-500');
    }

    // Validate Description
    const description = document.getElementById('description');
    const descriptionError = document.getElementById('description-error');
    if (!description.value) {
        descriptionError.classList.remove('hidden');
        description.classList.add('border-red-500');
        valid = false;
    } else {
        descriptionError.classList.add('hidden');
        description.classList.remove('border-red-500');
    }

    // Validate Image
    const image = document.getElementById('image');
    const imageError = document.getElementById('image-error');
    if (!image.value) {
        imageError.classList.remove('hidden');
        image.classList.add('border-red-500');
        valid = false;
    } else {
        imageError.classList.add('hidden');
        image.classList.remove('border-red-500');
    }

    // If invalid, prevent form submission
    if (!valid) {
        e.preventDefault();
    }
});
