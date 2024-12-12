document.getElementById('principal-form').addEventListener('submit', function (e) {
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
    const emailPattern = /\S+@\S+\.\S+/;
    if (!email.value.trim() || !emailPattern.test(email.value)) {
        emailError.classList.remove('hidden');
        email.classList.add('border-red-500');
        valid = false;
    } else {
        emailError.classList.add('hidden');
        email.classList.remove('border-red-500');
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

    // Validate Image
    const image = document.getElementById('image');
    const imageError = document.getElementById('image-error');
    if (!image.files.length) {
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
