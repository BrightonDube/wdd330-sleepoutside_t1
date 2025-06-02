document
.getElementById("signupForm")
.addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = new FormData(this);
    const user = {
    name: formData.get("name"),
    address: formData.get("address"),
    email: formData.get("email"),
    };

    // Handle avatar upload (if selected)
    if (formData.get("avatar").size > 0) {
    const avatarFile = formData.get("avatar");
    const reader = new FileReader();

    reader.onload = function (event) {
        user.avatar = event.target.result; // Convert image to Base64
        sendUserData(user);
    };

    reader.readAsDataURL(avatarFile);
    } else {
    sendUserData(user);
    }
});

async function sendUserData(user) {
try {
    const response = await fetch("/users", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
    });

    if (response.ok) {
    alert("Registration successful!");
      window.location.href = "/login.html"; // Redirect to login page
    } else {
    alert("Error registering. Please try again.");
    }
} catch (error) {
        console.error("Registration Error:", error);
    alert("Network error. Please try again later.");
}
}

// listener to handle the "Sign Up" button click
document.getElementById("register-btn").addEventListener("click", () => {
window.location.href = "/register.html";
});

document.getElementById("close-btn").addEventListener("click", () => {
document.getElementById("cta-banner").style.display = "none";
});

