function Validation(options) {
  let defaultOptions = {
    errorSelector: '.error-message',
    classError: 'invalid'
  }
  options = { ...defaultOptions, ...options }

  const formElement = document.querySelector(options.form)
  const queryOne = formElement.querySelector.bind(formElement)

  let selectorRules = {}

  let validate = (inputElement, rule) => {
    let errorElement = inputElement.parentElement.querySelector(options.errorSelector)
    let errorMessage
    let rules = selectorRules[rule.selector]

    for (let i = 0; i < rules.length; i++) {
      errorMessage = rules[i](inputElement.value)
      if (errorMessage) break
    }
    if (errorMessage) {
      errorElement.innerText = errorMessage
      errorElement.parentElement.classList.add(options.classError)
    } else {
      errorElement.innerText = ''
      errorElement.parentElement.classList.remove(options.classError)
    }
  }

  if (formElement) {
    options.rules.forEach(rule => {

      if (Array.isArray(selectorRules[rule.selector])) {
        selectorRules[rule.selector].push(rule.test)
      } else {
        selectorRules[rule.selector] = [rule.test]
      }

      var inputElement = queryOne(rule.selector)

      if (inputElement) {

        inputElement.onblur = () => {
          validate(inputElement, rule)
        }

        inputElement.oninput = () => {
          validate(inputElement, rule)
        }
      }
    })
    console.log(selectorRules)
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
