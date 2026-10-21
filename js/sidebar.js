
async function loadSidebar() {
  try {
    const response = await fetch("./sidebar.html");

    if (!response.ok) {
      throw new Error("Failed to load sidebar");
    }

    const sidebarHTML = await response.text();

    document.getElementById("sidebar-container").innerHTML =
      sidebarHTML;

  
    const currentPage = window.location.pathname.split("/").pop();


    const navLinks = document.querySelectorAll(".nav-link");

    navLinks.forEach(function (link) {
      const linkPage = link.getAttribute("href").split("/").pop();

    
      if (linkPage === currentPage) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });

  } catch (error) {
    console.error("Error loading sidebar:", error);
  }
}

loadSidebar();

