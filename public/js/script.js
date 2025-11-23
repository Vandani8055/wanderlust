// =============================================================================
// FORM VALIDATION SCRIPT : BOOTSTRAP (CORRECTED VERSION)
// =============================================================================
// ✅ FIXED: Removed syntax errors & invalid <script> tag
// ✅ FIXED: Improved button enable/disable logic
// ✅ FIXED: Eye toggle script now valid JS

(function () {
  "use strict";

  const forms = document.querySelectorAll(".needs-validation");

  Array.prototype.slice.call(forms).forEach(function (form) {
    form.addEventListener(
      "submit",
      function (event) {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }
        form.classList.add("was-validated");
      },
      false
    );
  });
})();

// =============================================================================
// BUTTON DISABLE / ENABLE SCRIPT (LIVE VALIDATION)
// =============================================================================

document.querySelectorAll(".needs-validation").forEach(form => {
  const btn = form.querySelector(".btn-success");

  form.addEventListener("input", () => {
    const pass = form.querySelector("#password");
    const confirm = form.querySelector("#confirmPassword");

    let valid = form.checkValidity();

    if (confirm) {
      confirm.setCustomValidity(
        pass.value === confirm.value ? "" : "Passwords do not match"
      );
      valid = valid && pass.value === confirm.value;
    }

    btn.disabled = !valid;
  });
});





// =============================================================================
// GST PRICE TOGGLE SCRIPT
// =============================================================================

const toggle = document.getElementById("toggle-switch");

if (toggle) {
  toggle.addEventListener("change", () => {
    const priceItems = document.querySelectorAll(".price-text");

    priceItems.forEach((item) => {
      const base = Number(item.dataset.basePrice);
      const gst = Number(item.dataset.gstPrice);

      const finalPrice = item.querySelector(".price-amount");
      const oldPrice = item.querySelector(".old-price");
      const gstBadge = item.querySelector(".gst-badge");

      if (toggle.checked) {
        finalPrice.innerHTML = `₹${gst.toLocaleString("en-IN")}`;
        oldPrice.style.display = "inline";
        gstBadge.style.display = "inline";
        oldPrice.style.textDecoration = "line-through";
        oldPrice.style.opacity = "0.6";
      } else {
        finalPrice.innerHTML = `₹${base.toLocaleString("en-IN")}`;
        oldPrice.style.display = "none";
        gstBadge.style.display = "none";
      }
    });
  });
}

// =============================================================================
// WISHLIST FUNCTIONALITY
// =============================================================================

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".wishlist-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();

      const icon = btn.querySelector("i");
      const res = await fetch(`/wishlist/${btn.dataset.id}`, {
        method: "POST",
      });

      if (res.status === 401) return alert("Please login first");

      icon.classList.toggle("fa-solid");
      icon.classList.toggle("fa-regular");
      icon.classList.toggle("text-danger");
    });
  });
});

function toggleWishlist(btn) {
  const icon = btn.querySelector("i");
  btn.classList.toggle("mylist-active");
  icon.classList.toggle("fa-solid");
  icon.classList.toggle("fa-regular");
}

// =============================================================================
// 👁️ PASSWORD EYE TOGGLE (COMPATIBLE WITH LIVE CHECK)
// =============================================================================

document.querySelectorAll(".toggle-password").forEach((icon) => {
  // Set initial icon state to "eye-slash" (closed)
  icon.classList.remove("fa-eye");
  icon.classList.add("fa-eye-slash");

  icon.addEventListener("click", () => {
    const input = icon.previousElementSibling;
    if (!input) return;

    // Toggle input type
    input.type = input.type === "password" ? "text" : "password";

    // Toggle icon between open and closed
    icon.classList.toggle("fa-eye");
    icon.classList.toggle("fa-eye-slash");
  });
});

