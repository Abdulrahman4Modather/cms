
document.addEventListener('DOMContentLoaded', () => {
    const pagePath = window.location.pathname.split('/').pop();
    
    // Adjust path for nested pages
    const pathPrefix = (window.location.pathname.includes('/student/') || window.location.pathname.includes('/employee/') || window.location.pathname.includes('/department/') || window.location.pathname.includes('/faculty/')) ? '../' : '';

    const headerContainer = document.getElementById('header-container');
    const sidebarContainer = document.getElementById('sidebar-container');
    
    if (headerContainer) {
        fetch(`${pathPrefix}includes/header.html`)
            .then(response => response.text())
            .then(data => {
                headerContainer.innerHTML = data;
            });
    }

    if (sidebarContainer) {
        fetch(`${pathPrefix}includes/sidebar.html`)
            .then(response => response.text())
            .then(data => {
                sidebarContainer.innerHTML = data;
                setActiveSidebarLink(pagePath);
            });
    }

    function setActiveSidebarLink(currentPage) {
        const navLinks = document.querySelectorAll('.sidebar .nav-link');
        navLinks.forEach(link => {
            const linkPage = link.getAttribute('href').split('/').pop();
            // Normalize current page to handle if user is on an -ar.html page
            const currentPageNormalized = currentPage.replace('-ar.html', '.html');
            if (linkPage === currentPageNormalized) {
                link.classList.add('active');
            }
        });
    }
});