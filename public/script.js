document.documentElement.classList.add("js-ready");
const canvas = document.getElementById("bgCanvas");
const scrollProgressBar = document.getElementById("scrollProgressBar");
if (canvas) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    const geometry = new THREE.TorusKnotGeometry(10, 2.4, 180, 24);
    const material = new THREE.MeshBasicMaterial({
        color: 0x86ecff,
        wireframe: true
    });
    const torus = new THREE.Mesh(geometry, material);
    scene.add(torus);
    camera.position.z = 30;
    function animate() {
        requestAnimationFrame(animate);
        torus.rotation.x += 0.0028;
        torus.rotation.y += 0.0045;
        torus.rotation.z += 0.0012;
        renderer.render(scene, camera);
    }
    animate();
    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}
const sectionsToReveal = Array.from(document.querySelectorAll(".reveal-on-scroll"));
const internalLinks = Array.from(document.querySelectorAll('a[href^="#"]'));
function easeInOutCubic(value) {
    return value < 0.5
        ? 4 * value * value * value
        : 1 - Math.pow(-2 * value + 2, 3) / 2;
}
function getHeaderOffset() {
    const compactHeader = document.body.classList.contains("header-detached");
    return compactHeader ? 104 : 128;
}
function scrollToTarget(target) {
    const start = window.scrollY;
    const targetPosition = target.getBoundingClientRect().top + window.scrollY - getHeaderOffset();
    const distance = targetPosition - start;
    const duration = Math.min(1200, Math.max(650, Math.abs(distance) * 0.6));
    const startTime = window.performance.now();
    function frame(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeInOutCubic(progress);
        window.scrollTo(0, start + distance * eased);
        if (progress < 1) {
            window.requestAnimationFrame(frame);
        }
    }
    window.requestAnimationFrame(frame);
}
function updateHeaderState() {
    document.body.classList.toggle("header-detached", window.scrollY > 24);
}
function updateScrollProgress() {
    if (!scrollProgressBar)
        return;
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollableHeight <= 0 ? 0 : (window.scrollY / scrollableHeight) * 100;
    scrollProgressBar.style.width = `${Math.min(progress, 100)}%`;
}
updateHeaderState();
updateScrollProgress();
let headerFramePending = false;
window.addEventListener("scroll", () => {
    if (headerFramePending)
        return;
    headerFramePending = true;
    window.requestAnimationFrame(() => {
        updateHeaderState();
        updateScrollProgress();
        headerFramePending = false;
    });
}, { passive: true });
if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                sectionObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.16,
        rootMargin: "0px 0px -8% 0px"
    });
    sectionsToReveal.forEach(section => {
        sectionObserver.observe(section);
    });
}
else {
    sectionsToReveal.forEach(section => {
        section.classList.add("is-visible");
    });
}
internalLinks.forEach(link => {
    link.addEventListener("click", event => {
        const targetId = link.getAttribute("href");
        if (!targetId || targetId === "#")
            return;
        const target = document.querySelector(targetId);
        if (!target)
            return;
        event.preventDefault();
        scrollToTarget(target);
        window.history.replaceState(null, "", targetId);
    });
});
const container = document.getElementById("projectsContainer");
const filterButtons = Array.from(document.querySelectorAll(".filterBtn"));
const featuredProjects = [
    {
        name: "Cinematic Portfolio Experience",
        language: "typescript",
        description: "A high-impact portfolio landing page with smooth scrolling, animated hero sections, and layered glassmorphism panels.",
        outcome: "Turns a personal site into a stronger first impression for recruiters, clients, and collaborators.",
        tags: ["TypeScript", "Tailwind", "Motion"],
        href: "#contact",
        label: "Build Similar"
    },
    {
        name: "Interactive Product Landing Page",
        language: "javascript",
        description: "A marketing-focused landing page with section transitions, strong CTA placement, and lightweight visual effects.",
        outcome: "Built to keep visitors moving toward the offer instead of bouncing after the hero section.",
        tags: ["JavaScript", "UI Direction", "Landing Page"],
        href: "#contact",
        label: "Request This Style"
    },
    {
        name: "Contact Flow Backend",
        language: "typescript",
        description: "A contact form workflow powered by Express and mail delivery, designed to feel polished on the frontend and practical on the backend.",
        outcome: "Keeps lead capture simple, usable, and ready for deployment without overengineering.",
        tags: ["Node.js", "Express", "Email"],
        href: "#contact",
        label: "Discuss Backend"
    },
    {
        name: "Frontend Refresh System",
        language: "javascript",
        description: "A visual overhaul focused on typography, spacing, hover states, and section pacing instead of generic template styling.",
        outcome: "Makes an existing site feel more premium without requiring a full rebuild from scratch.",
        tags: ["JavaScript", "UI Polish", "Responsive"],
        href: "#contact",
        label: "Refresh My Site"
    },
    {
        name: "Developer Brand Homepage",
        language: "typescript",
        description: "A personal-brand homepage structured around trust, clarity, and premium presentation instead of raw technical feeds.",
        outcome: "Better communicates who you are, what you build, and why someone should contact you.",
        tags: ["TypeScript", "Branding", "Portfolio"],
        href: "#contact",
        label: "Create Homepage"
    },
    {
        name: "Service Showcase Microsite",
        language: "javascript",
        description: "A compact site architecture for freelancers or small agencies that need clear offers, proof points, and a working inquiry flow.",
        outcome: "Designed to convert interest into direct messages with less friction and cleaner positioning.",
        tags: ["JavaScript", "Services", "Conversion"],
        href: "#contact",
        label: "Start a Project"
    }
];
function setActiveFilter(lang) {
    filterButtons.forEach(button => {
        const isActive = button.dataset.lang === lang;
        button.classList.toggle("border-cyan/30", isActive);
        button.classList.toggle("bg-cyan/12", isActive);
        button.classList.toggle("text-cyan", isActive);
        button.classList.toggle("border-white/10", !isActive);
        button.classList.toggle("bg-white/5", !isActive);
        button.classList.toggle("text-white/72", !isActive);
        button.setAttribute("aria-pressed", String(isActive));
    });
}
function renderEmptyState(message, title = "No projects match this stack yet.", kicker = "Filtered showcase") {
    if (!container)
        return;
    container.innerHTML = `
    <article class="projects-empty glass-card rounded-[2rem] p-7 md:col-span-2 xl:col-span-3">
      <p class="font-mono text-xs uppercase tracking-[0.3em] text-cyan/75">${kicker}</p>
      <h3 class="mt-4 text-2xl font-semibold text-white">${title}</h3>
      <p class="mt-3 max-w-2xl text-sm leading-7 text-white/62">${message}</p>
      <a
        href="#contact"
        class="mt-6 inline-flex w-fit items-center justify-center rounded-full border border-cyan/30 bg-cyan/10 px-4 py-2 text-sm font-medium text-cyan transition hover:border-cyan/50 hover:bg-cyan/15"
      >
        Add Another Project
      </a>
    </article>
  `;
}
function renderProjects(lang) {
    if (!container)
        return;
    setActiveFilter(lang);
    container.innerHTML = "";
    const filteredProjects = featuredProjects.filter(project => lang === "all" || project.language === lang);
    if (filteredProjects.length === 0) {
        renderEmptyState(`No showcase cards matched the "${lang}" filter. Add more local projects or switch to another stack.`);
        return;
    }
    filteredProjects.forEach(project => {
        const language = project.language === "typescript" ? "TypeScript" : "JavaScript";
        const tags = project.tags.map(tag => `
      <span class="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/65">
        ${tag}
      </span>
    `).join("");
        const card = document.createElement("article");
        card.className = "project-card glass-card group rounded-[2rem] p-6 transition duration-300 hover:-translate-y-1 hover:border-white/15";
        card.innerHTML = `
      <div class="flex items-center justify-between gap-4">
        <span class="rounded-full border border-cyan/25 bg-cyan/10 px-3 py-1 font-mono text-[0.7rem] uppercase tracking-[0.22em] text-cyan">
          ${language}
        </span>
        <a
          href="${project.href}"
          class="text-sm font-medium text-white/58 transition hover:text-white"
        >
          ${project.label}
        </a>
      </div>
      <h3 class="mt-6 text-2xl font-semibold text-white">${project.name}</h3>
      <p class="mt-3 min-h-20 text-sm leading-7 text-white/62">${project.description}</p>
      <div class="mt-5 flex flex-wrap gap-2">
        ${tags}
      </div>
      <div class="mt-6 border-t border-white/8 pt-5">
        <p class="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-white/42">Outcome</p>
        <p class="mt-3 text-sm leading-7 text-white/58">${project.outcome}</p>
      </div>
    `;
        container.appendChild(card);
    });
}
filterButtons.forEach(button => {
    button.addEventListener("click", () => {
        const lang = button.dataset.lang;
        if (lang) {
            renderProjects(lang);
        }
    });
});
renderProjects("all");
const form = document.getElementById("contactForm");
function getContactEndpoints() {
    if (window.location.protocol === "file:") {
        return ["http://localhost:3001/contact"];
    }
    const isLocalHost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    return isLocalHost
        ? ["/api/contact", "http://localhost:3001/contact"]
        : ["/api/contact"];
}
if (form) {
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const button = form.querySelector("button");
        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const message = document.getElementById("message").value.trim();
        if (!name || !email || !message) {
            alert("Fill in all fields before sending the message.");
            return;
        }
        if (button) {
            button.disabled = true;
            button.textContent = "Sending...";
        }
        try {
            let lastError = null;
            let data = null;
            for (const endpoint of getContactEndpoints()) {
                try {
                    const res = await fetch(endpoint, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ name, email, message })
                    });
                    data = await res.json().catch(() => null);
                    if (!res.ok) {
                        throw new Error(data?.error || `Contact request failed with status ${res.status}`);
                    }
                    form.reset();
                    alert(data?.message || "Message sent!");
                    return;
                }
                catch (error) {
                    lastError = error instanceof Error
                        ? error
                        : new Error("The message could not be sent.");
                }
            }
            throw lastError ?? new Error("The message could not be sent.");
        }
        catch (error) {
            console.error(error);
            const messageText = error instanceof Error
                ? error.message
                : "The message could not be sent. Check whether the backend is running on port 3001.";
            alert(messageText);
        }
        finally {
            if (button) {
                button.disabled = false;
                button.textContent = "Send Message";
            }
        }
    });
}

renderer.setPixelRatio(
  Math.min(window.devicePixelRatio, 1.5)
)