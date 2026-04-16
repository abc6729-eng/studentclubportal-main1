document.getElementById("shippingForm").addEventListener("submit", function(e) {
  e.preventDefault();

  document.getElementById("nameError").innerText = "";
  document.getElementById("addressError").innerText = "";
  document.getElementById("carrierError").innerText = "";
  document.getElementById("methodError").innerText = "";

  let valid = true;

  let name = document.getElementById("name").value;
  let address = document.getElementById("address").value;
  let carrier = document.getElementById("carrier").value;
  let method = document.getElementById("method").value;

  if (!name) {
    document.getElementById("nameError").innerText = "Name is required";
    valid = false;
  }

  if (!address) {
    document.getElementById("addressError").innerText = "Address is required";
    valid = false;
  }

  if (!carrier) {
    document.getElementById("carrierError").innerText = "Select a carrier";
    valid = false;
  }

  if (!method) {
    document.getElementById("methodError").innerText = "Select a shipping method";
    valid = false;
  }

  if (valid) {
    const shippingData = {
      name,
      address,
      carrier,
      method
    };
    fetch("https://jsonplaceholder.typicode.com/posts", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(shippingData)
})
.then(response => response.json())
.then(data => {
  console.log("Success:", data);
  alert("Shipping info saved!");
  window.location.href = "billing.html";
})
.catch(error => {
  console.error("Error:", error);
});
  }
});