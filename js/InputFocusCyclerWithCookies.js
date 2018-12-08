class InputFocusCyclerWithCookies extends InputFocusCycler {
  constructor(elems, keycode, maxWeeks = 1) {
    super(elems, keycode)
    this.maxAge = `max-age=${60 * 60 * 24 * 7 * maxWeeks}; `
    this.loadInputs()
  }
  
  saveInputs() {
    this.elems.forEach(input => {
      const cookieEntry =
      `input-${input.className}=` +
      `${input.value}; `
      document.cookie = `${cookieEntry}${this.maxAge}samesite; `
    })
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
  
  setIndex(focusEvent) {
    super.setIndex(focusEvent)
    this.saveInputs()
  }
}
