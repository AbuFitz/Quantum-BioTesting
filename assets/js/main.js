(function () {
  "use strict";

  var BASKET_KEY = "qbBasket";
  var PACKAGE_DATA = {
    name: "Premium BioTesting Package",
    price: 995,
    quantity: 1
  };

  function closeMobileNav() {
    var nav = document.getElementById("mobile-nav");
    var btn = document.getElementById("menu-toggle");
    if (!nav || !btn) return;
    nav.classList.remove("open");
    btn.setAttribute("aria-expanded", "false");
  }

  (function mobileNav() {
    var menuToggle = document.getElementById("menu-toggle");
    var mobileNav = document.getElementById("mobile-nav");
    if (!menuToggle || !mobileNav) return;

    menuToggle.addEventListener("click", function () {
      var open = mobileNav.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(open));
    });

    mobileNav.querySelectorAll("a, button").forEach(function (item) {
      item.addEventListener("click", function () {
        closeMobileNav();
      });
    });
  })();

  (function revealAnimations() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length || !("IntersectionObserver" in window)) {
      items.forEach(function (item) {
        item.classList.add("revealed");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    items.forEach(function (item) {
      observer.observe(item);
    });
  })();

  function getBasket() {
    try {
      var raw = localStorage.getItem(BASKET_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function setBasket(data) {
    localStorage.setItem(BASKET_KEY, JSON.stringify(data));
  }

  function clearBasket() {
    localStorage.removeItem(BASKET_KEY);
  }

  function updateBasketUI() {
    var basket = getBasket();
    var status = document.getElementById("cart-status");
    var section = document.getElementById("booking-form-section");
    var name = document.getElementById("basket-name");
    var price = document.getElementById("basket-price");

    if (status) {
      status.className = "cart-pill " + (basket ? "full" : "empty");
      status.textContent = basket ? "Basket ready" : "Basket empty";
    }

    if (name) {
      name.textContent = basket ? basket.name : "No package selected";
    }

    if (price) {
      price.textContent = basket ? "GBP " + basket.price.toFixed(2) : "GBP 0.00";
    }

    if (section) {
      section.classList.toggle("is-hidden", !basket);
    }
  }

  function openModal(name) {
    var modal = document.getElementById("modal-" + name);
    if (!modal) return;
    document.body.classList.add("modal-open");
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
  }

  function closeModal(name) {
    var modal = document.getElementById("modal-" + name);
    if (!modal) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    if (!document.querySelector(".modal.open")) {
      document.body.classList.remove("modal-open");
    }
  }

  (function modalSystem() {
    document.querySelectorAll("[data-open-modal]").forEach(function (trigger) {
      trigger.addEventListener("click", function () {
        var name = trigger.getAttribute("data-open-modal");
        openModal(name);
      });
    });

    document.querySelectorAll("[data-close-modal]").forEach(function (trigger) {
      trigger.addEventListener("click", function () {
        var name = trigger.getAttribute("data-close-modal");
        closeModal(name);
      });
    });

    document.querySelectorAll(".modal").forEach(function (overlay) {
      overlay.addEventListener("click", function (event) {
        if (event.target === overlay) {
          overlay.classList.remove("open");
          overlay.setAttribute("aria-hidden", "true");
          if (!document.querySelector(".modal.open")) {
            document.body.classList.remove("modal-open");
          }
        }
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        document.querySelectorAll(".modal.open").forEach(function (open) {
          open.classList.remove("open");
          open.setAttribute("aria-hidden", "true");
        });
        document.body.classList.remove("modal-open");
        closeMobileNav();
      }
    });
  })();

  document.querySelectorAll("[data-add-basket]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      setBasket(PACKAGE_DATA);
      updateBasketUI();
    });
  });

  var clearButton = document.getElementById("clear-basket");
  if (clearButton) {
    clearButton.addEventListener("click", function () {
      clearBasket();
      updateBasketUI();
    });
  }

  function markInvalid(el, invalid) {
    el.classList.toggle("invalid", invalid);
    var wrapper = el.closest(".field");
    if (wrapper) {
      wrapper.classList.toggle("has-error", invalid);
    }
  }

  var bookingForm = document.getElementById("booking-form");
  var successBox = document.getElementById("booking-success");

  if (bookingForm) {
    var dateField = document.getElementById("appointment-date");
    if (dateField) {
      var tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      dateField.min = tomorrow.toISOString().split("T")[0];
    }

    bookingForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var ok = true;
      var required = bookingForm.querySelectorAll("[required]");

      required.forEach(function (field) {
        var empty = !String(field.value || "").trim();
        var invalid = field.type === "checkbox" ? !field.checked : empty;
        if (field.type === "email" && !empty) {
          invalid = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim());
        }
        markInvalid(field, invalid);
        if (invalid) ok = false;
      });

      if (!ok) return;

      bookingForm.reset();
      if (successBox) {
        successBox.classList.remove("is-hidden");
      }
    });
  }

  var params = new URLSearchParams(window.location.search);
  if (params.get("basket") === "1") {
    setBasket(PACKAGE_DATA);
  }

  var modalParam = params.get("modal");
  if (modalParam) {
    openModal(modalParam);
  }

  updateBasketUI();
})();
