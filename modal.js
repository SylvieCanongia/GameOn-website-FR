// DOM Elements
const myTopNav = document.getElementById("myTopNav");
const modalbg = document.querySelector(".bground");
const modalBtn = document.querySelectorAll(".modal-btn");
const formData = document.querySelectorAll(".formData");
const closeModalCrossElement = document.querySelector(".close");
// get the form element
const forms = document.querySelectorAll("form[data-form]");
const formElement = document.querySelector("form[data-form]");
const modalBodyElement = document.querySelector(".modal-body");

// Managing of the errors
let error;
let errors;

myTopNav.addEventListener("click", editNav);

function editNav() {
  myTopNav.classList.toggle("responsive");
}

// ==============================================
// === Modal subscription opening and closing ===
// ==============================================

// launch modal event
modalBtn.forEach((btn) => btn.addEventListener("click", launchModal));

/**
 * Launch modal form
 */
function launchModal() {
  // display the form content in case
  // it is not the first time the button is clicked
  formElement.style.display = "block";
  modalbg.style.display = "block";
}

// === Close the modal by click on the cross ===

/**
 * Close the modal
 */
const closeModal = () => {
  // Removes the error messages
  formData.forEach(formD => {
    formD.setAttribute("data-error-visible", "false");
    formD.setAttribute("data-error", "");
  });
  error = "";
  // Close the modal
  modalbg.style.display = "none";
}

// listen the event click on the cross
closeModalCrossElement.addEventListener("click", closeModal);

// =======================
// === Form validation ===
// =======================

// Check if form exist
if (forms.length > 0) {
  // Loop on all elements
  for (let form of forms) {
    // Get all inputs that have to be validated (have data-validate attribute)
    const inputs = form.querySelectorAll("[data-validate]");

    // Listen the form submit event and submit the form
    // bind allow to pass all inputs as argument
    form.addEventListener("submit", submitForm.bind(form, inputs));
  }
}

// ======================
// === VALIDATE INPUT ===
// ======================

/**
 * Validate each input of the form
 * @param {HTMLElement} input 
 * @returns If there are errors, displays a message under the concerned fields,
 * else return no error
 */
function validateInput(input) {

  // get the value and formData element for assigning error message
  // (via CSS pseudo-elements)
  const value = input.value;
  const formDataElement = input.closest("[data-formData]");
  // Error variable for displaying error messages and assign null by default
  error = null;

  // TEXT FIELDS -> MIN LENGTH = 2
  // Check if : -> if the input is not radio or checkbox
  // -> and input has data-required attribute
  //  -> and the value is empty and the value has a required minlength
  // -> the input value is < to the minlength
  if (
    input.type !== "radio" &&
    input.type !== "checkbox" &&
    input.dataset.required !== undefined &&
    input.dataset.minlength !== undefined &&
    value.length < input.dataset.minlength
  ) {
    // Set an error message to the data-error attribute for display to the user
    formDataElement.setAttribute(
      "data-error",
      `Ce champ est requis. Veuillez entrer au moins ${input.dataset.minlength} caractères.`
    );
    error = formDataElement.dataset.error;
  }

  // E MAIL FIELD
  // Check if input has data-email attribute and if email is not valid with validateEmail function
  if (input.dataset.email !== undefined && !validateEmail(value)) {
    formDataElement.setAttribute(
      "data-error",
      "Ce champ est requis. Veuillez entrer une adresse email valide."
    );
    error = formDataElement.dataset.error;
  }

  /**
   * Validate email using a regex
   * @param {String} email 
   * @returns Boolean
   */
  function validateEmail(email) {
    const regexMail =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regexMail.test(String(email).toLowerCase());
  }

  // DATE OF BIRTH - AGE >= 18
  // Check if input has data-date and data-required attributes and if the value is empty
  if (
    input.dataset.date !== undefined &&
    input.dataset.required !== undefined &&
    value === ""
  ) {
    formDataElement.setAttribute(
      "data-error",
      "Ce champ est requis. Veuillez entrer une date."
    );
    error = formDataElement.dataset.error;
  } else if (
    input.dataset.date !== undefined &&
    input.dataset.required !== undefined &&
    value !== ""
  ) {
    // if the value is not empty, check if age < 18
    const age = validateAge(value);
    if (age < 18) {
      formDataElement.setAttribute(
        "data-error",
        "Date incorrecte. Vous devez avoir au moins 18 ans pour continuer."
      );
      error = formDataElement.dataset.error;
    }
  }
 
  /**
   * Check if age > 18
   * @param {Date} dateOfBirth 
   * @returns Function
   */
  function validateAge(dateOfBirth) {
    // [1] new Date(dateString)
    const birthday = new Date(dateOfBirth); // transform birthday in date-object

    /**
     * Calculate age from a date (date object)
     * @param {Date} birthday 
     * @returns Age of the user
     */
    function calculateAge(birthday) {
      // diff = number of ms since 1970 (to now) - number of ms since 1970 (to birthday)
      // diff = age in ms
      const diff = Date.now() - birthday.getTime();

      // [2] new Date(value); -> value = date based on ms since 1970
      // = do as if the person was born in 1970
      // so calculate the date of birth based on the age in ms with 1970 as start ref
      const ageDate = new Date(diff);

      // Give the year based on the complete date of birth (ageDate)
      const yearOfBirth = ageDate.getUTCFullYear();

      // age = year of birth (calculated from 1970) - 1970. Ex : age = 1989 - 1970 = 19
      // return absolute value
      let age;
      return (age = Math.abs(yearOfBirth - 1970));
    }
    return calculateAge(birthday);
  }

  // NUMBER OF TOURNAMENTS (0 <= N <= 99)
  // Check if input has data-number and data-required attributes and if the value is empty
  if (
    input.dataset.number !== undefined &&
    input.dataset.required !== undefined &&
    value === ""
  ) {
    formDataElement.setAttribute(
      "data-error",
      "Ce champ est requis. Veuillez entrer un nombre entre 0 et 99."
    );
    error = formDataElement.dataset.error;
  }

  // RADIO BUTTONS - REQUIRED 1 CHECKED
  // Check if input is radio
  if (input.type === "radio") {
    // Get all radio inputs in the group
    const radios = formDataElement.querySelectorAll('input[type="radio"]');
    let isChecked = false;

    // Loop through radios and check if any radio is checked and if is checked,
    // set isChecked to true
    radios.forEach((radio) => {
      if (radio.checked) {
        isChecked = true;
      }
    });

    if (!isChecked) {
      formDataElement.setAttribute(
        "data-error",
        "Ce champ est requis. Veuillez sélectionner une réponse."
      );
      error = formDataElement.dataset.error;
    }
  }

  // CHECKBOX TERMS AND CONDITIONS
  // Check if input is checkbox and if it has data-required attribute and if it is not checked
  if (
    input.type === "checkbox" &&
    input.dataset.required !== undefined &&
    !input.checked
  ) {
    formDataElement.setAttribute(
      "data-error",
      "Veuillez accepter les conditions générales pour continuer."
    );
    error = formDataElement.dataset.error;
  }

  // If there is no error, remove message from error element and so data-error attribute
  // and set data-error-visible attribute to false
  if (!error) {
    formDataElement.setAttribute("data-error-visible", "false");
    error = "";
    formDataElement.setAttribute("data-error", "");
  } else {
    formDataElement.setAttribute("data-error-visible", "true");
  }
  return error;
}

// ============================
// ======== SUBMITFORM ========
// ============================

// all inputs are passed as argument with bind to loop through inputs

/**
   * Submits the form on click on the submit button and calls validateInput() on each input element
   * @param {NodeList} inputs List of all the inputs of the form by id/class (ex: input#first.text-control)
   * @param {MouseEvent} event
   */
function submitForm(inputs, event) {
  event.preventDefault();
  errors = [];

  inputs.forEach((input) => {
    const error = validateInput(input);
    if (error) {
      errors.push(error);
    }
  });

  // Check if errors array is empty and only in that case, form is submited
  if (errors.length === 0) {
    // reset the form
    formElement.reset();

    confirmSubmission();
  }
}

// =========================
// === CONFIRM SUBMISSION ===
// ==========================

/**
 * Displays the confirmation message after submitting the form
 */
function confirmSubmission() {
  // hide the form content
  formElement.style.display = "none";

  // Display a message after form validation success
  // 1. Create a div element
  const divElement = document.createElement("div");
  divElement.className = "modal-confirm";

  // 2. Put a p element into the div element
  const pElement = document.createElement("p");
  pElement.textContent = "Merci d'avoir validé votre inscription";

  divElement.appendChild(pElement);

  // Add a button for closing the confirmation modal
  const buttonElement = document.createElement("input");
  buttonElement.classList.add("btn-submit", "btn-close-modal");
  buttonElement.setAttribute("type", "button");
  buttonElement.setAttribute("value", "Fermer");

  divElement.appendChild(buttonElement);

  // Put the div element into the modal body
  modalBodyElement.appendChild(divElement);

  closeModalCrossElement.addEventListener("click", closeConfirmModal);

  const btnCloseModalElement = document.querySelector(".btn-close-modal");
  btnCloseModalElement.addEventListener("click", closeConfirmModal);
}

// ==================================
// === Modal confirmation closing ===
// ==================================

/**
 * Close the confirmation modal
 */
function closeConfirmModal() {
  if(modalBodyElement.querySelector("p")) {
  // Select and remove the p Element
  modalBodyElement.querySelector("p").remove();
  
    // Remove the button Element
    modalBodyElement.querySelector(".btn-close-modal").remove();
    // Remove the div Element
    modalBodyElement.querySelector(".modal-confirm").remove();
    // close the modal
    modalbg.style.display = "none";
  }
}
