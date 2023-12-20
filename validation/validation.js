function Validation(options) {
  let defaultOptions = {
    errorSelector: '.error-message',
    classError: 'invalid',
    formGroupSelector: '.form-group'
  }

  function getParentElement(element, selector) {
    while (element.parentElement) {
      if (element.parentElement.matches(selector)) {
        return element.parentElement
      }
      element = element.parentElement
    }
  }

  function getErrorElement(element) {
    let formGroupElement = getParentElement(element, options.formGroupSelector)
    return formGroupElement.querySelector(options.errorSelector)
  }

  function regexValidator(value, regex, message) {
    if (typeof message === 'undefined') {
      message = 'Invalid format'
    }
    return regex.test(value) ? '' : message;
  }

  options = { ...defaultOptions, ...options }
  let formValues = {}

  const formElement = document.querySelector(options.form)
  const queryOne = formElement.querySelector.bind(formElement)
  const queryAll = formElement.querySelectorAll.bind(formElement)

  let selectorRules = {}

  let validate = (inputElement, elem) => {
    let formGroupElement = getParentElement(inputElement, options.formGroupSelector)
    let errorElement = formGroupElement.querySelector(options.errorSelector)
    let errorMessage = ''
    let rules = selectorRules[elem.selector]

    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i]

      if (rule.regex instanceof RegExp) {
        errorMessage += regexValidator(inputElement.value, rule.regex, rule.message)
      }

      if (errorMessage.length === 0 && typeof rule.test === 'function') {
        errorMessage += rule.test(inputElement.value)
      }
    }

    if (errorMessage) {
      errorElement.innerText = errorMessage
      formGroupElement.classList.add(options.classError)
      return false
    } else {
      errorElement.innerText = ''
      formGroupElement.classList.remove(options.classError)
      return true
    }
  }

  if (formElement) {
    options.rules.forEach(rule => {

      ruleTest = {}
      if (rule.regex) {
        ruleTest.regex = rule.regex
      }
      if (rule.test) {
        ruleTest.test = rule.test
      }
      if (rule.message) {
        ruleTest.message = rule.message
      }
      if (Array.isArray(selectorRules[rule.selector])) {
        selectorRules[rule.selector].push(ruleTest)
      } else {
        selectorRules[rule.selector] = [ruleTest]
      }

      let inputElement = queryOne(rule.selector)

      if (inputElement) {

        inputElement.onblur = () => {
          validate(inputElement, rule)
        }

        inputElement.oninput = () => {
          let formGroupElement = getParentElement(inputElement, options.formGroupSelector)
          let errorElement = formGroupElement.querySelector(options.errorSelector)
          errorElement.innerText = ''
          formGroupElement.classList.remove(options.classError)
        }
      }
    })

    formElement.onsubmit = (e) => {
      e.preventDefault()

      let firstInvalidInput = null;

      let isFormValid = true

      options.rules.forEach((rule) => {
        let inputElement = queryOne(rule.selector)
        let isValid = validate(inputElement, rule);

        if (!isValid && !firstInvalidInput) {
          firstInvalidInput = inputElement;
        }

        if (!isValid) {
          isFormValid = false
        }
      })

      if (!isFormValid && firstInvalidInput) {
        firstInvalidInput.focus();
      }

      if (isFormValid) {
        if (typeof (options.onSubmit) === 'function') {
          let inputElements = queryAll('[name]:not([disabled])')
          Array.from(inputElements).forEach((input) => {
            formValues[input.name] = input.value
          })
          return options.onSubmit(formValues)
        } else {
          formElement.submit()
        }
      }
    }
  }
}
