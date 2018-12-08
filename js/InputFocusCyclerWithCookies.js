class InputFocusCyclerWithCookies extends InputFocusCycler {
  constructor(elems, keycode, maxWeeks = 1) {
    super(elems, keycode)
    this.maxAge = `max-age=${60 * 60 * 24 * 7 * maxWeeks}; `
    this.loadInputs()
  }
  
  saveInputs() {
    this.elems.forEach(input => {
      document.cookie = `input-${input.className}=${input.value}`
    })
    document.cookie = this.maxAge
    document.cookie = 'samesite'
  }
  
  loadInputs() {
    this.elems.forEach(input => {
      let value = document.cookie.match(
        '(?:^|;) ?' + `input-${input.className}` + '=([^;]*)(?:;|$)'
      )
      if (value) {
        input.value = value[1]
      }
    })
  }
  
  applyCycling() {
    super.applyCycling()
    const that = this
    this.elems.forEach(input => {
      input.addEventListener('blur', that.saveInputs.bind(that))
    })
  }
}
