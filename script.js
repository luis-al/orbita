(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var stage = document.getElementById("orbit-stage");
  var field = document.getElementById("orbit-field");
  var btn = document.getElementById("contact-btn");

  document.querySelector(".scroll-cue").addEventListener("click", function () {
    field.scrollIntoView({ behavior: "smooth" });
  });

  // ---- pixel-art logo bitmaps (8x8), estilo neon retro ----
  var LOGOS = [
    {
      name: "wordpress",
      color: "#2de2ff",
      grid: [
        [1,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,1],
        [1,0,1,0,0,1,0,1],
        [1,0,1,0,0,1,0,1],
        [1,0,1,1,1,1,0,1],
        [1,1,0,1,1,0,1,1],
        [1,1,0,0,0,0,1,1],
        [0,0,0,0,0,0,0,0]
      ]
    },
    {
      name: "woocommerce",
      color: "#a56bff",
      grid: [
        [0,0,1,1,1,1,0,0],
        [0,1,0,0,0,0,1,0],
        [0,1,0,0,0,0,1,0],
        [1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,1],
        [1,0,1,0,0,1,0,1],
        [1,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1]
      ]
    },
    {
      name: "chatgpt",
      color: "#5cffb1",
      grid: [
        [0,0,0,1,1,0,0,0],
        [0,0,1,1,1,1,0,0],
        [0,1,1,0,0,1,1,0],
        [1,1,0,0,0,0,1,1],
        [1,1,0,0,0,0,1,1],
        [0,1,1,0,0,1,1,0],
        [0,0,1,1,1,1,0,0],
        [0,0,0,1,1,0,0,0]
      ]
    },
    {
      name: "claude",
      color: "#ff8a3d",
      grid: [
        [0,0,0,1,1,0,0,0],
        [1,0,0,1,1,0,0,1],
        [0,1,0,1,1,0,1,0],
        [0,0,1,1,1,1,0,0],
        [0,0,1,1,1,1,0,0],
        [0,1,0,1,1,0,1,0],
        [1,0,0,1,1,0,0,1],
        [0,0,0,1,1,0,0,0]
      ]
    },
    {
      name: "gemini",
      color: "#2de2ff",
      grid: [
        [0,0,0,1,0,0,0,0],
        [0,0,1,1,1,0,0,0],
        [0,1,1,1,1,1,0,0],
        [1,1,1,1,1,1,1,0],
        [0,1,1,1,1,1,0,0],
        [0,0,1,1,1,0,0,0],
        [0,0,0,1,0,0,0,0],
        [0,0,0,0,0,0,0,0]
      ]
    },
    {
      name: "code",
      color: "#5cffb1",
      grid: [
        [0,0,1,0,0,1,0,0],
        [0,1,0,0,0,0,1,0],
        [1,0,0,1,1,0,0,1],
        [0,1,0,0,0,0,1,0],
        [0,1,0,0,0,0,1,0],
        [1,0,0,1,1,0,0,1],
        [0,1,0,0,0,0,1,0],
        [0,0,1,0,0,1,0,0]
      ]
    },
    {
      name: "ai-chip",
      color: "#ff2e93",
      grid: [
        [0,1,0,1,1,0,1,0],
        [1,1,1,1,1,1,1,1],
        [0,1,0,0,0,0,1,0],
        [1,1,0,1,1,0,1,1],
        [1,1,0,1,1,0,1,1],
        [0,1,0,0,0,0,1,0],
        [1,1,1,1,1,1,1,1],
        [0,1,0,1,1,0,1,0]
      ]
    }
  ];

  function buildLogoSVG(logo) {
    var svgNS = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 8 8");
    svg.setAttribute("shape-rendering", "crispEdges");
    logo.grid.forEach(function (row, y) {
      row.forEach(function (cell, x) {
        if (!cell) return;
        var rect = document.createElementNS(svgNS, "rect");
        rect.setAttribute("x", x);
        rect.setAttribute("y", y);
        rect.setAttribute("width", 1);
        rect.setAttribute("height", 1);
        rect.setAttribute("fill", logo.color);
        svg.appendChild(rect);
      });
    });
    return svg;
  }

  // ---- logos reales (marcas oficiales, sin fondo) para el remate final ----
  var REAL_LOGOS = [
    { name: "wordpress", src: "logos/wordpress.png", glow: "#2ea6d9" },
    { name: "woocommerce", src: "logos/woocommerce.png", glow: "#c9599b" },
    { name: "openai", src: "logos/openai.png", glow: "#5cffb1" },
    { name: "claude", src: "logos/anthropic.svg", glow: "#d97757" },
    { name: "gemini", src: "logos/gemini.png", glow: "#4f8cff" }
  ];

  var halo = document.getElementById("logo-halo");
  var haloItems = REAL_LOGOS.map(function (logo, i) {
    var wrap = document.createElement("div");
    wrap.className = "halo-logo";
    wrap.style.color = logo.glow;
    var img = document.createElement("img");
    img.src = logo.src;
    img.alt = logo.name;
    wrap.appendChild(img);
    halo.appendChild(wrap);
    return { el: wrap, stagger: i * 0.025 };
  });

  function rand(min, max) { return min + Math.random() * (max - min); }

  var particles = LOGOS.map(function (logo, i) {
    var el = document.createElement("div");
    el.className = "orbit-logo";
    el.style.color = logo.color;
    el.appendChild(buildLogoSVG(logo));
    stage.appendChild(el);

    var edge = i % 4; // reparte los puntos de entrada: arriba, derecha, abajo, izquierda
    var startX, startY;
    var dist = rand(700, 1100);
    if (edge === 0) { startX = rand(-1, 1) * 300; startY = -dist; }
    else if (edge === 1) { startX = dist; startY = rand(-1, 1) * 200; }
    else if (edge === 2) { startX = rand(-1, 1) * 300; startY = dist; }
    else { startX = -dist; startY = rand(-1, 1) * 200; }

    return {
      el: el,
      startX: startX,
      startY: startY,
      baseAngle: (i / LOGOS.length) * Math.PI * 2 + rand(-0.2, 0.2),
      ringRadius: rand(120, 190),
      spin: rand(0.9, 1.6) * (i % 2 === 0 ? 1 : -1),
      stagger: rand(0, 0.12)
    };
  });

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
  function easeInCubic(t) { return t * t * t; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  var liveApplied = false;

  function render(p) {
    particles.forEach(function (pt) {
      var local = clamp((p - pt.stagger) / (1 - pt.stagger), 0, 1);
      var t1 = clamp(local / 0.6, 0, 1);
      var t2 = clamp((local - 0.6) / 0.4, 0, 1);

      var angle = pt.baseAngle + local * pt.spin * Math.PI;
      var radius, opacity, scale;

      if (t2 <= 0) {
        var e1 = easeOutCubic(t1);
        radius = null;
        var x = lerp(pt.startX, Math.cos(angle) * pt.ringRadius, e1);
        var y = lerp(pt.startY, Math.sin(angle) * pt.ringRadius, e1);
        opacity = e1;
        scale = lerp(0.5, 1, e1);
        pt.el.style.transform =
          "translate(-50%,-50%) translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px) scale(" + scale.toFixed(2) + ") rotate(" + (angle * 40).toFixed(0) + "deg)";
        pt.el.style.opacity = opacity.toFixed(2);
      } else {
        var e2 = easeInCubic(t2);
        var r = lerp(pt.ringRadius, 0, e2);
        var x2 = Math.cos(angle) * r;
        var y2 = Math.sin(angle) * r;
        opacity = 1 - e2;
        scale = lerp(1, 0.2, e2);
        pt.el.style.transform =
          "translate(-50%,-50%) translate(" + x2.toFixed(1) + "px," + y2.toFixed(1) + "px) scale(" + scale.toFixed(2) + ") rotate(" + (angle * 40).toFixed(0) + "deg)";
        pt.el.style.opacity = opacity.toFixed(2);
      }
    });

    var bp = clamp((p - 0.55) / 0.3, 0, 1);
    var be = easeOutCubic(bp);
    btn.style.opacity = be.toFixed(2);
    btn.style.transform = "translate(-50%,-50%) scale(" + lerp(0.2, 1, be).toFixed(2) + ")";

    haloItems.forEach(function (h) {
      var ht = clamp((p - 0.72 - h.stagger) / (1 - 0.72 - h.stagger), 0, 1);
      var he = easeOutCubic(ht);
      h.el.style.opacity = (he * 0.95).toFixed(2);
      var blurPx = lerp(6, 0, he);
      h.el.style.filter = blurPx > 0.05
        ? "blur(" + blurPx.toFixed(1) + "px) drop-shadow(0 0 6px currentColor)"
        : "drop-shadow(0 0 6px currentColor)";
      h.el.style.transform = "translateY(" + lerp(22, 0, he).toFixed(1) + "px) scale(" + lerp(0.7, 1, he).toFixed(2) + ")";
    });

    var shouldBeLive = p > 0.82;
    if (shouldBeLive !== liveApplied) {
      btn.classList.toggle("is-live", shouldBeLive);
      liveApplied = shouldBeLive;
    }
  }

  if (reduceMotion) {
    particles.forEach(function (pt) { pt.el.style.display = "none"; });
    haloItems.forEach(function (h) {
      h.el.style.opacity = "0.95";
      h.el.style.filter = "drop-shadow(0 0 6px currentColor)";
      h.el.style.transform = "none";
    });
    btn.style.opacity = "1";
    btn.style.transform = "translate(-50%,-50%) scale(1)";
    btn.classList.add("is-live");
  } else {
    var ticking = false;

    function update() {
      var rect = field.getBoundingClientRect();
      var total = rect.height - window.innerHeight;
      var p = total > 0 ? clamp(-rect.top / total, 0, 1) : 0;
      render(p);
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
  }
})();
