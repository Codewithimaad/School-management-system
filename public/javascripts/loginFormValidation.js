document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("login-form");

    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault(); // Prevent default form submission

        // Clear previous error messages
        document.getElementById("email-error").textContent = "";
        document.getElementById("password-error").textContent = "";
        document.getElementById("role-error").textContent = "";

        // Get form data
        const formData = new FormData(loginForm);
        const data = {
            email: formData.get("email"),
            password: formData.get("password"),
            role: formData.get("role"),
        };

        try {
            const response = await fetch("/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!result.success) {
                // Display validation errors dynamically
                if (result.errors.email) {
                    document.getElementById("email-error").textContent = result.errors.email;
                    document.getElementById('email').classList.add('border-2', 'border-red-600');
                } else {
                    document.getElementById('email').classList.remove('border-2', 'border-red-600');

                }
                if (result.errors.password) {
                    document.getElementById("password-error").textContent = result.errors.password;
                    document.getElementById('password').classList.add('border-2', 'border-red-600');
                }
                else {
                    document.getElementById('password').classList.remove('border-2', 'border-red-600');

                }
                if (result.errors.role) {
                    document.getElementById("role-error").textContent = result.errors.role;
                    document.getElementById('role').classList.add('border-2', 'border-red-600');
                }
                else {
                    document.getElementById('role').classList.remove('border-2', 'border-red-600');

                }
            } else {
                // Redirect to dashboard on success
                window.location.href = result.redirectUrl;
            }
        } catch (error) {
            console.error("Error:", error);
        }
    });
});
