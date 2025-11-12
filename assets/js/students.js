document.addEventListener('DOMContentLoaded', async () => {
    const tableBody = document.getElementById('students-table-body');
    const searchInput = document.getElementById('search-input');
    if (!tableBody || !searchInput) return;

    const isArabic = document.documentElement.lang === 'ar';

    const translations = {
        en: { 
            view: "View", 
            noResults: "No students found.",
            "Computer Science": "Computer Science",
            "Mechanical Engineering": "Mechanical Engineering",
            "Physics": "Physics"
        },
        ar: { 
            view: "عرض", 
            noResults: "لم يتم العثور على طلاب.",
            "Computer Science": "علوم الحاسب",
            "Mechanical Engineering": "الهندسة الميكانيكية",
            "Physics": "الفيزياء"
        }
    };
    const t = translations[isArabic ? 'ar' : 'en'];

    const [students, departments, complaints] = await Promise.all([
        fetch('data/students.json').then(res => res.json()),
        fetch('data/departments.json').then(res => res.json()),
        fetch('data/complaints.json').then(res => res.json())
    ]);

    const studentData = students.map(student => {
        const department = departments.find(d => d.id === student.departmentId);
        const complaintCount = complaints.filter(c => c.studentId === student.id).length;
        return {
            ...student,
            departmentName: department ? (t[department.name] || department.name) : 'N/A', // Translate department name
            complaintCount
        };
    });

    const renderTable = (data) => {
        if (data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" class="text-center">${t.noResults}</td></tr>`;
            return;
        }
        tableBody.innerHTML = data.map(student => `
            <tr>
                <td>${student.id}</td>
                <td>${student.name}</td>
                <td>${student.departmentName}</td>
                <td>${student.complaintCount}</td>
                <td><a href="student/view${isArabic ? '-ar' : ''}.html?id=${student.id}" class="btn btn-sm btn-accent">${t.view}</a></td>
            </tr>
        `).join('');
    };

    renderTable(studentData);

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = studentData.filter(s => 
            s.name.toLowerCase().includes(term) || 
            s.id.toLowerCase().includes(term) ||
            s.departmentName.toLowerCase().includes(term)
        );
        renderTable(filtered);
    });
});