function Validation(options) {
  let defaultOptions = {
    errorSelector: '.fg-error-mg-validate',
    classError: 'fg-invalid-validate',
    formGroupSelector: '.fg-validate'
  }

  function getParentElement(element, selector) {
    while (element.parentElement) {
      if (element.parentElement.matches(selector)) {
        return element.parentElement;
      }
      element = element.parentElement;
    }
  }

  function getErrorElement(element) {
    let formGroupElement = getParentElement(element, options.formGroupSelector);
    return formGroupElement.querySelector(options.errorSelector);
  }

  options = { ...defaultOptions, ...options };

  const formElement = document.querySelector(options.form);
  const queryOne = formElement.querySelector.bind(formElement);
  const queryAll = formElement.querySelectorAll.bind(formElement);

  let selectorRules = {};

  function getValueFromControl(control) {
    if (control.type === 'checkbox') {
      const array = [];
      const elements = queryAll(control.selector);
      for (let i = 0; i < elements.length; i++) {
        if (elements[i].checked) {
          array.push(elements[i].value);
        }
      }
      return {
        name: elements[0].name,
        value: array
      }

    } else if (control.type === 'radio') {
      const elements = queryAll(control.selector);
      let value = null;
      for (let i = 0; i < elements.length; i++) {
        if (elements[i].checked) {
          value = elements[i].value;
        }
      }
      return {
        name: elements[0].name,
        value: value
      }
    } else if (control.type === 'file') {
      const element = queryOne(control.selector);
      const value = element.files.length > 0 ? element.files : null;
      return {
        name: element.name,
        value: value
      }
    } else if (control.type === 'select') {
      const element = queryOne(control.selector);
      console.log({element}, element.value);
      const value = element.value;
      return {
        name: element.name,
        value: value
      }
    } else {
      const element = queryOne(control.selector);
      const value = element.value;
      return {
        name: element.name,
        value: element.value
      }
    }
  }

  function regexValidator(value, regex, message) {
    if (typeof message === 'undefined') {
      message = 'Invalid format';
    }
    return regex.test(value) ? '' : message;
  }

  function addEventBlur(inputElement, rule) {
    if (inputElement) {
      inputElement.onblur = () => {
        validate(inputElement, rule);
      }
    }
  }

  function addEventInput(inputElement) {
    if (inputElement) {
      inputElement.oninput = () => {
        let formGroupElement = getParentElement(inputElement, options.formGroupSelector);
        let errorElement = formGroupElement.querySelector(options.errorSelector);
        errorElement.innerText = '';
        formGroupElement.classList.remove(options.classError);
      }
    }
  }

  function addEventChange(inputElement, rule) {
    if (inputElement) {
      inputElement.addEventListener('change', () => {
        validate(inputElement, rule);
      });
    }
  }

  let validate = (inputElement, elem) => {
    let formGroupElement = getParentElement(inputElement, options.formGroupSelector);
    let errorElement = formGroupElement.querySelector(options.errorSelector);
    let errorMessage = '';
    let rules = selectorRules[elem.selector];
    let valueElm = getValueFromControl(elem).value;

    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i];

      if (rule.regex instanceof RegExp) {
        errorMessage += regexValidator(valueElm, rule.regex, rule.message);
      }

      if (errorMessage.length === 0 && typeof rule.test === 'function') {
        const result = rule.test(valueElm)
        if (typeof result === 'string') {
          errorMessage += result;
        } else {
          if (result === false) {
            errorMessage += rule.message;
          }
        }
      }
    }

    if (errorMessage) {
      if (errorElement) {
        errorElement.innerText = errorMessage;
      }
      formGroupElement.classList.add(options.classError);
      return false
    } else {
      if (errorElement) {
        errorElement.innerText = '';
      }
      formGroupElement.classList.remove(options.classError);
      return true
    }
  }

  if (formElement) {
    options.rules.forEach(rule => {

      ruleTest = {}
      if (rule.regex) {
        ruleTest.regex = rule.regex;
      }
      if (rule.test) {
        ruleTest.test = rule.test;
      }
      if (rule.message) {
        ruleTest.message = rule.message;
      }
      if (Array.isArray(selectorRules[rule.selector])) {
        selectorRules[rule.selector].push(ruleTest);
      } else {
        selectorRules[rule.selector] = [ruleTest];
      }

      switch (rule.type) {
        case 'radio':
        case 'checkbox': {
          const elements = queryAll(rule.selector)
          for (let i = 0; i < elements.length; i++) {
            addEventInput(elements[i]);
            addEventChange(elements[i], rule);
          }
          break
        }
        case 'file': {
          let inputElement = queryOne(rule.selector)
          addEventInput(inputElement);
          addEventChange(inputElement, rule);

          break
        }
        case 'select': {
          let selectElement = queryOne(rule.selector);
          addEventChange(selectElement, rule);
          break;
        }
        default: {
          let inputElement = queryOne(rule.selector);
          addEventBlur(inputElement, rule);
          addEventInput(inputElement);
        }
      }
    })

    formElement.onsubmit = (e) => {
      e.preventDefault();

      let firstInvalidInput = null;

      let isFormValid = true;

      options.rules.forEach((rule) => {
        let isValid = false;
        switch (rule.type) {
          case 'radio':
          case 'checkbox': {
            const elements = queryAll(rule.selector);
            for (let i = 0; i < elements.length; i++) {
              isValid = validate(elements[i], rule);

              if (!isValid && !firstInvalidInput) {
                firstInvalidInput = elements[i];
              }
            }
            break
          }
          case 'file': {
            let inputElement = queryOne(rule.selector);
            isValid = validate(inputElement, rule);

            if (!isValid && !firstInvalidInput) {
              firstInvalidInput = inputElement;
            }
            break
          }
          default: {
            let inputElement = queryOne(rule.selector);
            isValid = validate(inputElement, rule);

            if (!isValid && !firstInvalidInput) {
              firstInvalidInput = inputElement;
            }
          }
        }
        if (!isValid) {
          isFormValid = false;
        }
      })

      if (!isFormValid && firstInvalidInput) {
        firstInvalidInput.focus();
      }

      if (isFormValid) {
        if (typeof (options.onSubmit) === 'function') {
          const formValues = {};
          options.rules.forEach((rule) => {
            const { name, value } = getValueFromControl(rule);
            formValues[name] = value;
          })
          return options.onSubmit(formValues);
        } else {
          formElement.submit();
        }
      }
    }
  }
}