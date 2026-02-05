// Smooth scrolling for navigation
function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId)
  if (section) {
    section.scrollIntoView({
      behavior: "smooth",
      block: "start",
    })
  }
}

document.getElementById("resumeBtn").addEventListener("click", () => {
  const link = document.createElement("a");
  link.href = "/Rashi_Resume.pdf"; 
  link.download = "Rashi_Resume.pdf";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});


// Typewriter effect
function typeWriter(element, text, speed = 100, callback) {
  let i = 0
  element.innerHTML = ""

  function type() {
    if (i < text.length) {
      element.innerHTML += text.charAt(i)
      i++
      setTimeout(type, speed)
    } else if (callback) {
      // Call callback when typing is complete
      setTimeout(callback, 500)
    }
  }

  type()
}

function startTypewriterSequence() {
  const nameElement = document.getElementById("typewriter-name")
  const roleElement = document.getElementById("typewriter-role")

  if (nameElement && roleElement) {
    // First type "Rashi Bhojwani"
    typeWriter(nameElement, "Rashi Bhojwani", 120, () => {
      // Then type the role with animation
      typeWriter(roleElement, "Full-stack dev, focused on clean UI", 80)
    })
  }
}

// Initialize typewriter effect
document.addEventListener("DOMContentLoaded", () => {
  startTypewriterSequence()

  // Remove old typewriter initialization
  // const typewriterElement = document.querySelector(".typewriter")
  // if (typewriterElement) {
  //   const text = typewriterElement.getAttribute("data-text")
  //   typeWriter(typewriterElement, text, 100)
  // }
})


function animateNumber(element, target) {
  let current = 0
  const increment = target / 50
  const timer = setInterval(() => {
    current += increment
    if (current >= target) {
      current = target
      clearInterval(timer)
    }
    element.textContent = Math.floor(current)
  }, 40)
}


// Parallax effect for background elements
function handleParallax() {
  const scrolled = window.pageYOffset
  const shapes = document.querySelectorAll(".shape")
  const orbs = document.querySelectorAll(".orb")

  shapes.forEach((shape, index) => {
    const speed = 0.5 + index * 0.1
    shape.style.transform = `translateY(${scrolled * speed}px)`
  })

  orbs.forEach((orb, index) => {
    const speed = 0.3 + index * 0.1
    orb.style.transform = `translateY(${scrolled * speed}px)`
  })
}

// Add scroll event listener for parallax
window.addEventListener("scroll", handleParallax)

// Initialize animations when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // animateNumbers()
  // animateSkillRings()

  // Add smooth reveal animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1"
        entry.target.style.transform = "translateY(0)"
      }
    })
  }, observerOptions)

  // Observe all sections for reveal animation
  document.querySelectorAll("section").forEach((section) => {
    section.style.opacity = "0"
    section.style.transform = "translateY(30px)"
    section.style.transition = "opacity 0.6s ease, transform 0.6s ease"
    observer.observe(section)
  })

  // Navigation functionality
  const navbar = document.getElementById("navbar")
  const navToggle = document.getElementById("nav-toggle")
  const navMenu = document.getElementById("nav-menu")
  const navLinks = document.querySelectorAll(".nav-link")

  // Mobile menu toggle
  navToggle.addEventListener("click", () => {
    navToggle.classList.toggle("active")
    navMenu.classList.toggle("active")
  })

  // Close mobile menu when clicking on a link
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navToggle.classList.remove("active")
      navMenu.classList.remove("active")
    })
  })

  // Navbar scroll effect
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled")
    } else {
      navbar.classList.remove("scrolled")
    }
  })

  // Active link highlighting
  function updateActiveLink() {
    const sections = document.querySelectorAll("section")
    const scrollPos = window.scrollY + 100

    sections.forEach((section) => {
      const sectionTop = section.offsetTop
      const sectionHeight = section.offsetHeight
      const sectionId = section.getAttribute("id")

      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        navLinks.forEach((link) => {
          link.classList.remove("active")
          if (link.getAttribute("href") === `#${sectionId}`) {
            link.classList.add("active")
          }
        })
      }
    })
  }

  window.addEventListener("scroll", updateActiveLink)
  updateActiveLink() // Initial call
})



document.querySelectorAll('.skills-row').forEach(row => {
  row.addEventListener('mouseenter', () => {
    row.style.animationPlayState = 'paused';
  });

  row.addEventListener('mouseleave', () => {
    row.style.animationPlayState = 'running';
  });
});

// toggle-theme
const themeToggle = document.getElementById("theme-toggle");
const body = document.body;

// Load saved theme
if (localStorage.getItem("theme") === "light") {
  body.classList.add("light");
  themeToggle.textContent = "☀️";
}

themeToggle.addEventListener("click", () => {
  body.classList.toggle("light");

  if (body.classList.contains("light")) {
    themeToggle.textContent = "☀️";
    localStorage.setItem("theme", "light");
  } else {
    themeToggle.textContent = "🌙";
    localStorage.setItem("theme", "dark");
  }
});


const contactForm = document.getElementById("contactForm")

if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault()

    const name = document.getElementById("name").value.trim()
    const email = document.getElementById("email").value.trim()
    const message = document.getElementById("message").value.trim()
    const submitButton = contactForm.querySelector('button[type="submit"]')

    if (!name || !email || !message) {
      alert("Please fill in all fields.")
      return
    }

    if (submitButton) {
      submitButton.disabled = true
      submitButton.textContent = "Sending..."
    }

    try {
      const res = await fetch("/users/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, message }),
      })

      const data = await res.json().catch(() => null)

      if (res.ok && data && data.success) {
        contactForm.reset()
        alert("Message sent successfully!")
      } else {
        const errorMessage = data && data.error ? data.error : "Something went wrong"
        alert(errorMessage)
      }
    } catch (error) {
      alert("Unable to send message right now. Please try again later.")
    } finally {
      if (submitButton) {
        submitButton.disabled = false
        submitButton.textContent = "Send Message"
      }
    }
  })
}
