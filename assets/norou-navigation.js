(() => {
  "use strict";

  const navigationItems = [
    { label: "Home", href: "#home" },
    { label: "Work", href: "#work" },
    { label: "Services", href: "#services" },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" }
  ];
  const projectUrl = "https://wa.me/+97430189870";
  const instagramUrl = "https://www.instagram.com/norou.vfx";

  const svgIcon = (path) => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    const iconPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    iconPath.setAttribute("d", path);
    iconPath.setAttribute("fill", "currentColor");
    svg.append(iconPath);
    return svg;
  };

  const createLink = (label, href) => {
    const link = document.createElement("a");
    link.className = "norou-navigation__link";
    link.href = href;
    link.textContent = label;
    return link;
  };

  const createExternalLink = (label, href, iconPath) => {
    const link = document.createElement("a");
    link.className = "norou-navigation__social";
    link.href = href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", label);
    link.append(svgIcon(iconPath));
    return link;
  };

  const findSectionByHeading = (headingText) => {
    const heading = Array.from(document.querySelectorAll("h1,h2,h3")).find((element) => (
      element.textContent?.trim().includes(headingText)
    ));
    return heading?.closest("section") ?? null;
  };

  const assignAnchors = () => {
    const home = document.querySelector('[data-framer-name="Hero"]') ?? document.querySelector("main");
    const work = document.querySelector("#showreel") ?? document.querySelector('[data-framer-name="Section - Showreel"]');
    const services = document.querySelector('[data-framer-name="Section - Services"]') ?? findSectionByHeading("From Concept To Completion");
    const about = findSectionByHeading("About Me");
    const contact = document.querySelector("footer");

    if (home) home.id = "home";
    if (work) work.id = "work";
    if (services) services.id = "services";
    if (about) about.id = "about";
    if (contact) contact.id = "contact";
  };

  const createNavigation = () => {
    const navigation = document.createElement("nav");
    navigation.className = "norou-navigation";
    navigation.setAttribute("aria-label", "Primary navigation");

    const links = document.createElement("div");
    links.className = "norou-navigation__links";
    navigationItems.forEach((item) => links.append(createLink(item.label, item.href)));

    const cta = document.createElement("a");
    cta.className = "norou-navigation__cta";
    cta.href = projectUrl;
    cta.target = "_blank";
    cta.rel = "noopener noreferrer";
    cta.textContent = "Start a Project";

    navigation.append(links, cta);
    return navigation;
  };

  const hideOriginalNavigation = () => {
    document.querySelectorAll("a").forEach((link) => {
      if (link.closest(".norou-navigation")) return;
      const label = link.textContent?.trim();
      if (label === "Home" || label === "About") link.classList.add("norou-navigation__original-link");
    });
  };

  const addCopyright = () => {
    document.querySelectorAll("footer").forEach((footer) => {
      footer.querySelectorAll("a").forEach((link) => {
        const href = link.getAttribute("href");
        const label = href === instagramUrl ? "Follow on Instagram" : href === projectUrl ? "Start a Project" : null;
        if (!label) return;
        const text = link.querySelector("p") ?? link;
        text.textContent = label;
        link.setAttribute("aria-label", label);
      });

      if (!footer.querySelector(".norou-contact-socials")) {
        const socialLinks = document.createElement("div");
        socialLinks.className = "norou-contact-socials";
        socialLinks.setAttribute("aria-label", "Contact Norouvfx on social media");
        socialLinks.append(
          createExternalLink("Chat with Norouvfx on WhatsApp", projectUrl, "M17.5 14.4c-.3-.1-1.8-.9-2.1-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.4.2-.7.1-1.8-.9-3-1.7-4.2-3.9-.3-.5.3-.5.8-1.6.1-.2.1-.4 0-.7-.1-.1-.7-1.7-1-2.3-.3-.7-.6-.6-.8-.6h-.7c-.2 0-.7.1-1 .5-.3.3-1.3 1.3-1.3 3.2s1.3 3.7 1.5 4c.2.3 2.6 4 6.3 5.6.9.4 1.6.6 2.1.8.9.3 1.7.2 2.4.1.7-.1 1.8-.7 2.1-1.4.3-.7.3-1.3.2-1.4-.1-.2-.3-.3-.6-.4zM12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2zm0 18.2c-1.6 0-3.2-.4-4.6-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2z"),
          createExternalLink("Follow Norouvfx on Instagram", instagramUrl, "M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 0 1 12 7.5zm0 2A2.5 2.5 0 1 0 14.5 12 2.5 2.5 0 0 0 12 9.5zM17.8 6.2a1.2 1.2 0 1 1-1.2-1.2 1.2 1.2 0 0 1 1.2 1.2z")
        );
        footer.append(socialLinks);
      }
      if (footer.querySelector(".norou-copyright")) return;
      const copyright = document.createElement("p");
      copyright.className = "norou-copyright";
      copyright.textContent = "© 2026 Norouvfx. All rights reserved.";
      footer.append(copyright);
    });
  };

  const enhanceNavigation = () => {
    assignAnchors();
    hideOriginalNavigation();
    if (!document.querySelector(".norou-navigation")) document.body.append(createNavigation());
    addCopyright();
  };

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const link = target.closest(".norou-navigation__link");
    if (!(link instanceof HTMLAnchorElement)) return;
    const targetId = link.hash.slice(1);
    const section = document.getElementById(targetId);
    if (!section) return;
    event.preventDefault();
    event.stopPropagation();
    section.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    window.history.replaceState(null, "", link.hash);
  }, true);

  const observer = new MutationObserver(() => enhanceNavigation());
  const start = () => {
    enhanceNavigation();
    observer.observe(document.body, { childList: true, subtree: true });
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
