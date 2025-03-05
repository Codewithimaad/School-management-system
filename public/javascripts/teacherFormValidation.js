document.addEventListener("DOMContentLoaded", function () {
    const teacherForm = document.getElementById("teacher-form");
    console.log(teacherForm);

    teacherForm.addEventListener("submit", async function (event) {
        event.preventDefault(); // Prevent default form submission


        // Clear previous error messages
        const errorFields = [
            "email", "password", "subject", "name", "description",
            "phone", "status", "salary", "image", "qualification", "gender"
        ];

        errorFields.forEach(field => {
            document.getElementById(`${field}-error`).textContent = "";
            document.getElementById(field).classList.remove("border-2", "border-red-600");
        });

        // Get form data
        const formData = new FormData(teacherForm);

        try {
            const response = await fetch("/dashboard/teacher/add", {
                method: "POST",
                body: formData, // Send FormData instead of JSON
            });

            const result = await response.json();

            if (result.success) {
                console.log(result.success);
            } else {
                console.log(result.errors);

            }

            if (!result.success) {
                // Display validation errors dynamically
                errorFields.forEach(field => {
                    if (result.errors[field]) {
                        document.getElementById(`${field}-error`).textContent = result.errors[field];
                        document.getElementById(`${field}-error`).style.display = 'block';
                        document.getElementById(field).classList.add("border-2", "border-red-600");
                    } else {
                        document.getElementById(field).classList.remove("border-2", "border-red-600");
                        document.getElementById(`${field}-error`).style.display = 'none';
                    }
                });
            } else {
                // Redirect to dashboard on success
                window.location.href = result.redirectUrl;
            }
        } catch (error) {
            console.error("Error:", error);
        }
    });
});