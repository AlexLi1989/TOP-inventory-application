function handleAdminConfirm(form, msg) {
  const isConfirmed = confirm(msg);
  if (!isConfirmed) {
    return false;
  }
  const password = prompt(
    "Please enter secret admin password to proceed(it is a EASY 8 numbers password ( ಠ‿<) )",
  );
  if (password === null || password.trim() === "") {
    alert("Password cannot be empty");
    return false;
  }
  const passwordInput = document.createElement("input");
  passwordInput.type = "hidden";
  passwordInput.name = "admin_password";
  passwordInput.value = password;
  form.appendChild(passwordInput);
  return true;
}
