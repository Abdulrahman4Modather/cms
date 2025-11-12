
document.addEventListener('DOMContentLoaded', async () => {
    const facultiesTableBody = document.getElementById('faculties-table-body');
    const departmentsTableBody = document.getElementById('departments-table-body');
    if (!facultiesTableBody || !departmentsTableBody) return;

    // Modals and forms
    const addFacultyModal = new bootstrap.Modal(document.getElementById('addFacultyModal'));
    const addDepartmentModal = new bootstrap.Modal(document.getElementById('addDepartmentModal'));
    const addFacultyForm = document.getElementById('add-faculty-form');
    const addDepartmentForm = document.getElementById('add-department-form');
    const facultyDeanSelect = document.getElementById('faculty-dean');
    const departmentFacultySelect = document.getElementById('department-faculty');
    const departmentHeadSelect = document.getElementById('department-head');

    const [faculties, departments, employees, students, complaints] = await Promise.all([
        fetch('data/faculties.json').then(res => res.json()),
        fetch('data/departments.json').then(res => res.json()),
        fetch('data/employees.json').then(res => res.json()),
        fetch('data/students.json').then(res => res.json()),
        fetch('data/complaints.json').then(res => res.json())
    ]);

    let facultyData = faculties.map(faculty => {
        const dean = employees.find(e => e.id === faculty.deanId);
        const departmentCount = departments.filter(d => d.facultyId === faculty.id).length;
        const studentCount = students.filter(s => s.facultyId === faculty.id).length;
        return {
            ...faculty,
            deanName: dean ? dean.name : 'N/A',
            departmentCount,
            studentCount
        };
    });

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
    
    const renderFacultiesTable = () => {
        facultiesTableBody.innerHTML = facultyData.map(f => `
            <tr>
                <td>${f.id}</td>
                <td>${f.name}</td>
                <td>${f.deanName}</td>
                <td>${f.departmentCount}</td>
                <td>${f.studentCount}</td>
                <td><a href="faculty/view.html?id=${f.id}" class="btn btn-sm btn-accent">View</a></td>
            </tr>
        `).join('');
    };

    const renderDepartmentsTable = () => {
        departmentsTableBody.innerHTML = departmentData.map(dept => `
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
        // For Add Faculty Modal
        facultyDeanSelect.innerHTML = '<option value="">Select Dean</option>';
        const potentialDeans = employees.filter(e => e.role.toLowerCase().includes('dean'));
        potentialDeans.forEach(dean => {
            facultyDeanSelect.innerHTML += `<option value="${dean.id}">${dean.name}</option>`;
        });

        // For Add Department Modal
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

    renderFacultiesTable();
    renderDepartmentsTable();
    populateModalDropdowns();

    if (addFacultyForm) {
        addFacultyForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('faculty-name').value;
            const deanId = document.getElementById('faculty-dean').value;
            const dean = employees.find(emp => emp.id === deanId);

            const newFaculty = {
                id: `F${faculties.length + 1}`,
                name,
                deanId
            };
            
            const newFacultyRenderData = {
                ...newFaculty,
                deanName: dean ? dean.name : 'N/A',
                departmentCount: 0,
                studentCount: 0
            };

            faculties.push(newFaculty);
            facultyData.push(newFacultyRenderData);
            renderFacultiesTable();
            // also update department modal dropdown
            departmentFacultySelect.innerHTML += `<option value="${newFaculty.id}">${newFaculty.name}</option>`;
            addFacultyModal.hide();
            e.target.reset();
        });
    }

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
            renderDepartmentsTable();

            // Update counts in faculty table
            const facultyToUpdate = facultyData.find(f => f.id === facultyId);
            if(facultyToUpdate) {
                facultyToUpdate.departmentCount++;
                renderFacultiesTable();
            }

            addDepartmentModal.hide();
            e.target.reset();
        });
    }
});