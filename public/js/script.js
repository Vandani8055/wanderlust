// =============================================================================
// FORM VALIDATION SCRIPT : BOOTSTAP
// =============================================================================
// Example starter JavaScript for disabling form submissions if there are invalid fields

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // Fetch all forms that we want to apply custom Bootstrap validation styles to
  // ---------------------------------------------------------------------------
  const forms = document.querySelectorAll('.needs-validation');

  // ---------------------------------------------------------------------------
  // Loop over each form and prevent submission if validation fails
  // ---------------------------------------------------------------------------
  Array.prototype.slice.call(forms)
    .forEach(function (form) {
      form.addEventListener('submit', function (event) {
        // If form is invalid, prevent submission and stop event propagation
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }

        // Always add Bootstrap's validation feedback class
        form.classList.add('was-validated');
      }, false);
    });

})();




// button disable script:

document.querySelectorAll('.needs-validation').forEach(form => {
    const btn = form.querySelector('.btn-success');
    
    // Initial check (in case fields are pre-filled)
    if (btn) btn.disabled = !form.checkValidity();

    // Attach listeners to all inputs/selects/textareas inside the form
    form.addEventListener('input', () => {
        if (btn) {
            const isValid = form.checkValidity();
            btn.disabled = !isValid;
            btn.classList.toggle('disabled', !isValid);
        }
    });
});




// <!-- CALCULATING GST  -->

  const toggle = document.getElementById("toggle-switch");

  toggle.addEventListener("change", () => {
    const priceItems = document.querySelectorAll(".price-text");

    priceItems.forEach((item) => {
      const base = Number(item.dataset.basePrice);
      const gst = Number(item.dataset.gstPrice);

      // DOM manipulation:
      const finalPrice = item.querySelector(".price-amount");
      const oldPrice = item.querySelector(".old-price");
      const gstBadge = item.querySelector(".gst-badge");

      if (toggle.checked) {
        // ON: Show price + GST
        finalPrice.innerHTML = `₹${gst.toLocaleString("en-IN")}`;
        oldPrice.style.display = "inline";
        gstBadge.style.display = "inline";

        oldPrice.style.textDecoration = "line-through";
        oldPrice.style.opacity = "0.6";
      } else {
        // OFF: Show base price
        finalPrice.innerHTML = `₹${base.toLocaleString("en-IN")}`;
        oldPrice.style.display = "none";
        gstBadge.style.display = "none";
      }
    });
  });









  // For wish listing : 


  
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".wishlist-btn").forEach(btn => {
    btn.addEventListener("click", async e => {
      e.preventDefault();

      const icon = btn.querySelector("i");
      const res = await fetch(`/wishlist/${btn.dataset.id}`, { method: "POST" });

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
