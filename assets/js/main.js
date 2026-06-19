/* Muhjah Cafe — interactions (vanilla, guarded) */
(function () {
  "use strict";

  /* ---------- Full-screen mobile menu ---------- */
  var burger = document.getElementById("burger");
  var menu = document.getElementById("mobileMenu");
  var menuClose = document.getElementById("menuClose");

  function openMenu() {
    if (!menu) return;
    menu.hidden = false;
    requestAnimationFrame(function () { menu.classList.add("open"); });
    if (burger) burger.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    if (menuClose) menuClose.focus();
  }
  function closeMenu() {
    if (!menu) return;
    menu.classList.remove("open");
    if (burger) burger.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    setTimeout(function () { menu.hidden = true; }, 300);
    if (burger) burger.focus();
  }
  if (burger) burger.addEventListener("click", openMenu);
  if (menuClose) menuClose.addEventListener("click", closeMenu);
  if (menu) {
    menu.querySelectorAll(".mobile-nav a, .menu-wa").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
  }

  /* ---------- Lightbox ---------- */
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightboxImg");
  var lightboxClose = document.getElementById("lightboxClose");

  function openLightbox(src, alt) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    lightboxImg.alt = alt || "صورة من مهجة";
    lightbox.hidden = false;
    requestAnimationFrame(function () { lightbox.classList.add("open"); });
    document.body.style.overflow = "hidden";
    if (lightboxClose) lightboxClose.focus();
  }
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("open");
    document.body.style.overflow = "";
    setTimeout(function () { lightbox.hidden = true; if (lightboxImg) lightboxImg.src = ""; }, 250);
  }
  document.querySelectorAll(".g-item").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var img = btn.querySelector("img");
      openLightbox(btn.getAttribute("data-full"), img ? img.alt : "");
    });
  });
  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
  if (lightbox) lightbox.addEventListener("click", function (e) { if (e.target === lightbox) closeLightbox(); });

  /* ---------- Escape closes overlays ---------- */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (menu && !menu.hidden) closeMenu();
      if (lightbox && !lightbox.hidden) closeLightbox();
    }
  });

  /* ---------- Toast ---------- */
  var toast = document.getElementById("toast");
  var toastTimer;
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.hidden = false;
    requestAnimationFrame(function () { toast.classList.add("show"); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove("show");
      setTimeout(function () { toast.hidden = true; }, 300);
    }, 4000);
  }

  /* ---------- Order form -> WhatsApp + localStorage ---------- */
  var form = document.getElementById("orderForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var fields = ["name", "phone", "item"];
      var valid = true;
      fields.forEach(function (id) {
        var input = document.getElementById(id);
        var wrap = input.closest(".field");
        var err = form.querySelector('.error[data-for="' + id + '"]');
        var val = (input.value || "").trim();
        var msg = "";
        if (!val) msg = "هذا الحقل مطلوب";
        else if (id === "phone" && !/^0?5\d{8}$/.test(val.replace(/\s/g, "")))
          msg = "أدخل رقم جوال سعودي صحيح";
        if (msg) { valid = false; if (wrap) wrap.classList.add("invalid"); if (err) err.textContent = msg; }
        else { if (wrap) wrap.classList.remove("invalid"); if (err) err.textContent = ""; }
      });
      if (!valid) {
        var firstBad = form.querySelector(".field.invalid input, .field.invalid select");
        if (firstBad) firstBad.focus();
        return;
      }

      var data = {
        name: document.getElementById("name").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        item: document.getElementById("item").value,
        time: document.getElementById("time").value.trim(),
        notes: document.getElementById("notes").value.trim(),
        at: new Date().toISOString()
      };

      // demo persistence
      try {
        var prev = JSON.parse(localStorage.getItem("muhjah_orders") || "[]");
        prev.push(data);
        localStorage.setItem("muhjah_orders", JSON.stringify(prev));
      } catch (err) { /* storage unavailable — proceed */ }

      var lines = [
        "السلام عليكم، أرغب بطلب من مهجة:",
        "الاسم: " + data.name,
        "الجوال: " + data.phone,
        "الطلب: " + data.item
      ];
      if (data.time) lines.push("وقت الاستلام: " + data.time);
      if (data.notes) lines.push("ملاحظات: " + data.notes);
      var url = "https://wa.me/966564689536?text=" + encodeURIComponent(lines.join("\n"));

      showToast("تم تجهيز طلبك، جارٍ فتح واتساب…");
      form.reset();
      setTimeout(function () { window.open(url, "_blank", "noopener"); }, 700);
    });
  }

  /* ---------- Scroll reveal (IntersectionObserver + fallback) ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }
  // safety: nothing stays hidden
  setTimeout(function () { reveals.forEach(function (el) { el.classList.add("in"); }); }, 1500);

  /* ---------- Header CTA active highlight on scroll ---------- */
})();
