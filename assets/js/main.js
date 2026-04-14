(function () {
  "use strict";

  var menuToggle = document.getElementById("menu-toggle");
  var mobileNav = document.getElementById("mobile-nav");

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener("click", function () {
      var open = mobileNav.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(open));
    });
  }

  if ("IntersectionObserver" in window) {
    var revealEls = document.querySelectorAll(".reveal");
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("on");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  }

  var BASKET_KEY = "qbBasket";
  var PACKAGE_DATA = {
    name: "Premium BioTesting Package",
    price: 995,
    quantity: 1,
  };

  function getBasket() {
    try {
      var raw = localStorage.getItem(BASKET_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
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
    var basketName = document.getElementById("basket-name");
    var basketPrice = document.getElementById("basket-price");

    if (status) {
      status.className = "cart-pill " + (basket ? "full" : "empty");
      status.textContent = basket ? "Basket ready" : "Basket empty";
    }

    if (basketName) {
      basketName.textContent = basket ? basket.name : "No package selected";
    }

    if (basketPrice) {
      basketPrice.textContent = basket ? "GBP " + basket.price.toFixed(2) : "GBP 0.00";
    }

    if (section) {
      section.classList.toggle("is-hidden", !basket);
    }
  }

  var addButtons = document.querySelectorAll("[data-add-basket]");
  addButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      setBasket(PACKAGE_DATA);
      updateBasketUI();

      if (btn.getAttribute("data-redirect") === "book") {
        window.location.href = "book.html#booking-form-section";
      }
    });
  });

  var clearButton = document.getElementById("clear-basket");
  if (clearButton) {
    clearButton.addEventListener("click", function () {
      clearBasket();
      updateBasketUI();
    });
  }

  if (window.location.search.indexOf("basket=1") > -1) {
    setBasket(PACKAGE_DATA);
  }

  updateBasketUI();

  var bookingForm = document.getElementById("booking-form");
  var successBox = document.getElementById("booking-success");

  function markInvalid(el, invalid) {
    el.classList.toggle("invalid", invalid);
    var wrapper = el.closest(".field");
    if (wrapper) {
      wrapper.classList.toggle("has-error", invalid);
    }
  }

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
        if (invalid) {
          ok = false;
        }
      });

      if (!ok) {
        return;
      }

      bookingForm.reset();
      if (successBox) {
        successBox.classList.remove("is-hidden");
      }
    });
  }
})();