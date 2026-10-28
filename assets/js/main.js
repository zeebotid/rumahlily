/* Rumah Lily — interaksi halaman */
(function () {
  "use strict";
  document.documentElement.classList.add("js");

  var cfg = window.RUMAHLILY || {};
  var isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

  // WhatsApp: wa.me di HP, WhatsApp Web di desktop
  function waUrl(text) {
    var msg = encodeURIComponent(text || "");
    return isMobile
      ? "https://wa.me/" + cfg.whatsapp + "?text=" + msg
      : "https://web.whatsapp.com/send?phone=" + cfg.whatsapp + "&text=" + msg;
  }

  function linkOut(a, href) {
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener";
  }

  document.querySelectorAll("[data-wa]").forEach(function (a) {
    linkOut(a, waUrl(a.getAttribute("data-wa")));
  });
  document.querySelectorAll("[data-shopee]").forEach(function (a) {
    if (cfg.shopee) linkOut(a, cfg.shopee);
  });
  document.querySelectorAll("[data-wa-display]").forEach(function (el) {
    if (cfg.whatsappDisplay) el.textContent = cfg.whatsappDisplay;
  });
  document.querySelectorAll("[data-shopee-name]").forEach(function (el) {
    if (cfg.shopeeName) el.textContent = cfg.shopeeName;
  });

  // ---------- Navbar ----------
  var nav = document.getElementById("nav");
  var toggle = document.getElementById("navToggle");
  var links = document.getElementById("navLinks");

  function setMenu(open) {
    links.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Tutup menu" : "Buka menu");
  }
  toggle.addEventListener("click", function () {
    setMenu(!links.classList.contains("open"));
  });
  links.addEventListener("click", function (e) {
    if (e.target.closest("a")) setMenu(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setMenu(false);
  });

  function onScroll() {
    nav.classList.toggle("scrolled", window.scrollY > 10);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ---------- Marquee: gandakan isi agar berputar mulus ----------
  var track = document.querySelector(".marquee-track");
  if (track) track.innerHTML += track.innerHTML;

  // ---------- Muncul saat discroll ----------
  var reveals = document.querySelectorAll(".reveal");
  reveals.forEach(function (el) {
    var siblings = Array.prototype.filter.call(el.parentElement.children, function (c) {
      return c.classList.contains("reveal");
    });
    var d = Math.min(siblings.indexOf(el), 6) * 90;
    // jeda hanya untuk opacity & translate, efek hover tetap langsung
    el.style.transitionDelay = d + "ms, " + d + "ms, 0s, 0s, 0s, 0s";
  });

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  // ---------- Angka statistik ----------
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var counters = document.querySelectorAll("[data-count]");
  if (!reduce && "IntersectionObserver" in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        var end = parseInt(el.getAttribute("data-count"), 10);
        var t0 = null;
        function step(t) {
          if (!t0) t0 = t;
          var p = Math.min((t - t0) / 1200, 1);
          el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        co.unobserve(el);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
  }

  // ---------- Filter koleksi handcraft ----------
  var filters = document.querySelectorAll(".filter");
  var products = document.querySelectorAll(".product");
  filters.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var f = btn.getAttribute("data-filter");
      filters.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle("active", on);
        b.setAttribute("aria-selected", String(on));
      });
      products.forEach(function (p) {
        p.classList.toggle("hide", f !== "all" && p.getAttribute("data-cat") !== f);
      });
    });
  });

  // ---------- Detail produk ----------
  var lb = document.getElementById("lightbox");
  var lbImg = document.getElementById("lbImg");
  var lbName = document.getElementById("lbName");
  var lbPrice = document.getElementById("lbPrice");
  var lbDesc = document.getElementById("lbDesc");
  var lbWa = document.getElementById("lbWa");

  products.forEach(function (p) {
    p.addEventListener("click", function () {
      var name = p.getAttribute("data-name");
      var price = p.getAttribute("data-price");
      lbImg.src = p.getAttribute("data-img");
      lbImg.alt = name;
      lbName.textContent = name;
      lbPrice.textContent = price;
      lbDesc.textContent = p.getAttribute("data-desc");
      linkOut(lbWa, waUrl("Halo Rumah Lily, saya tertarik dengan " + name + " (" + price + "). Apakah masih tersedia?"));
      openDialog(lb);
    });
  });

  // ---------- Poster / katalog ukuran penuh ----------
  var pb = document.getElementById("posterBox");
  var pbImg = document.getElementById("posterImg");
  document.querySelectorAll("[data-poster]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      pbImg.src = btn.getAttribute("data-poster");
      pbImg.alt = btn.getAttribute("data-poster-alt") || "";
      openDialog(pb);
    });
  });

  function openDialog(d) {
    if (typeof d.showModal === "function") d.showModal();
    else d.setAttribute("open", "");
  }
  [lb, pb].forEach(function (d) {
    d.querySelector("[data-close]").addEventListener("click", function () { d.close(); });
    d.addEventListener("click", function (e) {
      if (e.target === d) d.close(); // klik di luar kotak
    });
  });

  // ---------- Form pesan → WhatsApp ----------
  var form = document.getElementById("orderForm");
  var err = document.getElementById("formError");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var nama = form.nama.value.trim();
    var pesan = form.pesan.value.trim();
    var layanan = form.querySelector("input[name=layanan]:checked").value;
    if (!nama || !pesan) {
      err.hidden = false;
      (nama ? form.pesan : form.nama).focus();
      return;
    }
    err.hidden = true;
    var text = "Halo Rumah Lily, saya " + nama + ".\n" +
      "Tentang: " + layanan + "\n\n" + pesan;
    window.open(waUrl(text), "_blank", "noopener");
  });

  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
