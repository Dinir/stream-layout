class InputFocusCyclerWithCookies extends InputFocusCycler {
  constructor(elems, keycode, maxWeeks = 1) {
    super(elems, keycode)
    this.maxWeeks = maxWeeks
    this.loadInputs()
  }
  
  get expiresOn() {
    const theDate = new Date()
    theDate.setDate(theDate.getDate() + this.maxWeeks * 7)
    
    return `expires=${theDate.toUTCString()}`
  }
  
  saveInputs() {
    this.elems.forEach(input => {
      document.cookie = `input-${input.className}=${input.value}`
    })
    document.cookie = this.expiresOn
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
