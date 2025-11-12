
document.addEventListener('DOMContentLoaded', async () => {
    const tableBody = document.getElementById('departments-table-body');
    if (!tableBody) return;

    // Modal and form elements
    const addDepartmentModalEl = document.getElementById('addDepartmentModal');
    const addDepartmentForm = document.getElementById('add-department-form');
    const departmentFacultySelect = document.getElementById('department-faculty');
    const departmentHeadSelect = document.getElementById('department-head');

    const [departments, faculties, employees, complaints] = await Promise.all([
        fetch('data/departments.json').then(res => res.json()),
        fetch('data/faculties.json').then(res => res.json()),
        fetch('data/employees.json').then(res => res.json()),
        fetch('data/complaints.json').then(res => res.json())
    ]);
    
    const addDepartmentModal = new bootstrap.Modal(addDepartmentModalEl);

    let departmentData = departments.map(dept => {
        const faculty = faculties.find(f => f.id === dept.facultyId);
        const head = employees.find(e => e.id === dept.headId);
        const complaintCount = complaints.filter(c => c.departmentId === dept.id).length;
        return {
            ...dept,
            facultyName: faculty ? faculty.name : 'N/A',
            headName: head ? head.name : 'N/A',
            complaintCount
        };
    });

    const renderTable = () => {
        if (departmentData.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" class="text-center">No departments found.</td></tr>`;
            return;
        }
        tableBody.innerHTML = departmentData.map(dept => `
            <tr>
                <td>${dept.id}</td>
                <td>${dept.name}</td>
                <td>${dept.facultyName}</td>
                <td>${dept.headName}</td>
                <td>${dept.complaintCount}</td>
                <td><a href="department/view.html?id=${dept.id}" class="btn btn-sm btn-accent">View</a></td>
            </tr>
        `).join('');
    };
    
    const populateModalDropdowns = () => {
        departmentFacultySelect.innerHTML = '<option value="">Select Faculty</option>';
        faculties.forEach(faculty => {
            departmentFacultySelect.innerHTML += `<option value="${faculty.id}">${faculty.name}</option>`;
        });

        departmentHeadSelect.innerHTML = '<option value="">Select Head</option>';
        const potentialHeads = employees.filter(e => e.role.toLowerCase().includes('head'));
        potentialHeads.forEach(head => {
            departmentHeadSelect.innerHTML += `<option value="${head.id}">${head.name}</option>`;
        });
    };

    renderTable();
    populateModalDropdowns();

    if (addDepartmentForm) {
        addDepartmentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('department-name').value;
            const facultyId = document.getElementById('department-faculty').value;
            const headId = document.getElementById('department-head').value;

            const faculty = faculties.find(f => f.id === facultyId);
            const head = employees.find(e => e.id === headId);

            const newDepartment = {
                id: `D${departments.length + 1}`,
                name,
                facultyId,
                headId
            };

            const newDepartmentRenderData = {
                ...newDepartment,
                facultyName: faculty ? faculty.name : 'N/A',
                headName: head ? head.name : 'N/A',
                complaintCount: 0
            };

            departments.push(newDepartment);
            departmentData.push(newDepartmentRenderData);
            renderTable();

            addDepartmentModal.hide();
            e.target.reset();
        });
    }
});