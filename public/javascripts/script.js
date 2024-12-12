 // Example function to handle deletion
 function deleteTeacher(teacherId) {
    if (confirm("Are you sure you want to delete this teacher?")) {
        // Implement delete logic here (e.g., make an API call)
        console.log("Deleted teacher with ID:", teacherId);
    }
}

// Search functionality
document.getElementById('search').addEventListener('input', function (e) {
    const searchQuery = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('#teacher-list tr');

    rows.forEach(row => {
        const nameCell = row.querySelector('td:nth-child(1)');
        const name = nameCell.textContent.toLowerCase();

        if (name.includes(searchQuery)) {
            row.style.display = ''; // Show row
        } else {
            row.style.display = 'none'; // Hide row
        }
    });
});


