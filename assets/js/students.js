
document.addEventListener('DOMContentLoaded', async () => {
    const tableBody = document.getElementById('students-table-body');
    const searchInput = document.getElementById('search-input');
    const addStudentForm = document.getElementById('add-student-form');
    const studentDepartmentSelect = document.getElementById('student-department');
    const addStudentModalEl = document.getElementById('addStudentModal');
    
    if (!tableBody || !searchInput) return;

    const addStudentModal = new bootstrap.Modal(addStudentModalEl);

    const [students, departments, complaints, faculties] = await Promise.all([
        fetch('data/students.json').then(res => res.json()),
        fetch('data/departments.json').then(res => res.json()),
        fetch('data/complaints.json').then(res => res.json()),
        fetch('data/faculties.json').then(res => res.json())
    ]);

    let studentData = students.map(student => {
        const department = departments.find(d => d.id === student.departmentId);
        const complaintCount = complaints.filter(c => c.studentId === student.id).length;
        return {
            ...student,
            departmentName: department ? department.name : 'N/A',
            complaintCount
        };
    });

    const renderTable = (data) => {
        if (data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" class="text-center">No students found.</td></tr>`;
            return;
        }
        tableBody.innerHTML = data.map(student => `
            <tr>
                <td>${student.id}</td>
                <td>${student.name}</td>
                <td>${student.departmentName}</td>
                <td>${student.complaintCount}</td>
                <td><a href="student/view.html?id=${student.id}" class="btn btn-sm btn-accent">View</a></td>
            </tr>
        `).join('');
    };

    const populateDepartmentOptions = () => {
        studentDepartmentSelect.innerHTML = '<option value="">Select Department</option>';
        departments.forEach(dept => {
            studentDepartmentSelect.innerHTML += `<option value="${dept.id}">${dept.name}</option>`;
        });
    };

    renderTable(studentData);
    populateDepartmentOptions();

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = studentData.filter(s => 
            s.name.toLowerCase().includes(term) || 
            s.id.toLowerCase().includes(term) ||
            s.departmentName.toLowerCase().includes(term)
        );
        renderTable(filtered);
    });

    if (addStudentForm) {
        addStudentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('student-name').value;
            const email = document.getElementById('student-email').value;
            const departmentId = document.getElementById('student-department').value;
            const department = departments.find(d => d.id === departmentId);
            const faculty = department ? faculties.find(f => f.id === department.facultyId) : null;
            
            const newStudentId = `S${1001 + students.length}`;
            const newStudent = {
                id: newStudentId,
                name,
                email,
                departmentId,
                facultyId: faculty ? faculty.id : null,
                avatar: `https://i.pravatar.cc/150?u=${newStudentId}`,
                departmentName: department ? department.name : 'N/A',
                complaintCount: 0
            };

            // This simulates saving. In a real app, this would be a POST request.
            students.push(newStudent); // add to original array for ID generation consistency
            studentData.push(newStudent); // add to mapped array for rendering

            renderTable(studentData);
            addStudentModal.hide();
            e.target.reset();
        });
    }
});