
document.addEventListener('DOMContentLoaded', async () => {
    const isArabic = document.documentElement.lang === 'ar';

    const [complaints, departments] = await Promise.all([
        fetch('data/complaints.json').then(res => res.json()),
        fetch('data/departments.json').then(res => res.json())
    ]);

    const translations = {
        en: { 
            byDept: "Complaints by Department",
            monthlyResolved: "Resolved",
            monthlyEscalated: "Escalated",
            categoryAnalysis: "Complaint Category Analysis"
        },
        ar: {
            byDept: "الشكاوى حسب القسم",
            monthlyResolved: "تم حلها",
            monthlyEscalated: "تم تصعيدها",
            categoryAnalysis: "تحليل فئات الشكاوى"
        }
    };
    const t = translations[isArabic ? 'ar' : 'en'];

    // Complaints by Department Chart
    const deptCtx = document.getElementById('complaintsByDeptChart');
    if (deptCtx) {
        const deptData = departments.map(dept => {
            return {
                name: dept.name,
                count: complaints.filter(c => c.departmentId === dept.id).length
            };
        });
        new Chart(deptCtx, {
            type: 'bar',
            data: {
                labels: deptData.map(d => d.name),
                datasets: [{
                    label: t.byDept,
                    data: deptData.map(d => d.count),
                    backgroundColor: '#003366',
                }]
            }
        });
    }

    // Monthly Trends Chart
    const trendsCtx = document.getElementById('monthlyTrendsChart');
    if (trendsCtx) {
        new Chart(trendsCtx, {
            type: 'line',
            data: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: [
                    {
                        label: t.monthlyResolved,
                        data: [3, 4, 1, 2],
                        borderColor: '#28a745',
                        tension: 0.1
                    },
                    {
                        label: t.monthlyEscalated,
                        data: [1, 2, 2, 3],
                        borderColor: '#dc3545',
                        tension: 0.1
                    }
                ]
            }
        });
    }

    // Category Analysis Chart
    const categoryCtx = document.getElementById('categoryAnalysisChart');
    if (categoryCtx) {
         // Mock data for categories as it's not in the JSON
         const categories = isArabic 
            ? ['أكاديمي', 'إداري', 'مرافق', 'تقني']
            : ['Academic', 'Administrative', 'Facilities', 'Technical'];
        new Chart(categoryCtx, {
            type: 'radar',
            data: {
                labels: categories,
                datasets: [{
                    label: t.categoryAnalysis,
                    data: [8, 5, 9, 6],
                    fill: true,
                    backgroundColor: 'rgba(0, 51, 102, 0.2)',
                    borderColor: '#003366',
                    pointBackgroundColor: '#003366',
                }]
            }
        });
    }
});
