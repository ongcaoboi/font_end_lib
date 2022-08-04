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
  options = { ...defaultOptions, ...options }
  let formValues = {}

  const formElement = document.querySelector(options.form)
  const queryOne = formElement.querySelector.bind(formElement)
  const queryAll = formElement.querySelectorAll.bind(formElement)

  let selectorRules = {}

  let validate = (inputElement, rule) => {
    let formGroupElement = getParentElement(inputElement, options.formGroupSelector)
    let errorElement = formGroupElement.querySelector(options.errorSelector)
    let errorMessage = ''
    let rules = selectorRules[rule.selector]

    for (let i = 0; i < rules.length; i++) {
      errorMessage = rules[i](inputElement.value)
      if (errorMessage) break
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

      if (Array.isArray(selectorRules[rule.selector])) {
        selectorRules[rule.selector].push(rule.test)
      } else {
        selectorRules[rule.selector] = [rule.test]
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

      let isFormValid = true

      options.rules.forEach((rule) => {
        let inputElement = queryOne(rule.selector)
        let isValid = validate(inputElement, rule)
        if (!isValid) {
          isFormValid = false
        }
      })

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

Validation.isRequire = (selector, message) => {
  return {
    selector: selector,
    test: (value) => {
      return value.trim() ? undefined : message || "Please enter this field!"
    }
  }
}

Validation.maxLength = (selector, max, message) => {
  return {
    selector: selector,
    test: (value) => {
      return value.length > max ? undefined : message || `This field max length ${max} charactor!`
    }
  }
}
